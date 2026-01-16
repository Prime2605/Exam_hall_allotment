"""
GCE Erode Exam Seating System - Flask API
BookMyShow-style seating with zigzag allocation
"""

from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from models import db, Student, Hall, Block, Department, Exam, Allotment, seed_database
from services.parser import parser_service
from services.logic import run_allotment
from datetime import datetime
import os
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///exam_hall.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for React frontend
CORS(app, origins=['http://localhost:5173', 'http://localhost:3000'])

db.init_app(app)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
REPORT_DIR = os.path.join(os.path.dirname(__file__), 'reports')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)

# ======================= API ROUTES =======================

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'GCE Erode Exam API Running'})


@app.route('/api/students', methods=['GET'])
def get_students():
    """Get all students with optional filters"""
    dept = request.args.get('department')
    year = request.args.get('year')
    search = request.args.get('search')
    subject_code = request.args.get('subject_code')
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 500))

    query = Student.query
    if dept:
        query = query.join(Department).filter(Department.abbr == dept)
    if year:
        query = query.filter(Student.year_joined == year)
    if search:
        query = query.filter(
            (Student.reg_no.contains(search)) | (Student.name.contains(search))
        )
    if subject_code:
        query = query.filter(Student.subjects_registered.contains(subject_code))

    students = query.order_by(Student.roll_no).offset(skip).limit(limit).all()

    if search or subject_code or 'skip' in request.args or 'limit' in request.args:
        return jsonify([
            {
                'id': s.id,
                'reg_no': s.reg_no,
                'name': s.name,
                'department': s.dept.name if s.dept else None,
                'year': s.year_joined,
                'subjects_registered': s.subjects_registered.split(',') if s.subjects_registered else []
            }
            for s in students
        ])

    return jsonify({
        'count': len(students),
        'students': [s.to_dict() for s in students]
    })


@app.route('/api/students/<reg_no>', methods=['GET'])
def get_student(reg_no):
    """Get student by register number or roll number"""
    student = Student.query.filter(
        (Student.reg_no == reg_no) | (Student.roll_no == reg_no.upper())
    ).first()
    
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    return jsonify(student.to_dict())


@app.route('/api/blocks', methods=['GET'])
def get_blocks():
    """Get all blocks with their halls"""
    blocks = Block.query.all()
    return jsonify({
        'count': len(blocks),
        'blocks': [b.to_dict() for b in blocks]
    })


@app.route('/api/halls', methods=['GET'])
def get_halls():
    """Get all halls with optional block filter"""
    block_key = request.args.get('block')
    
    query = Hall.query
    if block_key:
        query = query.join(Block).filter(Block.key == block_key)
    
    halls = query.all()
    return jsonify({
        'count': len(halls),
        'halls': [h.to_dict() for h in halls]
    })


@app.route('/api/halls', methods=['POST'])
def create_hall():
    data = request.get_json(force=True)
    name = data.get('name')
    capacity = data.get('capacity')
    block_key = data.get('blockKey')

    if not name or not capacity:
        return jsonify({'error': 'name and capacity are required'}), 400

    if Hall.query.filter_by(name=name).first():
        return jsonify({'error': 'Hall already exists'}), 400

    block = None
    if block_key:
        block = Block.query.filter_by(key=block_key).first()
    if not block:
        block = Block.query.filter_by(key='T').first() or Block.query.first()

    if not block:
        return jsonify({'error': 'No blocks available'}), 400

    hall = Hall(name=name, block_id=block.id, capacity=int(capacity))
    db.session.add(hall)
    db.session.commit()

    return jsonify(hall.to_dict()), 201


@app.route('/api/halls/<int:hall_id>', methods=['DELETE'])
def delete_hall(hall_id):
    hall = Hall.query.get(hall_id)
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404

    db.session.delete(hall)
    db.session.commit()
    return jsonify({'message': 'Hall deleted'})


