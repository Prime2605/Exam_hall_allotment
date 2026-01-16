"""
GCE Erode Exam Seating System - Database Models
8 Departments × 4 Years × 66 Students = 2,112 Total
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# ======================= MODELS =======================

class Department(db.Model):
    __tablename__ = 'departments'
    
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(3), unique=True, nullable=False)  # 102, 103, etc.
    name = db.Column(db.String(50), nullable=False)
    abbr = db.Column(db.String(10), nullable=False)  # ECE, CSE, etc.
    color = db.Column(db.String(20), default='cyan')
    
    students = db.relationship('Student', backref='dept', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'abbr': self.abbr,
            'color': self.color
        }


class Block(db.Model):
    __tablename__ = 'blocks'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(10), unique=True, nullable=False)  # T, CT, EEE, etc.
    name = db.Column(db.String(50), nullable=False)
    icon = db.Column(db.String(10), default='🏢')
    color = db.Column(db.String(20), default='cyan')
    
    halls = db.relationship('Hall', backref='block_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'name': self.name,
            'icon': self.icon,
            'color': self.color,
            'halls': [h.name for h in self.halls]
        }


class Hall(db.Model):
    __tablename__ = 'halls'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(20), unique=True, nullable=False)  # T 1, CT 10, etc.
    block_id = db.Column(db.Integer, db.ForeignKey('blocks.id'), nullable=False)
    capacity = db.Column(db.Integer, default=25)
    
    seats = db.relationship('Student', backref='hall_ref', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'block': self.block_ref.name if self.block_ref else None,
            'blockKey': self.block_ref.key if self.block_ref else None,
            'capacity': self.capacity,
            'filled': len([s for s in self.seats if s.seat is not None]),
            'departments': list(set([s.dept.abbr for s in self.seats if s.seat is not None]))
        }


class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    reg_no = db.Column(db.String(15), unique=True, nullable=False)  # 731124106001
    roll_no = db.Column(db.String(15), nullable=False)  # 24ECE01
    name = db.Column(db.String(100), nullable=False)
    
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    year_joined = db.Column(db.String(2), nullable=False)  # 22, 23, 24, 25
    year_of_study = db.Column(db.Integer, nullable=False)  # 1, 2, 3, 4
    student_type = db.Column(db.String(20), default='Regular')  # Regular, Lateral, Transfer
    subjects_registered = db.Column(db.Text, nullable=True)  # Comma-separated subject codes
    
    hall_id = db.Column(db.Integer, db.ForeignKey('halls.id'), nullable=True)
    seat = db.Column(db.Integer, nullable=True)  # 0-24 for 5x5 grid
    seat_label = db.Column(db.String(20), nullable=True)  # ECE 01
    
    def to_dict(self):
        row = (self.seat // 5) + 1 if self.seat is not None else None
        col = (self.seat % 5) + 1 if self.seat is not None else None
        
        return {
            'id': self.id,
            'regNo': self.reg_no,
            'rollNo': self.roll_no,
            'name': self.name,
            'department': self.dept.abbr if self.dept else None,
            'color': self.dept.color if self.dept else 'gray',
            'yearJoined': self.year_joined,
            'yearOfStudy': self.year_of_study,
            'studentType': self.student_type,
            'subjectsRegistered': self.subjects_registered.split(',') if self.subjects_registered else [],
            'hall': self.hall_ref.name if self.hall_ref else None,
            'block': self.hall_ref.block_ref.name if self.hall_ref and self.hall_ref.block_ref else None,
            'blockKey': self.hall_ref.block_ref.key if self.hall_ref and self.hall_ref.block_ref else None,
            'seat': self.seat,
            'seatLabel': self.seat_label,
            'seatCode': f'R{row}C{col}' if row and col else None,
            'row': row,
            'col': col
        }


class Exam(db.Model):
    __tablename__ = 'exams'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False)
    session = db.Column(db.String(5), nullable=False)  # FN or AN
    subject_code = db.Column(db.String(20), nullable=False, index=True)
    subject_name = db.Column(db.String(200), nullable=False)

    allotments = db.relationship('Allotment', backref='exam_ref', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'date': str(self.date),
            'session': self.session,
            'subject_code': self.subject_code,
            'subject_name': self.subject_name
        }


class Allotment(db.Model):
    __tablename__ = 'allotments'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    exam_id = db.Column(db.Integer, db.ForeignKey('exams.id'), nullable=False)
    hall_id = db.Column(db.Integer, db.ForeignKey('halls.id'), nullable=False)
    seat_number = db.Column(db.Integer, nullable=False)

    student = db.relationship('Student', backref='allotments', lazy=True)
    hall = db.relationship('Hall', backref='allotments', lazy=True)

    __table_args__ = (db.UniqueConstraint('student_id', 'exam_id', name='_student_exam_uc'),)


# ======================= SEED DATA =======================

DEPARTMENTS = [
    {'code': '102', 'name': 'Automobile Engineering', 'abbr': 'AUTO', 'color': 'orange'},
    {'code': '103', 'name': 'Civil Engineering', 'abbr': 'CIVIL', 'color': 'teal'},
    {'code': '104', 'name': 'Computer Science Engineering', 'abbr': 'CSE', 'color': 'blue'},
    {'code': '105', 'name': 'Electrical & Electronics Engineering', 'abbr': 'EEE', 'color': 'green'},
    {'code': '106', 'name': 'Electronics & Communication Engineering', 'abbr': 'ECE', 'color': 'cyan'},
    {'code': '114', 'name': 'Mechanical Engineering', 'abbr': 'MECH', 'color': 'purple'},
    {'code': '159', 'name': 'CSE (Data Science)', 'abbr': 'CSEDS', 'color': 'pink'},
    {'code': '205', 'name': 'Information Technology', 'abbr': 'IT', 'color': 'gold'},
]

BLOCKS = [
    {'key': 'T', 'name': 'T Block', 'icon': '🏢', 'color': 'orange', 
     'halls': ['T 1', 'T 2', 'T 3', 'T 6 A', 'T 6 B']},
    {'key': 'CT', 'name': 'CT Block', 'icon': '📡', 'color': 'cyan',
     'halls': ['CT 10', 'CT 11', 'CT 12']},
    {'key': 'EEE', 'name': 'EEE Block', 'icon': '⚡', 'color': 'green',
     'halls': ['EEE1', 'EEE2', 'EEE3']},
    {'key': 'M', 'name': 'M Block', 'icon': '⚙️', 'color': 'purple',
     'halls': ['M - 2', 'M - 3', 'M - 6']},
    {'key': 'AH', 'name': 'AH Block', 'icon': '🔧', 'color': 'pink',
     'halls': ['AH1', 'AH2', 'AH3']},
    {'key': 'A', 'name': 'A Block', 'icon': '📚', 'color': 'gold',
     'halls': ['A - 1', 'A - 3', 'A - 4']},
]

YEARS = ['22', '23', '24', '25']  # 4th, 3rd, 2nd, 1st year
CLASS_STRENGTH = 66


def seed_database():
    """Seed database with departments, blocks, halls, and 2,112 students"""
    
    # Clear existing data
    Student.query.delete()
    Hall.query.delete()
    Block.query.delete()
    Department.query.delete()
    
    # Seed departments
    dept_map = {}
    for d in DEPARTMENTS:
        dept = Department(**d)
        db.session.add(dept)
        db.session.flush()
        dept_map[d['code']] = dept
    
    # Seed blocks and halls
    for b in BLOCKS:
        block = Block(key=b['key'], name=b['name'], icon=b['icon'], color=b['color'])
        db.session.add(block)
        db.session.flush()
        
        for hall_name in b['halls']:
            hall = Hall(name=hall_name, block_id=block.id, capacity=25)
            db.session.add(hall)
    
    # Seed students: 8 depts × 4 years × 66 = 2,112
    for year in YEARS:
        for dept_data in DEPARTMENTS:
            dept = dept_map[dept_data['code']]
            
            # CSE DS (159) only exists for 1st year (2025)
            if dept_data['code'] == '159' and year != '25':
                continue
            
            # Generate 66 students per class
            for i in range(1, CLASS_STRENGTH + 1):
                reg_no = f"7311{year}{dept_data['code']}{str(i).padStart(3, '0')}" if hasattr(str, 'padStart') else f"7311{year}{dept_data['code']}{str(i).zfill(3)}"
                roll_no = f"{year}{dept_data['abbr']}{str(i).zfill(2)}"
                
                student = Student(
                    reg_no=reg_no,
                    roll_no=roll_no,
                    name=f"{dept_data['abbr']} Student {i}",
                    department_id=dept.id,
                    year_joined=year,
                    year_of_study=26 - int(year),  # 2026 - year
                    student_type='Regular'
                )
                db.session.add(student)
    
    db.session.commit()
    print(f"✅ Seeded {Student.query.count()} students across {Department.query.count()} departments")
=======
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    reg_no = Column(String, unique=True, index=True)
    name = Column(String)
    department = Column(String)
    year = Column(String) # e.g., "1st Year", "3rd Sem"
    subjects_registered = Column(String) # Comma-separated subject codes e.g. "CS3151,MA3151"
    
    # Relationships
    allotments = relationship("Allotment", back_populates="student")

class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    session = Column(String) # FN (Forenoon) or AN (Afternoon)
    subject_code = Column(String, index=True)
    subject_name = Column(String)
    
    # Relationships
    allotments = relationship("Allotment", back_populates="exam")

class Hall(Base):
    __tablename__ = "halls"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True) # e.g., "Hall A", "Room 301"
    capacity = Column(Integer)
    
    # Relationships
    allotments = relationship("Allotment", back_populates="hall")

class Allotment(Base):
    __tablename__ = "allotments"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))
    hall_id = Column(Integer, ForeignKey("halls.id"))
    seat_number = Column(Integer) # Relative seat number in the hall
    
    student = relationship("Student", back_populates="allotments")
    exam = relationship("Exam", back_populates="allotments")
    hall = relationship("Hall", back_populates="allotments")
    
    # Ensure a student is not allotted twice for the same exam
    __table_args__ = (UniqueConstraint('student_id', 'exam_id', name='_student_exam_uc'),)
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
