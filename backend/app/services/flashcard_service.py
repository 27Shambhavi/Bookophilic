import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Resolve ai-services module path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from app.models.flashcard_model import Flashcard, RevisionSchedule
from app.models.book_model import Book
from app.schemas.flashcard_schema import FlashcardCreate, FlashcardUpdate
from flashcard_generation.flashcard_agent import FlashcardAgent
from agents.revision_agent import RevisionAgent

class FlashcardService:
    def __init__(self):
        self.agent = FlashcardAgent()

    def get_flashcards_by_user(self, db: Session, user_id: int):
        return db.query(Flashcard).filter(Flashcard.user_id == user_id).all()

    def get_flashcards_by_book(self, db: Session, user_id: int, book_id: int):
        return db.query(Flashcard).filter(
            Flashcard.user_id == user_id, 
            Flashcard.book_id == book_id
        ).all()

    def get_due_flashcards(self, db: Session, user_id: int):
        now = datetime.utcnow()
        return db.query(Flashcard).join(RevisionSchedule).filter(
            Flashcard.user_id == user_id,
            RevisionSchedule.next_review <= now
        ).all()

    def create_flashcard(self, db: Session, card_data: FlashcardCreate, user_id: int) -> Flashcard:
        db_card = Flashcard(
            book_id=card_data.book_id,
            user_id=user_id,
            question=card_data.question,
            answer=card_data.answer,
            difficulty=card_data.difficulty or "medium"
        )
        db.add(db_card)
        db.commit()
        db.refresh(db_card)

        # Initialize revision schedule
        db_schedule = RevisionSchedule(
            flashcard_id=db_card.id,
            user_id=user_id,
            next_review=datetime.utcnow(),
            interval_days=1,
            ease_factor=2.5,
            repetitions=0
        )
        db.add(db_schedule)
        db.commit()
        
        return db_card

    def generate_ai_flashcards(self, db: Session, book_id: int, user_id: int, text_content: str, count: int = 5):
        # 1. Ask FlashcardAgent to generate questions and answers
        cards_list = self.agent.generate_flashcards(text_content, num_cards=count)
        
        created_cards = []
        for item in cards_list:
            q = item.get("question")
            a = item.get("answer")
            if q and a:
                # Create card
                card_schema = FlashcardCreate(book_id=book_id, question=q, answer=a, difficulty="medium")
                card = self.create_flashcard(db, card_schema, user_id)
                created_cards.append(card)
                
        return created_cards

    def submit_review(self, db: Session, flashcard_id: int, user_id: int, rating: int) -> RevisionSchedule:
        schedule = db.query(RevisionSchedule).filter(
            RevisionSchedule.flashcard_id == flashcard_id,
            RevisionSchedule.user_id == user_id
        ).first()
        
        if not schedule:
            return None

        # Run SM-2 algorithm
        results = RevisionAgent.calculate_next_review(
            rating=rating,
            current_repetitions=schedule.repetitions,
            current_interval=schedule.interval_days,
            current_ease_factor=schedule.ease_factor
        )

        # Update schedule
        schedule.next_review = results["next_review"]
        schedule.interval_days = results["interval_days"]
        schedule.ease_factor = results["ease_factor"]
        schedule.repetitions = results["repetitions"]
        schedule.last_reviewed = datetime.utcnow()

        db.commit()
        db.refresh(schedule)
        return schedule

    def get_user_stats(self, db: Session, user_id: int):
        total_cards = db.query(Flashcard).filter(Flashcard.user_id == user_id).count()
        
        now = datetime.utcnow()
        due_cards = db.query(Flashcard).join(RevisionSchedule).filter(
            Flashcard.user_id == user_id,
            RevisionSchedule.next_review <= now
        ).count()
        
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        reviewed_today = db.query(RevisionSchedule).filter(
            RevisionSchedule.user_id == user_id,
            RevisionSchedule.last_reviewed >= today_start
        ).count()
        
        total_reviewed = db.query(RevisionSchedule).filter(
            RevisionSchedule.user_id == user_id,
            RevisionSchedule.repetitions > 0
        ).count()
        
        return {
            "total_cards": total_cards,
            "due_cards": due_cards,
            "reviewed_today": reviewed_today,
            "total_reviewed": total_reviewed
        }

    def generate_flashcards_from_pdf_chunks(self, db: Session, book_id: int, user_id: int, count: int = 5):
        from app.models.book_model import PDFChunk
        
        chunks = db.query(PDFChunk).filter(PDFChunk.book_id == book_id, PDFChunk.user_id == user_id).all()
        if not chunks:
            book = db.query(Book).filter(Book.id == book_id, Book.user_id == user_id).first()
            description = book.description if book else "A study book context."
            return self.generate_ai_flashcards(db, book_id, user_id, description, count)
            
        import random
        sample_size = min(len(chunks), max(3, count))
        selected_chunks = random.sample(chunks, sample_size)
        selected_chunks.sort(key=lambda x: x.chunk_index)
        
        combined_text = "\n\n".join([c.content for c in selected_chunks])
        return self.generate_ai_flashcards(db, book_id, user_id, combined_text, count)
