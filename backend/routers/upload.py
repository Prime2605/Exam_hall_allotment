from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List
import shutil
import os
from sqlalchemy.orm import Session
from services.parser import parser_service
from models import Exam, Student
from database import get_db
from fastapi.responses import JSONResponse

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/api/upload/timetable")
async def upload_timetable(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    total_parsed = 0
    total_saved = 0
    
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        try:
            data = parser_service.parse_timetable(file_path)
            total_parsed += len(data)
            
            for item in data:
                # Check if exam exists
                existing = db.query(Exam).filter(
                    Exam.subject_code == item['subject_code']
                ).first()
                
                if not existing:
                    from datetime import datetime
                    # Handle multiple date formats: DD-MON-YY, DD-MON-YYYY, DD-MM-YYYY
                    date_str = item['date']
                    dt = None
                    for fmt in ["%d-%b-%y", "%d-%b-%Y", "%d-%m-%Y", "%d/%m/%Y"]:
                        try:
                            dt = datetime.strptime(date_str, fmt).date()
                            # Fix 2-digit year interpretation (25 -> 2025, not 0025)
                            if dt.year < 100:
                                dt = dt.replace(year=dt.year + 2000)
                            break
                        except:
                            continue
                    
                    if not dt:
                        continue  # Skip if no format matched
                    
                    new_exam = Exam(
                        date=dt,
                        session=item['session'],
                        subject_code=item['subject_code'],
                        subject_name=item['subject_name']
                    )
                    db.add(new_exam)
                    total_saved += 1
            
            db.commit()
        except Exception as e:
            return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})
    
    return {"status": "success", "parsed_count": total_parsed, "saved_count": total_saved}

@router.post("/api/upload/students")
async def upload_students(files: List[UploadFile] = File(...), db: Session = Depends(get_db)):
    total_parsed = 0
    total_saved = 0
    
    for file in files:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        try:
            data = parser_service.parse_student_list(file_path)
            total_parsed += len(data)
            
            for item in data:
                student = db.query(Student).filter(Student.reg_no == item['reg_no']).first()
                if not student:
                    student = Student(
                        reg_no=item['reg_no'],
                        name=item['name'],
                        department=item.get('department', 'Unknown'),
                        year="Unknown"
                    )
                    db.add(student)
                    db.flush()
                    total_saved += 1
                
                current_subs = set(student.subjects_registered.split(",")) if student.subjects_registered else set()
                current_subs.update(item['registered_subjects'])
                student.subjects_registered = ",".join(filter(None, current_subs))
                
            db.commit()
        except Exception as e:
            return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})
    
    return {"status": "success", "parsed_count": total_parsed, "saved_count": total_saved}
