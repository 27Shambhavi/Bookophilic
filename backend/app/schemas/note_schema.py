from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class NoteBase(BaseModel):
    content: str
    page_number: Optional[int] = None

class NoteCreate(NoteBase):
    book_id: int

class NoteUpdate(BaseModel):
    content: Optional[str] = None
    page_number: Optional[int] = None

class NoteResponse(NoteBase):
    id: int
    book_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
