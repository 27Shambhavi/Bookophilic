from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine
from app.database.db import Base

# Import all models to ensure they are registered with Base.metadata before create_all
from app.models.user_model import User, UserPreference
from app.models.book_model import Book, Genre, Quote, BookComment
from app.models.note_model import Note
from app.models.flashcard_model import Flashcard, RevisionSchedule
from app.models.reading_tracker_model import ReadingTracker, Recommendation, EmbeddingMetadata

# Create all tables in the database (MySQL)
try:
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
    
    # Ensure is_life_changing column exists
    from sqlalchemy import text
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE books ADD COLUMN is_life_changing BOOLEAN DEFAULT 0"))
        print("Column is_life_changing added to books table successfully.")
    except Exception as alter_err:
        # Column already exists or table not initialized yet
        pass
    
    # Auto-seed main genres
    from app.database.connection import SessionLocal
    from app.models.book_model import Genre
    db = SessionLocal()
    try:
        genre_names = [
            "Self-help", "Psychology", "Finance", "Philosophy", "Fiction", 
            "Business", "Spirituality", "Science", "Tech", "History"
        ]
        for name in genre_names:
            existing = db.query(Genre).filter(Genre.name == name).first()
            if not existing:
                db.add(Genre(name=name))
        db.commit()
        print("Database genres seeded successfully.")
    except Exception as seed_err:
        print(f"Warning: Could not seed database genres: {seed_err}")
    finally:
        db.close()
except Exception as e:
    print(f"Warning: Could not auto-initialize database tables: {e}")
    print("Ensure MySQL server is running and database configuration in .env is correct.")

app = FastAPI(
    title="Bookophilic API",
    description="Backend API services for Bookophilic - AI Powered Book Tracker",
    version="1.0.0"
)

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from app.routes.auth import router as auth_router
from app.routes.books import router as books_router
from app.routes.notes import router as notes_router
from app.routes.flashcards import router as flashcards_router
from app.routes.recommendations import router as recommendations_router
from app.routes.ai_routes import router as ai_router

app.include_router(auth_router, prefix="/api")
app.include_router(books_router, prefix="/api")
app.include_router(notes_router, prefix="/api")
app.include_router(flashcards_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(ai_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "app": "Bookophilic API",
        "status": "online",
        "docs_url": "/docs"
    }
