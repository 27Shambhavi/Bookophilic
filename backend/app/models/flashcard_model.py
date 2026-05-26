from sqlalchemy import Column, Integer, Text, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from app.database.db import Base

class Flashcard(Base):
    __tablename__ = "flashcards"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    book = relationship("Book", back_populates="flashcards")
    user = relationship("User", back_populates="flashcards")
    revision_schedule = relationship("RevisionSchedule", back_populates="flashcard", uselist=False, cascade="all, delete-orphan")

class RevisionSchedule(Base):
    __tablename__ = "revision_schedule"

    id = Column(Integer, primary_key=True, index=True)
    flashcard_id = Column(Integer, ForeignKey("flashcards.id", ondelete="CASCADE"), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    next_review = Column(DateTime, default=datetime.datetime.utcnow)
    interval_days = Column(Integer, default=1)
    ease_factor = Column(Float, default=2.5)
    repetitions = Column(Integer, default=0)
    last_reviewed = Column(DateTime, nullable=True)

    # Relationships
    flashcard = relationship("Flashcard", back_populates="revision_schedule")
    user = relationship("User", back_populates="revision_schedules")
