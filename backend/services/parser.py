import re
from typing import List, Dict, Any
from pypdf import PdfReader


class PDFParser:
    def extract_text(self, file_path: str) -> str:
        """Extract raw text from PDF."""
        text = ""
        try:
            reader = PdfReader(file_path)
            for page in reader.pages:
                text += page.extract_text() + "\n"
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

            for line in lines:
                clean = line.strip()
                if not clean:
                    continue

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

            for i, code in enumerate(page_codes):
                if code in seen_codes:
                    continue
                seen_codes.add(code)

                name = page_names[i] if i < len(page_names) else "Unknown"
                date = page_dates[i] if i < len(page_dates) else "UNKNOWN"
                session = page_sessions[i] if i < len(page_sessions) else "FN"

                parsed_exams.append({
                    "date": date,
                    "session": session,
                    "subject_code": code,
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

            dept_match = dept_pattern.search(block)
            if dept_match:
                degree = dept_match.group(1).replace(".", "").upper()
                branch = dept_match.group(2).strip()
                branch = re.sub(r"\s+", " ", branch).strip()
                department = f"{degree} {branch}"
            else:
                department = "Unknown"

            subjects = sub_pattern.findall(block)
            subjects = list(set([s for s in subjects if len(s) >= 6]))

            parsed_students.append({
                "reg_no": reg_no,
                "name": name,
                "department": department,
                "registered_subjects": subjects,
            })

        return parsed_students


parser_service = PDFParser()