@app.route('/api/halls/<hall_name>/seats', methods=['GET'])
def get_hall_seats(hall_name):
    """Get 5x5 seat grid for a specific hall"""
    hall = Hall.query.filter_by(name=hall_name).first()
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    # Create 5x5 grid (25 seats)
    seats = [None] * 25
    for student in hall.seats:
        if student.seat is not None:
            seats[student.seat] = student.to_dict()
    
    return jsonify({
        'hall': hall.to_dict(),
        'seats': seats
    })


@app.route('/api/allocate', methods=['POST'])
def allocate_seats():
    """Run zigzag allocation algorithm"""
    # Reset all allocations
    Student.query.update({'hall_id': None, 'seat': None, 'seat_label': None})
    db.session.commit()
    
    # Allocation pattern: pair departments for zigzag
    allocation_pattern = [
        {'hall': 'T 1', 'deptA': 'AUTO', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'T 2', 'deptA': 'AUTO', 'countA': 12, 'deptB': 'ECE', 'countB': 13},
        {'hall': 'T 3', 'deptA': 'AUTO', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'EEE1', 'deptA': 'CSE', 'countA': 13, 'deptB': 'EEE', 'countB': 12},
        {'hall': 'EEE2', 'deptA': 'CSE', 'countA': 12, 'deptB': 'EEE', 'countB': 13},
        {'hall': 'EEE3', 'deptA': 'CSE', 'countA': 13, 'deptB': 'EEE', 'countB': 12},
        {'hall': 'CT 10', 'deptA': 'CSE', 'countA': 12, 'deptB': 'EEE', 'countB': 13},
        {'hall': 'CT 11', 'deptA': 'CIVIL', 'countA': 12, 'deptB': 'IT', 'countB': 13},
        {'hall': 'CT 12', 'deptA': 'CIVIL', 'countA': 13, 'deptB': 'IT', 'countB': 12},
        {'hall': 'M - 2', 'deptA': 'CIVIL', 'countA': 12, 'deptB': 'IT', 'countB': 13},
        {'hall': 'M - 3', 'deptA': 'CIVIL', 'countA': 13, 'deptB': 'IT', 'countB': 12},
        {'hall': 'M - 6', 'deptA': 'MECH', 'countA': 13, 'deptB': 'CSEDS', 'countB': 12},
        {'hall': 'AH1', 'deptA': 'MECH', 'countA': 12, 'deptB': 'CSEDS', 'countB': 13},
        {'hall': 'AH2', 'deptA': 'MECH', 'countA': 13, 'deptB': 'CSEDS', 'countB': 12},
        {'hall': 'AH3', 'deptA': 'MECH', 'countA': 12, 'deptB': 'CSEDS', 'countB': 13},
    ]
    
    allocated_count = 0
    
    for pattern in allocation_pattern:
        hall = Hall.query.filter_by(name=pattern['hall']).first()
        if not hall:
            continue
        
        # Get unallocated students from each department
        dept_a = Department.query.filter_by(abbr=pattern['deptA']).first()
        dept_b = Department.query.filter_by(abbr=pattern['deptB']).first()
        
        if not dept_a or not dept_b:
            continue
        
        students_a = Student.query.filter_by(
            department_id=dept_a.id, hall_id=None
        ).limit(pattern['countA']).all()
        
        students_b = Student.query.filter_by(
            department_id=dept_b.id, hall_id=None
        ).limit(pattern['countB']).all()
        
        idx_a, idx_b = 0, 0
        
        # Zigzag allocation: column by column
        for col in range(5):
            for row in range(5):
                seat_index = row * 5 + col
                
                if (row + col) % 2 == 0:  # Even = Dept A
                    if idx_a < len(students_a):
                        student = students_a[idx_a]
                        student.hall_id = hall.id
                        student.seat = seat_index
                        student.seat_label = f"{dept_a.abbr} {str(idx_a + 1).zfill(2)}"
                        idx_a += 1
                        allocated_count += 1
                else:  # Odd = Dept B
                    if idx_b < len(students_b):
                        student = students_b[idx_b]
                        student.hall_id = hall.id
                        student.seat = seat_index
                        student.seat_label = f"{dept_b.abbr} {str(idx_b + 1).zfill(2)}"
                        idx_b += 1
                        allocated_count += 1
    
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'Allocated {allocated_count} students',
        'count': allocated_count
    })


