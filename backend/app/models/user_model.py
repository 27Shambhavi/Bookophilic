from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
import datetime
from app.database.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # OTP for password reset
    otp_code = Column(String(10), nullable=True)
    otp_expiry = Column(DateTime, nullable=True)

    # Relationships
    preferences = relationship("UserPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")
    books = relationship("Book", back_populates="owner")
    notes = relationship("Note", back_populates="user", cascade="all, delete-orphan")
    flashcards = relationship("Flashcard", back_populates="user", cascade="all, delete-orphan")
    reading_sessions = relationship("ReadingTracker", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    revision_schedules = relationship("RevisionSchedule", back_populates="user", cascade="all, delete-orphan")

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_genres = Column(Text, nullable=True)  # Comma-separated or JSON
    theme = Column(String(50), default="dark")
    reading_goal_pages = Column(Integer, default=50)
    avatar = Column(Text, nullable=True)  # E.g. Base64-encoded image URL or emoji
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="preferences")
