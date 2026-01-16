from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Hall
from database import get_db
from pydantic import BaseModel
from typing import List

router = APIRouter()



class HallCreate(BaseModel):
    name: str
    capacity: int

class HallResponse(BaseModel):
    id: int
    name: str
    capacity: int
    
    class Config:
        orm_mode = True

@router.post("/api/halls", response_model=HallResponse)
def create_hall(hall: HallCreate, db: Session = Depends(get_db)):
    db_hall = db.query(Hall).filter(Hall.name == hall.name).first()
    if db_hall:
        raise HTTPException(status_code=400, detail="Hall already exists")
    new_hall = Hall(name=hall.name, capacity=hall.capacity)
    db.add(new_hall)
    db.commit()
    db.refresh(new_hall)
    return new_hall

@router.get("/api/halls", response_model=List[HallResponse])
def read_halls(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    halls = db.query(Hall).offset(skip).limit(limit).all()
    return halls

@router.delete("/api/halls/{hall_id}")
def delete_hall(hall_id: int, db: Session = Depends(get_db)):
    hall = db.query(Hall).filter(Hall.id == hall_id).first()
    if not hall:
        raise HTTPException(status_code=404, detail="Hall not found")
    db.delete(hall)
    db.commit()
    return {"message": "Hall deleted"}