@app.route('/api/allot', methods=['POST'])
def trigger_allotment():
    """Run exam-based allotment algorithm."""
    date_str = request.args.get('date')
    session_str = request.args.get('session')
    result = run_allotment(date_str=date_str, session_str=session_str)
    return jsonify(result)


@app.route('/api/allotments', methods=['GET'])
def get_allotments():
    allotments = Allotment.query.all()
    data = []
    for allotment in allotments:
        data.append({
            'id': allotment.id,
            'student_reg': allotment.student.reg_no,
            'student_name': allotment.student.name,
            'exam_subject': allotment.exam_ref.subject_code,
            'exam_date': str(allotment.exam_ref.date),
            'hall_name': allotment.hall.name,
            'seat_number': allotment.seat_number
        })
    return jsonify(data)


@app.route('/api/exams', methods=['GET'])
def get_exams():
    subject_code = request.args.get('subject_code')
    date = request.args.get('date')
    session = request.args.get('session')
    skip = int(request.args.get('skip', 0))
    limit = int(request.args.get('limit', 2000))

    query = Exam.query
    if subject_code:
        query = query.filter(Exam.subject_code.contains(subject_code))
    if date:
        query = query.filter(Exam.date == date)
    if session:
        query = query.filter(Exam.session == session)

    exams = query.offset(skip).limit(limit).all()
    return jsonify([e.to_dict() for e in exams])


@app.route('/api/upload/timetable', methods=['POST'])
def upload_timetable():
    files = request.files.getlist('files')
    if not files:
        return jsonify({'status': 'error', 'message': 'No files uploaded'}), 400

    total_parsed = 0
    total_saved = 0

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)

        try:
            data = parser_service.parse_timetable(file_path)
            total_parsed += len(data)

            for item in data:
                existing = Exam.query.filter_by(subject_code=item['subject_code']).first()
                if existing:
                    continue

                date_str = item['date']
                parsed_date = None
                for fmt in ["%d-%b-%y", "%d-%b-%Y", "%d-%m-%Y", "%d/%m/%Y"]:
                    try:
                        parsed_date = datetime.strptime(date_str, fmt).date()
                        if parsed_date.year < 100:
                            parsed_date = parsed_date.replace(year=parsed_date.year + 2000)
                        break
                    except ValueError:
                        continue

                if not parsed_date:
                    continue

                new_exam = Exam(
                    date=parsed_date,
                    session=item['session'],
                    subject_code=item['subject_code'],
                    subject_name=item['subject_name']
                )
                db.session.add(new_exam)
                total_saved += 1

            db.session.commit()
        except Exception as exc:
            return jsonify({'status': 'error', 'message': str(exc)}), 500

    return jsonify({'status': 'success', 'parsed_count': total_parsed, 'saved_count': total_saved})


@app.route('/api/upload/students', methods=['POST'])
def upload_students():
    files = request.files.getlist('files')
    if not files:
        return jsonify({'status': 'error', 'message': 'No files uploaded'}), 400

    total_parsed = 0
    total_saved = 0

    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        file.save(file_path)

        try:
            data = parser_service.parse_student_list(file_path)
            total_parsed += len(data)

            for item in data:
                student = Student.query.filter_by(reg_no=item['reg_no']).first()
                if not student:
                    dept = Department.query.filter(Department.name.ilike(f"%{item.get('department', '')}%")).first()
                    if not dept:
                        dept = Department.query.first()

                    student = Student(
                        reg_no=item['reg_no'],
                        roll_no=item['reg_no'],
                        name=item['name'],
                        department_id=dept.id if dept else None,
                        year_joined='25',
                        year_of_study=1,
                        student_type='Regular'
                    )
                    db.session.add(student)
                    db.session.flush()
                    total_saved += 1

                current_subs = set(student.subjects_registered.split(',')) if student.subjects_registered else set()
                current_subs.update(item['registered_subjects'])
                student.subjects_registered = ','.join(sorted(filter(None, current_subs)))

            db.session.commit()
        except Exception as exc:
            return jsonify({'status': 'error', 'message': str(exc)}), 500

    return jsonify({'status': 'success', 'parsed_count': total_parsed, 'saved_count': total_saved})


