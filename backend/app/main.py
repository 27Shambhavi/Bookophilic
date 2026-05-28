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
        
    # Ensure otp_code and otp_expiry columns exist in users table
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_code VARCHAR(10) DEFAULT NULL"))
        print("Column otp_code added to users table successfully.")
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN otp_expiry DATETIME DEFAULT NULL"))
        print("Column otp_expiry added to users table successfully.")
    except Exception:
        pass

    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE user_preferences ADD COLUMN avatar TEXT DEFAULT NULL"))
        print("Column avatar added to user_preferences table successfully.")
    except Exception:
        # If column already exists, try to modify its type to accommodate base64 image files
        try:
            with engine.begin() as conn:
                db_url_str = str(engine.url)
                if "mysql" in db_url_str:
                    conn.execute(text("ALTER TABLE user_preferences MODIFY COLUMN avatar LONGTEXT DEFAULT NULL"))
                    print("Modified user_preferences.avatar column to LONGTEXT (MySQL).")
                elif "postgresql" in db_url_str:
                    conn.execute(text("ALTER TABLE user_preferences ALTER COLUMN avatar TYPE TEXT"))
                    print("Modified user_preferences.avatar column to TEXT (PostgreSQL).")
        except Exception as modify_err:
            print(f"Warning: Could not alter user_preferences.avatar column type: {modify_err}")
            pass
    
    # Auto-seed main genres
    from app.database.connection import SessionLocal
    from app.models.book_model import Genre
    db = SessionLocal()
    try:
        genre_names = [
            "Self-help", "Psychology", "Finance", "Philosophy", "Fiction", 
            "Business", "Spirituality", "Science", "Tech", "History",
            "Non-Fiction", "Biography"
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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print("GLOBAL EXCEPTION LOG:")
    print(tb)
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"Internal Server Error: {str(exc)}",
            "traceback": tb
        }
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
