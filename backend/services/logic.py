<<<<<<< HEAD
from typing import Optional
import random

from models import Student, Exam, Hall, Allotment, db


def run_allotment(date_str: Optional[str] = None, session_str: Optional[str] = None):
    """
    Runs exam-based allotment algorithm.
    If date_str/session_str provided, runs only for that slot.
    Returns a dict with status/log.
    """
    all_exams = Exam.query.all()
    slots = {}

    for exam in all_exams:
        key = (exam.date, exam.session)
        slots.setdefault(key, []).append(exam)

    log = []

    halls = Hall.query.all()
    if not halls:
        return {"status": "error", "message": "No halls configured"}

    for (date, session), exams in slots.items():
        if date_str and str(date) != date_str:
            continue
        if session_str and session != session_str:
            continue

        log.append(f"Processing Slot: {date} {session}")

        exam_subject_map = {e.subject_code: e for e in exams}
        target_subjects = set(exam_subject_map.keys())

        students_to_seat = []
        all_students = Student.query.all()
        for student in all_students:
            if not student.subjects_registered:
                continue
            student_subs = set(student.subjects_registered.split(","))
            overlap = student_subs.intersection(target_subjects)
            for sub in overlap:
                exam = exam_subject_map[sub]
                students_to_seat.append({"student": student, "exam": exam})

        log.append(f"  Found {len(students_to_seat)} students to seat.")
        if not students_to_seat:
            continue

        random.shuffle(students_to_seat)

        hall_idx = 0
        current_hall_filled = 0

=======
from sqlalchemy.orm import Session
from models import Student, Exam, Hall, Allotment
from typing import List, Dict
import random

def run_allotment(db: Session, date_str: str = None, session_str: str = None):
    """
    Runs the allotment algorithm.
    If date_str/session_str provided, runs only for that slot.
    Otherwise runs for all exams in DB.
    """
    
    # query exams
    query = db.query(Exam)
    # We are storing dates as DATE objects in DB, but for now assuming string match logic 
    # or relying on the upload parsing. 
    # To keep it robust, let's fetch ALL exams and filter in python or iterate by unique date/session.
    
    all_exams = query.all()
    
    # Group exams by (Date, Session)
    slots = {}
    for exam in all_exams:
        key = (exam.date, exam.session)
        if key not in slots:
            slots[key] = []
        slots[key].append(exam)
        
    log = []
    
    # Fetch Halls
    halls = db.query(Hall).all()
    if not halls:
        return {"status": "error", "message": "No halls configured"}

    # Process each slot
    for (date, session), exams in slots.items():
        if date_str and str(date) != date_str: continue
        if session_str and session != session_str: continue
        
        log.append(f"Processing Slot: {date} {session}")
        
        # 1. Identify Students for this slot
        # We need to find students who have any of the subject codes in `exams` in their `subjects_registered`
        exam_subject_map = {e.subject_code: e for e in exams}
        target_subjects = set(exam_subject_map.keys())
        
        # Inefficient to query all students, but for <5000 students it's fine for SQLite.
        # Optimized approach: User `like` query if possible, but comma separation makes it hard.
        all_students = db.query(Student).all()
        
        students_to_seat = []
        for student in all_students:
            if not student.subjects_registered: continue
            
            # Check overlap
            student_subs = set(student.subjects_registered.split(","))
            overlap = student_subs.intersection(target_subjects)
            
            for sub in overlap:
                # Student needs a seat for this subject
                exam = exam_subject_map[sub]
                students_to_seat.append({
                    "student": student,
                    "exam": exam
                })
        
        log.append(f"  Found {len(students_to_seat)} students to seat.")
        
        if not students_to_seat:
            continue

        # 2. Clear existing allotments for this slot?
        # Ideally yes, to avoid duplicates or re-run issues.
        # db.query(Allotment).filter(Allotment.exam_id.in_([e.id for e in exams])).delete(synchronize_session=False)

        # 3. Sort/Shuffle students
        # To prevent malpractice, maybe shuffle? Or sort by RegNo?
        # Let's shuffle for "Randomized Seating" logic usually desired.
        random.shuffle(students_to_seat)
        
        # 4. Fill Halls
        hall_idx = 0
        current_hall_filled = 0
        
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
        for item in students_to_seat:
            if hall_idx >= len(halls):
                log.append("  ❌ CRITICAL: Run out of seats!")
                break

            hall = halls[hall_idx]

            if current_hall_filled >= hall.capacity:
                hall_idx += 1
                current_hall_filled = 0
                if hall_idx >= len(halls):
                    log.append("  ❌ CRITICAL: Run out of seats!")
                    break
                hall = halls[hall_idx]

            existing = Allotment.query.filter_by(
                student_id=item["student"].id,
                exam_id=item["exam"].id,
            ).first()

            if not existing:
                allotment = Allotment(
                    student_id=item["student"].id,
                    exam_id=item["exam"].id,
                    hall_id=hall.id,
                    seat_number=current_hall_filled + 1,
                )
                db.session.add(allotment)
                current_hall_filled += 1

        db.session.commit()

    return {"status": "success", "log": log}

    return {"status": "success", "log": log}
