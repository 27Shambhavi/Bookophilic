from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from app.database.db import Base

class ReadingTracker(Base):
    __tablename__ = "reading_tracker"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    pages_read = Column(Integer, default=0)
    notes_taken = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    book = relationship("Book", back_populates="reading_sessions")
    user = relationship("User", back_populates="reading_sessions")

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey("books.id", ondelete="SET NULL"), nullable=True)  # link to our catalog if exists
    recommended_title = Column(String(255), nullable=False)
    recommended_author = Column(String(255), nullable=False)
    reason = Column(Text, nullable=True)
    score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    book = relationship("Book", back_populates="recommendations")

class EmbeddingMetadata(Base):
    __tablename__ = "embeddings_metadata"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String(50), nullable=False)  # "book", "note", "quote"
    entity_id = Column(Integer, nullable=False)
    chunk_index = Column(Integer, default=0)
    text_content = Column(Text, nullable=False)
    vector_id = Column(String(255), nullable=False)  # Key for custom vector storage/index reference
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
