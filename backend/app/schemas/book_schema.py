from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class GenreBase(BaseModel):
    name: str

class GenreCreate(GenreBase):
    pass

class GenreResponse(GenreBase):
    id: int

    class Config:
        from_attributes = True

class QuoteBase(BaseModel):
    content: str
    author: Optional[str] = None

class QuoteCreate(QuoteBase):
    book_id: int

class QuoteResponse(QuoteBase):
    id: int
    book_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class BookBase(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    isbn: Optional[str] = None
    cover_image_url: Optional[str] = None
    page_count: int = 0
    current_page: int = 0
    status: str = "want_to_read"
    genre_id: Optional[int] = None
    subcategory: Optional[str] = None
    is_life_changing: Optional[bool] = False

class BookCreate(BookBase):
    pass

class BookUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    cover_image_url: Optional[str] = None
    page_count: Optional[int] = None
    current_page: Optional[int] = None
    status: Optional[str] = None
    genre_id: Optional[int] = None
    subcategory: Optional[str] = None
    is_life_changing: Optional[bool] = None

class BookResponse(BookBase):
    id: int
    user_id: int
    created_at: datetime
    genre: Optional[GenreResponse] = None

    class Config:
        from_attributes = True

class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: int
    book_id: int
    user_id: int
    content: str
    created_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
