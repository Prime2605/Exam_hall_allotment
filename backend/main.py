from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base

app = FastAPI()

# Create Tables
from models import Base
Base.metadata.create_all(bind=engine)

# Include Routers
from routers import upload, halls, allotment, search, reports, data
app.include_router(upload.router)
app.include_router(halls.router)
app.include_router(allotment.router)
app.include_router(search.router)
app.include_router(reports.router)
app.include_router(data.router)

# Since we might proxy from Next.js, this might not be strictly needed for same-origin, 
# but good for dev if running on different ports without proxy.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
