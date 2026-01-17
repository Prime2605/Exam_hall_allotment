-- GCE Erode Exam Hall Seating System - PostgreSQL Schema for Supabase
-- Anna University Nov/Dec 2025 Examinations
-- Run this in the Supabase SQL Editor

-- ======================= SCHEMA =======================

-- Drop existing tables if they exist (PostgreSQL syntax)
DROP TABLE IF EXISTS allotments CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS halls CASCADE;
DROP TABLE IF EXISTS blocks CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 1) Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    abbr VARCHAR(10) NOT NULL UNIQUE,
    color VARCHAR(20) DEFAULT 'cyan'
);

-- 2) Blocks
CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    key VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(10) DEFAULT '🏢',
    color VARCHAR(20) DEFAULT 'cyan'
);

-- 3) Halls
CREATE TABLE halls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    block_id INTEGER NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
    capacity INTEGER DEFAULT 25
);

-- 4) Students
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(20) NOT NULL UNIQUE,
    roll_no VARCHAR(20) NOT NULL,
    name VARCHAR(120) NOT NULL,
    department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    year_joined VARCHAR(4) NOT NULL,
    year_of_study INTEGER NOT NULL,
    student_type VARCHAR(20) DEFAULT 'Regular',
    subjects_registered TEXT,
    hall_id INTEGER REFERENCES halls(id) ON DELETE SET NULL,
    seat INTEGER,
    seat_label VARCHAR(20)
);

-- 5) Exams
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    session VARCHAR(5) NOT NULL,
    subject_code VARCHAR(20) NOT NULL,
    subject_name VARCHAR(200) NOT NULL
);

-- 6) Allotments
CREATE TABLE allotments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    exam_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    hall_id INTEGER NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    seat_number INTEGER NOT NULL,
    UNIQUE(student_id, exam_id)
);

-- ======================= INDEXES =======================
CREATE INDEX idx_students_reg_no ON students(reg_no);
CREATE INDEX idx_students_department ON students(department_id);
CREATE INDEX idx_students_hall ON students(hall_id);
CREATE INDEX idx_halls_block ON halls(block_id);
CREATE INDEX idx_allotments_student ON allotments(student_id);
CREATE INDEX idx_allotments_exam ON allotments(exam_id);

-- ======================= SEED DATA =======================

-- Departments (8 departments)
INSERT INTO departments (code, name, abbr, color) VALUES
    ('102', 'Automobile Engineering', 'AUTO', 'orange'),
    ('103', 'Civil Engineering', 'CIVIL', 'teal'),
    ('104', 'Computer Science Engineering', 'CSE', 'blue'),
    ('105', 'Electrical & Electronics Engineering', 'EEE', 'green'),
    ('106', 'Electronics & Communication Engineering', 'ECE', 'cyan'),
    ('114', 'Mechanical Engineering', 'MECH', 'purple'),
    ('159', 'CSE (Data Science)', 'CSEDS', 'pink'),
    ('205', 'Information Technology', 'IT', 'gold');

-- Blocks (6 blocks)
INSERT INTO blocks (key, name, icon, color) VALUES
    ('T', 'T Block', '🏢', 'orange'),
    ('CT', 'CT Block', '📡', 'cyan'),
    ('EEE', 'EEE Block', '⚡', 'green'),
    ('M', 'M Block', '⚙️', 'purple'),
    ('AH', 'AH Block', '🔧', 'pink'),
    ('A', 'A Block', '📚', 'gold');

-- Halls (20 halls, 25 seats each)
INSERT INTO halls (name, block_id, capacity) VALUES
    ('T 1', 1, 25), ('T 2', 1, 25), ('T 3', 1, 25), ('T 6 A', 1, 25), ('T 6 B', 1, 25),
    ('CT 10', 2, 25), ('CT 11', 2, 25), ('CT 12', 2, 25),
    ('EEE1', 3, 25), ('EEE2', 3, 25), ('EEE3', 3, 25),
    ('M - 2', 4, 25), ('M - 3', 4, 25), ('M - 6', 4, 25),
    ('AH1', 5, 25), ('AH2', 5, 25), ('AH3', 5, 25),
    ('A - 1', 6, 25), ('A - 3', 6, 25), ('A - 4', 6, 25);
