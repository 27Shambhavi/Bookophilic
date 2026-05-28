from sqlalchemy.orm import Session
from app.models.note_model import Note
from app.models.book_model import Book
from app.schemas.note_schema import NoteCreate, NoteUpdate
import sys
import os
import math

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from summarization.summarizer import BookSummarizer
from agents.reflection_agent import ReflectionAgent
from ollama.ollama_client import OllamaClient
from embeddings.vector_store import SimpleVectorStore

class NoteService:
    def __init__(self):
        self.summarizer = BookSummarizer()
        self.reflection_agent = ReflectionAgent()
        self.ollama = OllamaClient()
        self.vector_store = SimpleVectorStore()

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

    def _cosine_similarity(self, v1: list, v2: list) -> float:
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(v1, v2))
        magnitude_v1 = math.sqrt(sum(a * a for a in v1))
        magnitude_v2 = math.sqrt(sum(a * a for a in v2))
        if magnitude_v1 == 0 or magnitude_v2 == 0:
            return 0.0
        return dot_product / (magnitude_v1 * magnitude_v2)

    def _get_cached_embedding(self, key: str, text: str) -> list:
        vector = self.vector_store.get_vector(key)
        if not vector:
            vector = self.ollama.get_embeddings(text)
            self.vector_store.add_vector(key, vector)
        return vector

    def semantic_search_notes(self, db: Session, user_id: int, query: str) -> list:
        notes = db.query(Note).filter(Note.user_id == user_id).all()
        if not notes or not query.strip():
            return []

        query_vector = self.ollama.get_embeddings(query)
        candidates = []

        for n in notes:
            book = db.query(Book).filter(Book.id == n.book_id).first()
            book_title = book.title if book else "Unknown Book"
            text = f"Note on book '{book_title}': {n.content}"
            key = f"user_{user_id}_note_{n.id}"
            vector = self._get_cached_embedding(key, text)
            score = self._cosine_similarity(query_vector, vector)
            candidates.append((n, score))

        candidates.sort(key=lambda x: x[1], reverse=True)
        
        result = []
        for note, score in candidates:
            result.append({
                "id": note.id,
                "book_id": note.book_id,
                "user_id": note.user_id,
                "content": note.content,
                "page_number": note.page_number,
                "created_at": note.created_at,
                "score": round(score, 3)
            })
        return result

    def generate_action_points(self, text: str) -> str:
        prompt = f"Given this reader note/quote, convert it into 1-2 practical, actionable daily tasks/habits for the reader. Be direct and concise.\n\nNote: {text}"
        return self.ollama.generate(prompt)

    def generate_quiz(self, text: str) -> str:
        prompt = f"Given this note/quote, create 2 multiple choice questions (MCQs) to test the reader's active recall. Format with choices (A, B, C, D) and specify the correct answer.\n\nNote: {text}"
        return self.ollama.generate(prompt)

    def generate_single_summary(self, text: str) -> str:
        prompt = f"Condense the following reader note or quote into a single punchy, high-impact key takeaway (10-15 words maximum) that summarizes the core wisdom.\n\nNote: {text}"
        return self.ollama.generate(prompt)
