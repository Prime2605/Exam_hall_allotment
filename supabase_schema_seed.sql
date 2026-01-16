-- Supabase schema + seed for GCE Erode 1st-year (Nov/Dec 2025) seating system
-- Run this in Supabase SQL editor (public schema)

-- 1) Tables
create table if not exists departments (
  id bigint generated always as identity primary key,
  code varchar(3) not null unique,
  name varchar(100) not null,
  abbr varchar(10) not null,
  color varchar(20) default 'cyan'
);

create table if not exists blocks (
  id bigint generated always as identity primary key,
  key varchar(10) not null unique,
  name varchar(50) not null,
  icon varchar(10) default '🏢',
  color varchar(20) default 'cyan'
);

create table if not exists halls (
  id bigint generated always as identity primary key,
  name varchar(50) not null unique,
  block_id bigint not null references blocks(id) on delete cascade,
  capacity int default 25
);

create table if not exists students (
  id bigint generated always as identity primary key,
  reg_no varchar(20) not null unique,
  roll_no varchar(20) not null,
  name varchar(120) not null,
  department_id bigint not null references departments(id) on delete cascade,
  year_joined varchar(4) not null,
  year_of_study int not null,
  student_type varchar(20) default 'Regular',
  subjects_registered text,
  hall_id bigint references halls(id) on delete set null,
  seat int,
  seat_label varchar(20)
);

create table if not exists exams (
  id bigint generated always as identity primary key,
  date date not null,
  session varchar(5) not null,
  subject_code varchar(20) not null,
  subject_name varchar(200) not null
);

create table if not exists allotments (
  id bigint generated always as identity primary key,
  student_id bigint not null references students(id) on delete cascade,
  exam_id bigint not null references exams(id) on delete cascade,
  hall_id bigint not null references halls(id) on delete cascade,
  seat_number int not null,
  unique(student_id, exam_id)
);

-- 2) Seed: departments
insert into departments (code, name, abbr, color) values
  ('102','Automobile Engineering','AUTO','orange'),
  ('103','Civil Engineering','CIVIL','teal'),
  ('104','Computer Science Engineering','CSE','blue'),
  ('105','Electrical & Electronics Engineering','EEE','green'),
  ('106','Electronics & Communication Engineering','ECE','cyan'),
  ('114','Mechanical Engineering','MECH','purple'),
  ('159','CSE (Data Science)','CSEDS','pink'),
  ('205','Information Technology','IT','gold')
on conflict (code) do nothing;

-- 3) Seed: blocks
insert into blocks (key, name, icon, color) values
  ('T','T Block','🏢','orange'),
  ('CT','CT Block','📡','cyan'),
  ('EEE','EEE Block','⚡','green'),
  ('M','M Block','⚙️','purple'),
  ('AH','AH Block','🔧','pink'),
  ('A','A Block','📚','gold')
on conflict (key) do nothing;

-- 4) Seed: halls (capacity 25 each)
-- First get block IDs dynamically
insert into halls (name, block_id, capacity) 
select h.name, b.id, 25
from (values
  ('T 1','T'),('T 2','T'),('T 3','T'),('T 6 A','T'),('T 6 B','T'),
  ('CT 10','CT'),('CT 11','CT'),('CT 12','CT'),
  ('EEE1','EEE'),('EEE2','EEE'),('EEE3','EEE'),
  ('M - 2','M'),('M - 3','M'),('M - 6','M'),
  ('AH1','AH'),('AH2','AH'),('AH3','AH'),
  ('A - 1','A'),('A - 3','A'),('A - 4','A')
) as h(name, block_key)
join blocks b on b.key = h.block_key
on conflict (name) do nothing;

-- 5) Seed: exams (FN 10:00-13:00)
insert into exams (date, session, subject_code, subject_name) values
  ('2025-12-16','FN','PH25C01','Applied Physics - I'),
  ('2025-12-18','FN','ME25C01','Engineering Drawing'),
  ('2025-12-18','FN','CS25C03','Essentials of Computing'),
  ('2025-12-18','FN','EE25C03','Fundamentals of Electrical and Electronics Engineering'),
  ('2025-12-18','FN','EE25C04','Basic Electronics and Electrical Engineering'),
  ('2025-12-20','FN','CY25C01','Applied Chemistry - I'),
  ('2025-12-22','FN','EN25C01','English Essentials - I'),
  ('2025-12-24','FN','CS25C02','Computer Programming: Python'),
  ('2025-12-24','FN','CS25C01','Computer Programming: C'),
  ('2025-12-27','FN','MA25C01','Applied Calculus'),
  ('2025-12-29','FN','UC25H01','Heritage of Tamils'),
  ('2025-12-31','FN','ME25C03','Introduction to Mechanical Engineering'),
  ('2025-12-31','FN','CE25C01','Introduction to Civil Engineering')
on conflict do nothing;

-- 6) Helper view: hall-wise allotment map
create or replace view v_hall_allotments as
select a.id as allotment_id, e.subject_code, e.subject_name, e.date, e.session,
       h.name as hall, h.capacity, s.reg_no, s.roll_no, s.name as student_name,
       s.department_id, s.seat as legacy_seat, a.seat_number as exam_seat
from allotments a
join students s on s.id = a.student_id
join halls h on h.id = a.hall_id
join exams e on e.id = a.exam_id;

-- 7) Simple allocator: seats all students for a given exam across halls in reg_no order
create or replace function fn_allocate_exam(p_exam_id bigint)
returns void as $$
begin
  -- wipe prior
  delete from allotments where exam_id = p_exam_id;

  with hall_slots as (
    select h.id as hall_id, gs as seat_number
    from halls h
    cross join lateral generate_series(0, h.capacity - 1) as gs
    order by h.id, gs
  ),
  ranked as (
    select s.id as student_id, row_number() over (order by s.department_id, s.reg_no) as rn
    from students s
  )
  insert into allotments (student_id, exam_id, hall_id, seat_number)
  select r.student_id, p_exam_id, hs.hall_id, hs.seat_number
  from ranked r
  join hall_slots hs on hs.seat_number >= 0
  where hs.seat_number + (hs.hall_id * 10000) is not null  -- dummy always true to allow join
  order by hs.hall_id, hs.seat_number
  limit (select count(*) from students);
end;
$$ language plpgsql;

-- Usage:
-- select fn_allocate_exam(<exam_id>);
-- select * from v_hall_allotments where exam_id = <exam_id>;

-- 8) CSV import next step
-- Upload the accompanying CSV (supabase_students_1y.csv) into table "students" using Supabase Table Editor / Import.
