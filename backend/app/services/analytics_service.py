import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

# Resolve ai-services module path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from app.models.reading_tracker_model import ReadingTracker
from app.models.book_model import Book
from app.models.user_model import User
from agents.insight_agent import InsightAgent

class AnalyticsService:
    def __init__(self):
        self.agent = InsightAgent()

    def start_session(self, db: Session, user_id: int, book_id: int) -> ReadingTracker:
        # End any open sessions first
        open_sessions = db.query(ReadingTracker).filter(
            ReadingTracker.user_id == user_id,
            ReadingTracker.end_time == None
        ).all()
        for s in open_sessions:
            s.end_time = datetime.utcnow()
            
        db_session = ReadingTracker(
            user_id=user_id,
            book_id=book_id,
            start_time=datetime.utcnow(),
            pages_read=0,
            notes_taken=0
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        return db_session

    def end_session(self, db: Session, tracker_id: int, user_id: int, pages_read: int, notes_taken: int) -> Optional[ReadingTracker]:
        session = db.query(ReadingTracker).filter(
            ReadingTracker.id == tracker_id,
            ReadingTracker.user_id == user_id
        ).first()
        
        if not session:
            return None
            
        session.end_time = datetime.utcnow()
        session.pages_read = pages_read
        session.notes_taken = notes_taken
        
        # Update current page in Book model
        book = db.query(Book).filter(Book.id == session.book_id).first()
        if book:
            book.current_page = min(book.page_count, book.current_page + pages_read)
            if book.current_page >= book.page_count and book.page_count > 0:
                book.status = "completed"
            else:
                book.status = "reading"
                
        db.commit()
        db.refresh(session)
        return session

    def get_user_sessions(self, db: Session, user_id: int):
        return db.query(ReadingTracker).filter(ReadingTracker.user_id == user_id).order_by(ReadingTracker.created_at.desc()).all()

    def get_ai_coaching_insights(self, db: Session, user_id: int, mentor: str = "Socrates") -> str:
        sessions = self.get_user_sessions(db, user_id)
        user = db.query(User).filter(User.id == user_id).first()
        user_name = user.full_name if user else "Reader"
        
        logs = []
        for s in sessions[:10]:  # Analyze last 10 sessions
            book = db.query(Book).filter(Book.id == s.book_id).first()
            title = book.title if book else "Unknown"
            
            # Estimate minutes
            minutes = 0
            if s.end_time and s.start_time:
                delta = s.end_time - s.start_time
                minutes = int(delta.total_seconds() / 60)
            else:
                minutes = 15 # default estimate if session not closed
                
            logs.append({
                "book_title": title,
                "pages_read": s.pages_read,
                "notes_taken": s.notes_taken,
                "minutes": minutes
            })
            
        return self.agent.generate_reading_insights(logs, user_name, mentor)
