from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Allotment, Student
from database import get_db
from typing import List, Dict, Any

router = APIRouter()

@router.get("/api/search")
def search_student(reg_no: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.reg_no == reg_no).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    allotments = db.query(Allotment).filter(Allotment.student_id == student.id).all()
    
    results = []
    for a in allotments:
        results.append({
            "subject_code": a.exam.subject_code,
            "subject_name": a.exam.subject_name,
            "date": str(a.exam.date),
            "session": a.exam.session,
            "hall_name": a.hall.name,
            "seat_number": a.seat_number
        })
        
    return {
        "student": {
            "name": student.name,
            "reg_no": student.reg_no,
            "dept": student.department
        },
        "allotments": results
    }
