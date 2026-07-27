from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import datetime
from app.database.db import Base

class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

    books = relationship("Book", back_populates="genre")

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    author = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    isbn = Column(String(50), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    page_count = Column(Integer, default=0)
    current_page = Column(Integer, default=0)
    status = Column(String(50), default="want_to_read")  # want_to_read, reading, completed
    genre_id = Column(Integer, ForeignKey("genres.id", ondelete="SET NULL"), nullable=True)
    subcategory = Column(String(100), nullable=True)
    is_life_changing = Column(Boolean, default=False, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="books")
    genre = relationship("Genre", back_populates="books")
    notes = relationship("Note", back_populates="book", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="book", cascade="all, delete-orphan")
    quotes = relationship("Quote", back_populates="book", cascade="all, delete-orphan")
    reading_sessions = relationship("ReadingTracker", back_populates="book", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="book", cascade="all, delete-orphan")
    comments = relationship("BookComment", back_populates="book", cascade="all, delete-orphan")
    pdf_chunks = relationship("PDFChunk", back_populates="book", cascade="all, delete-orphan")

    @property
    def has_pdf(self) -> bool:
        return len(self.pdf_chunks) > 0

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String(255), nullable=True)  # Book author or custom
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="quotes")

class BookComment(Base):
    __tablename__ = "book_comments"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="comments")
    user = relationship("User")

class PDFChunk(Base):
    __tablename__ = "pdf_chunks"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    book = relationship("Book", back_populates="pdf_chunks")
    user = relationship("User")
