from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Allotment
import pandas as pd
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
import os

router = APIRouter()

REPORT_DIR = "reports"
os.makedirs(REPORT_DIR, exist_ok=True)

@router.get("/api/reports/excel")
def generate_excel(db: Session = Depends(get_db)):
    allotments = db.query(Allotment).all()
    data = []
    for a in allotments:
        data.append({
            "Reg No": a.student.reg_no,
            "Name": a.student.name,
            "Subject Code": a.exam.subject_code,
            "Subject Name": a.exam.subject_name,
            "Date": str(a.exam.date),
            "Session": a.exam.session,
            "Hall": a.hall.name,
            "Seat": a.seat_number
        })
    
    df = pd.DataFrame(data)
    file_path = os.path.join(REPORT_DIR, "allotment_report.xlsx")
    df.to_excel(file_path, index=False)
    
    return FileResponse(file_path, filename="allotment_report.xlsx", media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

@router.get("/api/reports/pdf")
def generate_pdf(db: Session = Depends(get_db)):
    allotments = db.query(Allotment).all()
    file_path = os.path.join(REPORT_DIR, "allotment_report.pdf")
    
    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Exam Seat Allotment Report")
    
    # Table Header
    y = height - 80
    c.setFont("Helvetica-Bold", 10)
    c.drawString(50, y, "Reg No")
    c.drawString(150, y, "Name")
    c.drawString(300, y, "Subject")
    c.drawString(400, y, "Hall")
    c.drawString(500, y, "Seat")
    
    y -= 20
    c.setFont("Helvetica", 10)
    
    for a in allotments:
        if y < 50:
            c.showPage()
            y = height - 50
        
        c.drawString(50, y, str(a.student.reg_no))
        name = a.student.name[:25] + "..." if len(a.student.name) > 25 else a.student.name
        c.drawString(150, y, name)
        c.drawString(300, y, str(a.exam.subject_code))
        c.drawString(400, y, str(a.hall.name))
        c.drawString(500, y, str(a.seat_number))
        y -= 15
        
    c.save()
    return FileResponse(file_path, filename="allotment_report.pdf", media_type='application/pdf')
