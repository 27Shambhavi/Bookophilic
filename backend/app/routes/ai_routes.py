import sys
import os
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user_model import User
from app.dependencies.auth import get_current_user
from app.services.analytics_service import AnalyticsService
from app.services.rag_service import RagService
from pydantic import BaseModel

# Resolve ai-services path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from sentiment_analysis.sentiment_model import SentimentAnalyzer
from theme_detection.theme_classifier import ThemeClassifier

router = APIRouter(prefix="/ai", tags=["ai"])
analytics_service = AnalyticsService()
sentiment_analyzer = SentimentAnalyzer()
theme_classifier = ThemeClassifier()
rag_service = RagService()

class SentimentRequest(BaseModel):
    text: str

class ThemeRequest(BaseModel):
    text: str

@router.post("/sentiment")
def analyze_sentiment(req: SentimentRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return sentiment_analyzer.analyze_sentiment(req.text)

@router.post("/theme")
def classify_theme(req: ThemeRequest):
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    return theme_classifier.classify_themes(req.text)

@router.get("/insights")
def get_insights(
    mentor: str = "Socrates",
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    insights = analytics_service.get_ai_coaching_insights(db, current_user.id, mentor=mentor)
    return {"insights": insights}

# Reading Session Tracker APIs (which belong to Analytics/AI category)
class SessionStartRequest(BaseModel):
    book_id: int

class SessionEndRequest(BaseModel):
    pages_read: int
    notes_taken: int

@router.post("/session/start")
def start_reading_session(
    req: SessionStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = analytics_service.start_session(db, current_user.id, req.book_id)
    return {"message": "Reading session started", "session_id": session.id, "start_time": session.start_time}

@router.post("/session/end/{session_id}")
def end_reading_session(
    session_id: int,
    req: SessionEndRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = analytics_service.end_session(db, session_id, current_user.id, req.pages_read, req.notes_taken)
    if not session:
        raise HTTPException(status_code=404, detail="Active session not found or unauthorized")
    return {"message": "Reading session ended", "session": {
        "id": session.id,
        "book_id": session.book_id,
        "start_time": session.start_time,
        "end_time": session.end_time,
        "pages_read": session.pages_read,
        "notes_taken": session.notes_taken
    }}

@router.get("/sessions")
def get_reading_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = analytics_service.get_user_sessions(db, current_user.id)
    return [
        {
            "id": s.id,
            "book_id": s.book_id,
            "book_title": s.book.title if s.book else "Unknown Book",
            "start_time": s.start_time,
            "end_time": s.end_time,
            "pages_read": s.pages_read,
            "notes_taken": s.notes_taken,
            "duration_minutes": round((s.end_time - s.start_time).total_seconds() / 60.0) if (s.end_time and s.start_time) else None
        }
        for s in sessions
    ]

class RagQueryRequest(BaseModel):
    query: str

@router.post("/rag")
def query_rag(
    req: RagQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    return rag_service.query_library(db, current_user.id, req.query)

@router.post("/book/{book_id}/upload-pdf")
async def upload_pdf(
    book_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    file_bytes = await file.read()
    return rag_service.summarize_pdf(db, book_id, current_user.id, file.filename, file_bytes)
