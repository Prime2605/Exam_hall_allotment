from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from services.logic import run_allotment
from models import Allotment

router = APIRouter()

@router.post("/api/allot")
def trigger_allotment(db: Session = Depends(get_db)):
    result = run_allotment(db)
    return result

@router.get("/api/allotments")
def get_allotments(db: Session = Depends(get_db)):
    # Return formatted list
    allotments = db.query(Allotment).all()
    # Eager load relationships automatically or use response_model
    # For simplicity, returning manual dict construction to avoid circular dep issues in pydantic if not careful
    data = []
    for a in allotments:
        data.append({
            "id": a.id,
            "student_reg": a.student.reg_no,
            "student_name": a.student.name,
            "exam_subject": a.exam.subject_code,
            "exam_date": str(a.exam.date),
            "hall_name": a.hall.name,
            "seat_number": a.seat_number
        })
    return data
