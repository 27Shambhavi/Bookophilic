from sqlalchemy.orm import Session
from app.models.note_model import Note
from app.models.book_model import Book
from app.schemas.note_schema import NoteCreate, NoteUpdate
import sys
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from summarization.summarizer import BookSummarizer
from agents.reflection_agent import ReflectionAgent

class NoteService:
    def __init__(self):
        self.summarizer = BookSummarizer()
        self.reflection_agent = ReflectionAgent()

    def get_notes_by_user(self, db: Session, user_id: int, skip: int = 0, limit: int = 100):
        return db.query(Note).filter(Note.user_id == user_id).offset(skip).limit(limit).all()

    def get_notes_by_book(self, db: Session, user_id: int, book_id: int):
        return db.query(Note).filter(Note.user_id == user_id, Note.book_id == book_id).all()

    def create_note(self, db: Session, note_data: NoteCreate, user_id: int) -> Note:
        db_note = Note(
            book_id=note_data.book_id,
            user_id=user_id,
            content=note_data.content,
            page_number=note_data.page_number
        )
        db.add(db_note)
        db.commit()
        db.refresh(db_note)
        return db_note

    def update_note(self, db: Session, note_id: int, user_id: int, note_data: NoteUpdate) -> Note:
        db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if not db_note:
            return None
        
        if note_data.content is not None:
            db_note.content = note_data.content
        if note_data.page_number is not None:
            db_note.page_number = note_data.page_number
            
        db.commit()
        db.refresh(db_note)
        return db_note

    def delete_note(self, db: Session, note_id: int, user_id: int) -> bool:
        db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
        if not db_note:
            return False
        db.delete(db_note)
        db.commit()
        return True

    def summarize_user_notes(self, db: Session, user_id: int, book_id: int) -> str:
        notes = self.get_notes_by_book(db, user_id, book_id)
        if not notes:
            return "No notes found to summarize."
        
        notes_text = "\n\n".join([f"Page {n.page_number}: {n.content}" if n.page_number else n.content for n in notes])
        return self.summarizer.summarize_notes(notes_text)

    def generate_note_reflections(self, db: Session, user_id: int, book_id: int) -> str:
        notes = self.get_notes_by_book(db, user_id, book_id)
        book = db.query(Book).filter(Book.id == book_id).first()
        book_title = book.title if book else "Unknown Book"
        
        if not notes:
            return "No notes found to reflect on."
            
        notes_text = "\n".join([n.content for n in notes])
        return self.reflection_agent.generate_reflection_questions(notes_text, book_title)
