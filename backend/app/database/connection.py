from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config.config import settings
from app.database.db import Base

# Try to connect to the configured database, fallback to SQLite if connection fails
engine = None
try:
    db_url = settings.DATABASE_URL
    # Render / Heroku PostgreSQL URL fix
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
        
    if db_url.startswith("mysql"):
        # Quick test connection check
        test_engine = create_engine(db_url, connect_args={"connect_timeout": 2})
        with test_engine.connect() as conn:
            pass
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_recycle=3600
        )
        print("Connected to MySQL database successfully.")
    elif db_url.startswith("postgresql"):
        # Quick check if dialect / postgres driver is loaded
        test_engine = create_engine(db_url)
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("Connected to PostgreSQL database successfully.")
    else:
        test_engine = create_engine(db_url)
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        print("Connected to database successfully.")
except Exception as e:
    print(f"Warning: Could not connect to database at '{settings.DATABASE_URL}': {e}")
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
