"""
Supabase Client Module for GCE Erode Exam Seating System
Handles all database operations via Supabase REST API
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://voaqytqngzasifqenpyo.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_KEY:
    raise ValueError("SUPABASE_KEY or SUPABASE_ANON_KEY environment variable is required")

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ======================= HELPER FUNCTIONS =======================

def get_departments():
    """Fetch all departments"""
    response = supabase.table("departments").select("*").execute()
    return response.data

def get_blocks():
    """Fetch all blocks with their halls"""
    response = supabase.table("blocks").select("*, halls(*)").execute()
    return response.data

def get_halls(block_key=None):
    """Fetch halls, optionally filtered by block"""
    query = supabase.table("halls").select("*, blocks(*)")
    if block_key:
        query = query.eq("blocks.key", block_key)
    response = query.execute()
    return response.data

def get_students(department_id=None, year_of_study=None, limit=100, offset=0):
    """Fetch students with optional filters"""
    query = supabase.table("students").select("*, departments(*), halls(*)")
    if department_id:
        query = query.eq("department_id", department_id)
    if year_of_study:
        query = query.eq("year_of_study", year_of_study)
    response = query.range(offset, offset + limit - 1).execute()
    return response.data

def search_student(reg_no):
    """Search for a student by registration number"""
    response = supabase.table("students").select(
        "*, departments(*), halls(*, blocks(*))"
    ).eq("reg_no", reg_no).single().execute()
    return response.data

def get_hall_seats(hall_id):
    """Get all students seated in a specific hall"""
    response = supabase.table("students").select(
        "*, departments(*)"
    ).eq("hall_id", hall_id).order("seat").execute()
    return response.data

def get_stats():
    """Get dashboard statistics"""
    students = supabase.table("students").select("id", count="exact").execute()
    halls = supabase.table("halls").select("id", count="exact").execute()
    departments = supabase.table("departments").select("id", count="exact").execute()
    allocated = supabase.table("students").select("id", count="exact").neq("hall_id", None).execute()
    
    return {
        "totalStudents": students.count,
        "totalHalls": halls.count,
        "totalDepartments": departments.count,
        "allocatedSeats": allocated.count
    }

def allocate_seat(student_id, hall_id, seat_number, seat_label=None):
    """Allocate a seat to a student"""
    update_data = {
        "hall_id": hall_id,
        "seat": seat_number,
        "seat_label": seat_label
    }
    response = supabase.table("students").update(update_data).eq("id", student_id).execute()
    return response.data

def clear_all_allocations():
    """Clear all seat allocations"""
    response = supabase.table("students").update({
        "hall_id": None,
        "seat": None,
        "seat_label": None
    }).neq("id", 0).execute()  # Update all rows
    return response.data

def get_exams(date=None, session=None):
    """Fetch exams with optional date/session filter"""
    query = supabase.table("exams").select("*")
    if date:
        query = query.eq("date", date)
    if session:
        query = query.eq("session", session)
    response = query.execute()
    return response.data

def get_unique_exam_dates():
    """Get unique exam dates for the dropdown"""
    response = supabase.table("exams").select("date, session").execute()
    # Group unique combinations
    seen = set()
    result = []
    for exam in response.data:
        key = (exam["date"], exam["session"])
        if key not in seen:
            seen.add(key)
            result.append({"date": exam["date"], "session": exam["session"]})
    return sorted(result, key=lambda x: (x["date"], x["session"]))
