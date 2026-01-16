import re
from typing import List, Dict, Any
from pypdf import PdfReader

<<<<<<< HEAD

class PDFParser:
    def extract_text(self, file_path: str) -> str:
        """Extract raw text from PDF."""
=======
class PDFParser:
    def extract_text(self, file_path: str) -> str:
        """
        Extracts raw text using pypdf.
        """
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
<<<<<<< HEAD
        except Exception as exc:
            print(f"Error extracting text: {exc}")
        return text

    def parse_timetable(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse timetable PDF by processing each page separately."""
        reader = PdfReader(file_path)
        parsed_exams: List[Dict[str, Any]] = []
        seen_codes = set()

        code_pattern = re.compile(r"^([A-Z]{2}\d{2}[A-Z]\d{2}|[A-Z]{2,3}\d{3,4})$")
        date_pattern = re.compile(r"^(\d{1,2}-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-\d{2,4})$", re.IGNORECASE)
        session_pattern = re.compile(r"^(F\.N\.|A\.N\.)$", re.IGNORECASE)

        for page in reader.pages:
            text = page.extract_text()
            lines = text.split("\n")

            page_names: List[str] = []
            page_codes: List[str] = []
            page_dates: List[str] = []
            page_sessions: List[str] = []

=======
        except Exception as e:
            print(f"Error extracting text: {e}")
        return text

    def parse_timetable(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parses timetable by processing each PAGE separately.
        
        PDF structure (per page):
        - Subject names appear first (lines starting with '  ')
        - Subject codes appear next (one per line)
        - Dates appear next (in same order as codes)
        - Sessions appear last (F.N. or A.N.)
        
        Names, Codes, Dates, Sessions are in 1:1 correspondence within each page.
        """
        reader = PdfReader(file_path)
        parsed_exams = []
        seen_codes = set()
        
        # Patterns
        code_pattern = re.compile(r"^([A-Z]{2}\d{2}[A-Z]\d{2}|[A-Z]{2,3}\d{3,4})$")
        date_pattern = re.compile(r"^(\d{1,2}-(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-\d{2,4})$", re.IGNORECASE)
        session_pattern = re.compile(r"^(F\.N\.|A\.N\.)$", re.IGNORECASE)
        
        # Process each page separately
        for page in reader.pages:
            text = page.extract_text()
            lines = text.split('\n')
            
            # Collect items from THIS page only
            page_names = []
            page_codes = []
            page_dates = []
            page_sessions = []
            
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
            for line in lines:
                clean = line.strip()
                if not clean:
                    continue
<<<<<<< HEAD

                if code_pattern.match(clean):
                    page_codes.append(clean)
                elif date_pattern.match(clean):
                    page_dates.append(clean.upper())
                elif session_pattern.match(clean):
                    page_sessions.append(clean.upper().replace(".", "").replace(" ", ""))
                elif line.startswith("  ") and len(clean) > 3:
                    lower = clean.lower()
                    if not any(skip in lower for skip in [
                        "page", "branch", "semester", "regulation", "choice based",
                        "anna university", "time table", "controller", "examinations",
                        "cbcs", "forenoon", "afternoon", "subject name", "exam date"
                    ]):
                        if clean[0].isalpha():
                            page_names.append(clean)

=======
                
                # Subject code (standalone line)
                if code_pattern.match(clean):
                    page_codes.append(clean)
                
                # Date (standalone line)
                elif date_pattern.match(clean):
                    page_dates.append(clean.upper())
                
                # Session (standalone line like "F.N." or "A.N.")
                elif session_pattern.match(clean):
                    page_sessions.append(clean.upper().replace(".", "").replace(" ", ""))
                
                # Subject name (line starting with 2+ spaces, has meaningful text)
                elif line.startswith('  ') and len(clean) > 3:
                    # Filter out headers/footers
                    lower = clean.lower()
                    if not any(skip in lower for skip in [
                        'page', 'branch', 'semester', 'regulation', 'choice based',
                        'anna university', 'time table', 'controller', 'examinations',
                        'cbcs', 'forenoon', 'afternoon', 'subject name', 'exam date'
                    ]):
                        if clean[0].isalpha():
                            page_names.append(clean)
            
            # Match items by position WITHIN THIS PAGE
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
            for i, code in enumerate(page_codes):
                if code in seen_codes:
                    continue
                seen_codes.add(code)
<<<<<<< HEAD

                name = page_names[i] if i < len(page_names) else "Unknown"
                date = page_dates[i] if i < len(page_dates) else "UNKNOWN"
                session = page_sessions[i] if i < len(page_sessions) else "FN"

=======
                
                # Get corresponding name, date, session by position
                name = page_names[i] if i < len(page_names) else "Unknown"
                date = page_dates[i] if i < len(page_dates) else "UNKNOWN"
                session = page_sessions[i] if i < len(page_sessions) else "FN"
                
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
                parsed_exams.append({
                    "date": date,
                    "session": session,
                    "subject_code": code,
<<<<<<< HEAD
                    "subject_name": name,
                })

        return parsed_exams

    def parse_student_list(self, file_path: str) -> List[Dict[str, Any]]:
        """Parse student list PDF using regex."""
        text = self.extract_text(file_path)
        parsed_students: List[Dict[str, Any]] = []

        reg_pattern = re.compile(r"Register\s*Number\s*(\d{10,15})", re.IGNORECASE)
        name_pattern = re.compile(
            r"(?:Name|me)\s*(?:of\s*(?:the\s*)?Candidate)?\s*[:\s]*([A-Z][A-Z\s\.]+?)(?:\s*Date\s*of\s*Birth|$)",
            re.IGNORECASE,
        )
        dept_pattern = re.compile(
            r"(?:Degree|ree)\s*&?\s*Branch\s*[:\s]*(B\.?E\.?|B\.?Tech\.?|M\.?E\.?|M\.?Tech\.?)\s*\.?\s*([A-Za-z\s&\(\)]+?)(?:\s*Reg|\s*Sem|$)",
            re.IGNORECASE,
        )
        sub_pattern = re.compile(r"\b([A-Z]{2}\d{2}[A-Z]?\d{2}|[A-Z]{2,3}\d{3,4})\b")

        blocks = re.split(r"(?=Register\s*Number\s*\d{10,15})", text, flags=re.IGNORECASE)

        for block in blocks:
            if not block.strip():
                continue

            reg_match = reg_pattern.search(block)
            if not reg_match:
                continue

            reg_no = reg_match.group(1)

            name_match = name_pattern.search(block)
            if name_match:
                name = name_match.group(1).strip()
                name = re.sub(r"\s*(Date|Degree|Branch|Semester|Regulations).*$", "", name, flags=re.IGNORECASE).strip()
            else:
                name = f"Student {reg_no}"

=======
                    "subject_name": name
                })
        
        return parsed_exams

    def parse_student_list(self, file_path: str) -> List[Dict[str, Any]]:
        """
        Parses Student List via Regex on raw text.
        """
        text = self.extract_text(file_path)
        parsed_students = []
        
        # Pattern for Register Number
        reg_pattern = re.compile(r"Register\s*Number\s*(\d{10,15})", re.IGNORECASE)
        
        # Pattern for Name
        name_pattern = re.compile(r"(?:Name|me)\s*(?:of\s*(?:the\s*)?Candidate)?\s*[:\s]*([A-Z][A-Z\s\.]+?)(?:\s*Date\s*of\s*Birth|$)", re.IGNORECASE)
        
        # Pattern for Degree & Branch
        dept_pattern = re.compile(
            r"(?:Degree|ree)\s*&?\s*Branch\s*[:\s]*(B\.?E\.?|B\.?Tech\.?|M\.?E\.?|M\.?Tech\.?)\s*\.?\s*([A-Za-z\s&\(\)]+?)(?:\s*Reg|\s*Sem|$)", 
            re.IGNORECASE
        )
        
        # Subject Code pattern (both formats)
        sub_pattern = re.compile(r"\b([A-Z]{2}\d{2}[A-Z]?\d{2}|[A-Z]{2,3}\d{3,4})\b")
        
        # Split by Register Number to get individual student blocks
        blocks = re.split(r"(?=Register\s*Number\s*\d{10,15})", text, flags=re.IGNORECASE)
        
        for block in blocks:
            if not block.strip():
                continue
            
            # Extract Reg No
            reg_match = reg_pattern.search(block)
            if not reg_match:
                continue
            
            reg_no = reg_match.group(1)
            
            # Extract Name
            name_match = name_pattern.search(block)
            if name_match:
                name = name_match.group(1).strip()
                name = re.sub(r'\s*(Date|Degree|Branch|Semester|Regulations).*$', '', name, flags=re.IGNORECASE).strip()
            else:
                name = f"Student {reg_no}"
            
            # Extract Department
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
            dept_match = dept_pattern.search(block)
            if dept_match:
                degree = dept_match.group(1).replace(".", "").upper()
                branch = dept_match.group(2).strip()
<<<<<<< HEAD
                branch = re.sub(r"\s+", " ", branch).strip()
                department = f"{degree} {branch}"
            else:
                department = "Unknown"

            subjects = sub_pattern.findall(block)
            subjects = list(set([s for s in subjects if len(s) >= 6]))

=======
                branch = re.sub(r'\s+', ' ', branch).strip()
                department = f"{degree} {branch}"
            else:
                department = "Unknown"
            
            # Extract Subject Codes
            subjects = sub_pattern.findall(block)
            subjects = list(set([s for s in subjects if len(s) >= 6]))
            
>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
            parsed_students.append({
                "reg_no": reg_no,
                "name": name,
                "department": department,
<<<<<<< HEAD
                "registered_subjects": subjects,
            })

        return parsed_students


=======
                "registered_subjects": subjects
            })
        
        return parsed_students

>>>>>>> 2d8beaa9fd737bb6d330f13204e5079f2524bfcb
parser_service = PDFParser()
