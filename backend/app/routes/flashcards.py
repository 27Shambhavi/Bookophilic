from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.flashcard_schema import FlashcardCreate, FlashcardResponse, FlashcardFeedback
from app.services.flashcard_service import FlashcardService
from app.models.user_model import User
from app.dependencies.auth import get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/flashcards", tags=["flashcards"])
flashcard_service = FlashcardService()

class GenerateFlashcardRequest(BaseModel):
    book_id: int
    text_content: str
    count: int = 5

@router.get("/", response_model=List[FlashcardResponse])
def get_all_flashcards(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return flashcard_service.get_flashcards_by_user(db, current_user.id)

@router.get("/book/{book_id}", response_model=List[FlashcardResponse])
def get_book_flashcards(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return flashcard_service.get_flashcards_by_book(db, current_user.id, book_id)

@router.get("/due", response_model=List[FlashcardResponse])
def get_due_flashcards(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return flashcard_service.get_due_flashcards(db, current_user.id)

@router.post("/", response_model=FlashcardResponse, status_code=status.HTTP_201_CREATED)
def create_flashcard(
    card_data: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return flashcard_service.create_flashcard(db, card_data, current_user.id)

@router.post("/generate", response_model=List[FlashcardResponse])
def generate_flashcards(
    req: GenerateFlashcardRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not req.text_content or not req.text_content.strip():
        raise HTTPException(status_code=400, detail="Text content is required to generate cards")
    cards = flashcard_service.generate_ai_flashcards(db, req.book_id, current_user.id, req.text_content, req.count)
    return cards

@router.post("/review")
def review_flashcard(
    feedback: FlashcardFeedback,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    schedule = flashcard_service.submit_review(db, feedback.flashcard_id, current_user.id, feedback.rating)
    if not schedule:
        raise HTTPException(status_code=404, detail="Flashcard revision schedule not found")
    return {"message": "Review recorded successfully", "next_review": schedule.next_review, "interval_days": schedule.interval_days}

class GenerateFromPdfRequest(BaseModel):
    book_id: int
    count: int = 5

@router.get("/stats")
def get_flashcard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return flashcard_service.get_user_stats(db, current_user.id)

@router.post("/generate-from-pdf", response_model=List[FlashcardResponse])
def generate_flashcards_from_pdf(
    req: GenerateFromPdfRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return flashcard_service.generate_flashcards_from_pdf_chunks(db, req.book_id, current_user.id, req.count)
