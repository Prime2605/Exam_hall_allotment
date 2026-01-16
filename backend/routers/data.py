from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from models import Student, Exam
from database import get_db
from typing import Optional, List

router = APIRouter()

@router.get("/api/students")
def get_students(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by Reg No or Name"),
    department: Optional[str] = Query(None),
    subject_code: Optional[str] = Query(None, description="Filter by subject code"),
    skip: int = 0,
    limit: int = 500
):
    query = db.query(Student)
    
    if search:
        query = query.filter(
            (Student.reg_no.contains(search)) | (Student.name.contains(search))
        )
    if department:
        query = query.filter(Student.department.contains(department))
    if subject_code:
        query = query.filter(Student.subjects_registered.contains(subject_code))
    
    students = query.offset(skip).limit(limit).all()
    
    return [{
        "id": s.id,
        "reg_no": s.reg_no,
        "name": s.name,
        "department": s.department,
        "year": s.year,
        "subjects_registered": s.subjects_registered.split(",") if s.subjects_registered else []
    } for s in students]

@router.get("/api/exams")
def get_exams(
    db: Session = Depends(get_db),
    subject_code: Optional[str] = Query(None),
    date: Optional[str] = Query(None),
    session: Optional[str] = Query(None),
    skip: int = 0,
    limit: int = 2000
):
    query = db.query(Exam)
    
    if subject_code:
        query = query.filter(Exam.subject_code.contains(subject_code))
    if date:
        query = query.filter(Exam.date == date)
    if session:
        query = query.filter(Exam.session == session)
    
    exams = query.offset(skip).limit(limit).all()
    
    return [{
        "id": e.id,
        "date": str(e.date),
        "session": e.session,
        "subject_code": e.subject_code,
        "subject_name": e.subject_name
    } for e in exams]

# Count endpoints for dashboard
@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "total_students": db.query(Student).count(),
        "total_exams": db.query(Exam).count(),
        "total_halls": db.query(__import__('models').Hall).count()
    }
