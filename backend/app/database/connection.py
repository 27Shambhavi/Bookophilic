from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.config import settings
from app.database.db import Base

# Try to connect to MySQL database, fallback to SQLite if connection fails
try:
    if settings.DATABASE_URL.startswith("mysql"):
        # Quick test connection check
        test_engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            pass
        engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        print("Connected to MySQL database successfully.")
    else:
        engine = create_engine(settings.DATABASE_URL)
except Exception as e:
    print(f"Warning: Could not connect to MySQL Database at '{settings.DATABASE_URL}': {e}")
    print("Falling back to local SQLite database: sqlite:///bookophilic.db")
    engine = create_engine(
        "sqlite:///bookophilic.db",
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