@app.route('/api/reset', methods=['POST'])
def reset_allocation():
    """Clear all seat allocations"""
    Student.query.update({'hall_id': None, 'seat': None, 'seat_label': None})
    db.session.commit()
    
    return jsonify({'success': True, 'message': 'All allocations cleared'})


@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get allocation statistics"""
    total_students = Student.query.count()
    allocated = Student.query.filter(Student.hall_id.isnot(None)).count()
    total_halls = Hall.query.count()
    total_exams = Exam.query.count()
    used_halls = Hall.query.filter(
        Hall.id.in_(
            db.session.query(Student.hall_id).filter(Student.hall_id.isnot(None)).distinct()
        )
    ).count()
    
    return jsonify({
        'totalStudents': total_students,
        'totalExams': total_exams,
        'total_exams': total_exams,
        'allocatedStudents': allocated,
        'totalHalls': total_halls,
        'total_halls': total_halls,
        'usedHalls': used_halls,
        'utilization': round((allocated / (used_halls * 25)) * 100) if used_halls > 0 else 0
    })


@app.route('/api/reports/excel', methods=['GET'])
def export_excel():
    allotments = Allotment.query.all()
    data = []
    for allotment in allotments:
        data.append({
            'Reg No': allotment.student.reg_no,
            'Name': allotment.student.name,
            'Subject Code': allotment.exam_ref.subject_code,
            'Subject Name': allotment.exam_ref.subject_name,
            'Date': str(allotment.exam_ref.date),
            'Session': allotment.exam_ref.session,
            'Hall': allotment.hall.name,
            'Seat': allotment.seat_number
        })

    df = pd.DataFrame(data)
    file_path = os.path.join(REPORT_DIR, 'allotment_report.xlsx')
    df.to_excel(file_path, index=False)

    return send_file(
        file_path,
        as_attachment=True,
        download_name='allotment_report.xlsx',
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )


@app.route('/api/reports/pdf', methods=['GET'])
def export_pdf():
    allotments = Allotment.query.all()
    file_path = os.path.join(REPORT_DIR, 'allotment_report.pdf')

    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    c.setFont('Helvetica-Bold', 16)
    c.drawString(50, height - 50, 'Exam Seat Allotment Report')

    y = height - 80
    c.setFont('Helvetica-Bold', 10)
    c.drawString(50, y, 'Reg No')
    c.drawString(150, y, 'Name')
    c.drawString(300, y, 'Subject')
    c.drawString(400, y, 'Hall')
    c.drawString(500, y, 'Seat')
    y -= 20
    c.setFont('Helvetica', 10)

    for allotment in allotments:
        if y < 50:
            c.showPage()
            y = height - 50
            c.setFont('Helvetica', 10)

        c.drawString(50, y, str(allotment.student.reg_no))
        name = allotment.student.name[:25] + '...' if len(allotment.student.name) > 25 else allotment.student.name
        c.drawString(150, y, name)
        c.drawString(300, y, str(allotment.exam_ref.subject_code))
        c.drawString(400, y, str(allotment.hall.name))
        c.drawString(500, y, str(allotment.seat_number))
        y -= 15

    c.save()
    return send_file(file_path, as_attachment=True, download_name='allotment_report.pdf', mimetype='application/pdf')


# ======================= INIT =======================

def init_db():
    """Initialize database and seed data"""
    with app.app_context():
        print("🔄 Creating database tables...")
        db.create_all()
        
        # Only seed if empty
        if Student.query.count() == 0:
            print("🌱 Seeding database...")
            seed_database()
        else:
            print(f"📊 Database has {Student.query.count()} students")
        
        # Auto-allocate if no students have seats assigned
        allocated = Student.query.filter(Student.hall_id.isnot(None)).count()
        if allocated == 0 and Student.query.count() > 0:
            print("🪑 Auto-allocating seats...")
            auto_allocate_seats()
            print(f"✅ Auto-allocated seats for students")


def auto_allocate_seats():
    """Auto-allocate students to seats using zigzag pattern"""
    # Allocation pattern: pair departments for zigzag
    allocation_pattern = [
        {'hall': 'T 1', 'deptA': 'AUTO', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'T 2', 'deptA': 'AUTO', 'countA': 12, 'deptB': 'ECE', 'countB': 13},
        {'hall': 'T 3', 'deptA': 'AUTO', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'T 6 A', 'deptA': 'AUTO', 'countA': 12, 'deptB': 'ECE', 'countB': 13},
        {'hall': 'T 6 B', 'deptA': 'CSE', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'EEE1', 'deptA': 'CSE', 'countA': 13, 'deptB': 'EEE', 'countB': 12},
        {'hall': 'EEE2', 'deptA': 'CSE', 'countA': 12, 'deptB': 'EEE', 'countB': 13},
        {'hall': 'EEE3', 'deptA': 'CSE', 'countA': 13, 'deptB': 'EEE', 'countB': 12},
        {'hall': 'CT 10', 'deptA': 'CSE', 'countA': 12, 'deptB': 'EEE', 'countB': 13},
        {'hall': 'CT 11', 'deptA': 'CIVIL', 'countA': 12, 'deptB': 'IT', 'countB': 13},
        {'hall': 'CT 12', 'deptA': 'CIVIL', 'countA': 13, 'deptB': 'IT', 'countB': 12},
        {'hall': 'M - 2', 'deptA': 'CIVIL', 'countA': 12, 'deptB': 'IT', 'countB': 13},
        {'hall': 'M - 3', 'deptA': 'CIVIL', 'countA': 13, 'deptB': 'IT', 'countB': 12},
        {'hall': 'M - 6', 'deptA': 'MECH', 'countA': 13, 'deptB': 'CSEDS', 'countB': 12},
        {'hall': 'AH1', 'deptA': 'MECH', 'countA': 12, 'deptB': 'CSEDS', 'countB': 13},
        {'hall': 'AH2', 'deptA': 'MECH', 'countA': 13, 'deptB': 'CSEDS', 'countB': 12},
        {'hall': 'AH3', 'deptA': 'MECH', 'countA': 12, 'deptB': 'CSEDS', 'countB': 13},
        {'hall': 'A - 1', 'deptA': 'CSE', 'countA': 13, 'deptB': 'ECE', 'countB': 12},
        {'hall': 'A - 3', 'deptA': 'EEE', 'countA': 12, 'deptB': 'IT', 'countB': 13},
        {'hall': 'A - 4', 'deptA': 'MECH', 'countA': 13, 'deptB': 'AUTO', 'countB': 12},
    ]
    
    for pattern in allocation_pattern:
        hall = Hall.query.filter_by(name=pattern['hall']).first()
        if not hall:
            continue
        
        dept_a = Department.query.filter_by(abbr=pattern['deptA']).first()
        dept_b = Department.query.filter_by(abbr=pattern['deptB']).first()
        
        if not dept_a or not dept_b:
            continue
        
        students_a = Student.query.filter_by(
            department_id=dept_a.id, hall_id=None
        ).limit(pattern['countA']).all()
        
        students_b = Student.query.filter_by(
            department_id=dept_b.id, hall_id=None
        ).limit(pattern['countB']).all()
        
        idx_a, idx_b = 0, 0
        
        for col in range(5):
            for row in range(5):
                seat_index = row * 5 + col
                
                if (row + col) % 2 == 0:
                    if idx_a < len(students_a):
                        student = students_a[idx_a]
                        student.hall_id = hall.id
                        student.seat = seat_index
                        student.seat_label = f"{dept_a.abbr} {str(idx_a + 1).zfill(2)}"
                        idx_a += 1
                else:
                    if idx_b < len(students_b):
                        student = students_b[idx_b]
                        student.hall_id = hall.id
                        student.seat = seat_index
                        student.seat_label = f"{dept_b.abbr} {str(idx_b + 1).zfill(2)}"
                        idx_b += 1
    
    db.session.commit()


# ======================= NEW ALLOCATION APIs =======================

@app.route('/api/exams/dates', methods=['GET'])
def get_exam_dates():
    """Get unique exam dates with sessions for filters"""
    year = request.args.get('year')  # 1 or 2
    
    query = db.session.query(Exam.date, Exam.session).distinct()
    exams = query.order_by(Exam.date).all()
    
    result = []
    for date, session in exams:
        result.append({
            'date': str(date),
            'session': session,
            'display': f"{date.strftime('%b %d')} ({session})"
        })
    
    return jsonify(result)


@app.route('/api/allocation/stats', methods=['GET'])
def get_allocation_stats():
    """Get live hall fill statistics"""
    date = request.args.get('date')
    session = request.args.get('session')
    year = request.args.get('year', '2')
    
    halls = Hall.query.all()
    stats = []
    
    total_capacity = 0
    total_filled = 0
    
    for hall in halls:
        filled = Student.query.filter_by(hall_id=hall.id, year_of_study=int(year)).count()
        capacity = hall.capacity or 25
        total_capacity += capacity
        total_filled += filled
        
        stats.append({
            'hall_id': hall.id,
            'hall_name': hall.name,
            'block': hall.block.name if hall.block else 'Unknown',
            'capacity': capacity,
            'filled': filled,
            'percentage': round((filled / capacity) * 100) if capacity > 0 else 0
        })
    
    return jsonify({
        'halls': stats,
        'summary': {
            'total_halls': len(halls),
            'total_capacity': total_capacity,
            'total_filled': total_filled,
            'overall_percentage': round((total_filled / total_capacity) * 100) if total_capacity > 0 else 0
        }
    })


@app.route('/api/allocation/run', methods=['POST'])
def run_smart_allocation():
    """Run smart allocation for specific date/session/year"""
    data = request.get_json(force=True) or {}
    date = data.get('date')
    session = data.get('session', 'AN')
    year = int(data.get('year', 2))
    
    # Get exams for this date/session
    exams_query = Exam.query
    if date:
        exams_query = exams_query.filter(Exam.date == date)
    if session:
        exams_query = exams_query.filter(Exam.session == session)
    
    exams = exams_query.all()
    subject_codes = [e.subject_code for e in exams]
    
    # Reset allocations for this year
    Student.query.filter_by(year_of_study=year).update({
        'hall_id': None, 'seat': None, 'seat_label': None
    })
    db.session.commit()
    
    # Get students for this year who have exams today
    students_query = Student.query.filter_by(year_of_study=year)
    all_students = students_query.all()
    
    # Filter by subject codes
    eligible_students = []
    for s in all_students:
        if s.subjects_registered:
            registered = s.subjects_registered.split(',')
            if any(code in registered for code in subject_codes):
                eligible_students.append(s)
    
    # Get departments with student counts
    dept_students = {}
    for student in eligible_students:
        dept = student.dept.abbr if student.dept else 'UNKNOWN'
        if dept not in dept_students:
            dept_students[dept] = []
        dept_students[dept].append(student)
    
    # Define department pairs for zigzag
    dept_pairs = [
        ('CSE', 'ECE'), ('CSE', 'EEE'), ('IT', 'ECE'), ('IT', 'EEE'),
        ('MECH', 'CIVIL'), ('MECH', 'AUTO'), ('CIVIL', 'AUTO'),
        ('EEE', 'ECE'), ('CSE', 'IT'), ('MECH', 'EEE')
    ]
    
    # Get available halls
    halls = Hall.query.all()
    hall_idx = 0
    allocated_count = 0
    
    # Allocate each pair to halls
    for dept_a, dept_b in dept_pairs:
        if dept_a not in dept_students or dept_b not in dept_students:
            continue
        
        students_a = [s for s in dept_students[dept_a] if s.hall_id is None]
        students_b = [s for s in dept_students[dept_b] if s.hall_id is None]
        
        while students_a or students_b:
            if hall_idx >= len(halls):
                break
            
            hall = halls[hall_idx]
            hall_idx += 1
            
            # Take up to 13 from A and 12 from B (or vice versa)
            take_a = min(13, len(students_a))
            take_b = min(12, len(students_b))
            
            batch_a = students_a[:take_a]
            batch_b = students_b[:take_b]
            students_a = students_a[take_a:]
            students_b = students_b[take_b:]
            
            # Allocate zigzag pattern
            idx_a, idx_b = 0, 0
            for col in range(5):
                for row in range(5):
                    seat_index = row * 5 + col
                    
                    if (row + col) % 2 == 0:  # Department A seats
                        if idx_a < len(batch_a):
                            student = batch_a[idx_a]
                            student.hall_id = hall.id
                            student.seat = seat_index
                            student.seat_label = f"{dept_a[:3]} {str(idx_a + 1).zfill(2)}"
                            idx_a += 1
                            allocated_count += 1
                    else:  # Department B seats
                        if idx_b < len(batch_b):
                            student = batch_b[idx_b]
                            student.hall_id = hall.id
                            student.seat = seat_index
                            student.seat_label = f"{dept_b[:3]} {str(idx_b + 1).zfill(2)}"
                            idx_b += 1
                            allocated_count += 1
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': f'Allocated {allocated_count} students to {hall_idx} halls',
        'allocated': allocated_count,
        'halls_used': hall_idx
    })


@app.route('/api/allocation/hall/<hall_name>', methods=['GET'])
def get_hall_allocation(hall_name):
    """Get detailed allocation for a specific hall with 5x5 grid"""
    year = request.args.get('year', '2')
    
    hall = Hall.query.filter_by(name=hall_name).first()
    if not hall:
        return jsonify({'error': 'Hall not found'}), 404
    
    # Get students in this hall
    students = Student.query.filter_by(hall_id=hall.id, year_of_study=int(year)).all()
    
    # Build 5x5 grid
    grid = [[None for _ in range(5)] for _ in range(5)]
    dept_colors = {
        'CSE': '#3B82F6', 'IT': '#F59E0B', 'ECE': '#06B6D4', 'EEE': '#10B981',
        'MECH': '#8B5CF6', 'CIVIL': '#F97316', 'AUTO': '#EC4899', 'CSEDS': '#6366F1'
    }
    
    for student in students:
        if student.seat is not None:
            row = student.seat // 5
            col = student.seat % 5
            dept = student.dept.abbr if student.dept else 'UNK'
            grid[row][col] = {
                'id': student.id,
                'roll_no': student.roll_no,
                'name': student.name,
                'department': dept,
                'seat_label': student.seat_label,
                'color': dept_colors.get(dept, '#6B7280')
            }
    
    return jsonify({
        'hall': {
            'id': hall.id,
            'name': hall.name,
            'block': hall.block.name if hall.block else 'Unknown',
            'capacity': hall.capacity or 25
        },
        'grid': grid,
        'filled': len(students),
        'percentage': round((len(students) / (hall.capacity or 25)) * 100)
    })


@app.route('/api/departments', methods=['GET'])
def get_departments():
    """Get all departments with student counts"""
    year = request.args.get('year')
    
    depts = Department.query.all()
    result = []
    
    for dept in depts:
        query = Student.query.filter_by(department_id=dept.id)
        if year:
            query = query.filter_by(year_of_study=int(year))
        count = query.count()
        
        result.append({
            'id': dept.id,
            'name': dept.name,
            'abbr': dept.abbr,
            'code': dept.code,
            'student_count': count
        })
    
    return jsonify(result)


if __name__ == '__main__':
    init_db()
    print("🚀 Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)

