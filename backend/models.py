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
