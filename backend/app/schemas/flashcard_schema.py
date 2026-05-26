from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RevisionScheduleBase(BaseModel):
    next_review: datetime
    interval_days: int
    ease_factor: float
    repetitions: int
    last_reviewed: Optional[datetime] = None

class RevisionScheduleResponse(RevisionScheduleBase):
    id: int
    flashcard_id: int
    user_id: int

    class Config:
        from_attributes = True

class FlashcardBase(BaseModel):
    question: str
    answer: str
    difficulty: Optional[str] = "medium"

class FlashcardCreate(FlashcardBase):
    book_id: int

class FlashcardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[str] = None

class FlashcardResponse(FlashcardBase):
    id: int
    book_id: int
    user_id: int
    created_at: datetime
    revision_schedule: Optional[RevisionScheduleResponse] = None

    class Config:
        from_attributes = True

class FlashcardFeedback(BaseModel):
    flashcard_id: int
    rating: int  # 0 to 5 response score for SuperMemo SM-2 algorithm
