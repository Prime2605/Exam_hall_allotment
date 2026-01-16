# 🎓 University Exam Hall Allotment System

A web application for automating exam hall seat allocation for university examinations. Built with **Next.js** (frontend) and **FastAPI** (backend).

## ✨ Features

- **📄 PDF Parsing**: Upload student hall tickets and exam timetables (supports Anna University format)
- **🏛️ Hall Management**: Configure exam halls with capacity and seating arrangement
- **🪑 Auto Seat Allotment**: Automatically assign seats ensuring no two students with same subject sit adjacent
- **🔍 Student Portal**: Students can search their seat allocation by registration number
- **📊 Reports**: Generate allotment reports in PDF format

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | Python, FastAPI, SQLAlchemy |
| Database | SQLite |
| PDF Parsing | pypdf |

### Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
antigravity/
├── backend/
│   ├── main.py           # FastAPI app entry
│   ├── models.py         # Database models
│   ├── database.py       # DB connection
│   ├── routers/          # API endpoints
│   │   ├── upload.py     # PDF upload
│   │   ├── halls.py      # Hall management
│   │   ├── allotment.py  # Seat allocation
│   │   ├── data.py       # View data
│   │   └── search.py     # Student search
│   └── services/
│       ├── parser.py     # PDF parsing logic
│       └── logic.py      # Allotment algorithm
├── frontend/
│   └── app/
│       ├── admin/        # Admin dashboard
│       └── student/      # Student portal
└── README.md
```

## 📋 Usage

1. **Upload Data**: Admin uploads student PDF files and exam timetables
2. **Configure Halls**: Add exam halls with rows, columns, and capacity
3. **Run Allotment**: Click "Run Allotment" to auto-assign seats
4. **View Results**: Check allotment in admin panel or student portal
5. **Generate Reports**: Download PDF reports for each hall

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/students` | POST | Upload student PDFs |
| `/api/upload/timetable` | POST | Upload timetable PDFs |
| `/api/halls` | GET/POST | Manage halls |
| `/api/allotment/run` | POST | Execute seat allocation |
| `/api/search/{reg_no}` | GET | Search student allocation |

## 🌐 Vercel Deployment

### Deploy Frontend
1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Import your repository
4. Set **Root Directory** to `frontend`
5. Add environment variable: `NEXT_PUBLIC_API_URL` = your backend URL
6. Click **Deploy**

### Deploy Backend (Railway/Render)
The Python Flask backend needs a separate hosting service:
- **Railway**: https://railway.app
- **Render**: https://render.com

Set these environment variables:
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

## 📄 License

MIT License

## 👨‍💻 Author

Sudarsanam R
Prime R S