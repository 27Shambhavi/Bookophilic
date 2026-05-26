import sys
import os
from sqlalchemy.orm import Session
from datetime import datetime

# Resolve ai-services module path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
AI_SERVICES_DIR = os.path.join(ROOT_DIR, "ai-services")
if AI_SERVICES_DIR not in sys.path:
    sys.path.append(AI_SERVICES_DIR)

from app.models.reading_tracker_model import Recommendation
from app.models.user_model import UserPreference
from app.models.book_model import Book, Genre
from recommendation_engine.recommendation import BookRecommendationEngine

class RecommendationService:
    def __init__(self):
        self.engine = BookRecommendationEngine()

    def get_user_recommendations(self, db: Session, user_id: int):
        return db.query(Recommendation).filter(Recommendation.user_id == user_id).order_by(Recommendation.score.desc()).all()

    def generate_and_save_recommendations(self, db: Session, user_id: int, count: int = 5) -> list:
        # 1. Fetch user preferences
        prefs = db.query(UserPreference).filter(UserPreference.user_id == user_id).first()
        preferred_genres = []
        if prefs and prefs.preferred_genres:
            preferred_genres = [g.strip() for g in prefs.preferred_genres.split(",")]

        user_prefs_dict = {"preferred_genres": preferred_genres}

        # 2. Fetch user's own books (read or reading)
        user_books = db.query(Book).filter(Book.user_id == user_id).all()
        user_books_dict = []
        for b in user_books:
            genres_list = [b.genre.name] if b.genre else []
            user_books_dict.append({
                "id": b.id,
                "title": b.title,
                "author": b.author,
                "description": b.description or "",
                "genres": genres_list
            })

        # 3. Fetch general catalog combined with system catalog
        catalog_books = db.query(Book).filter(Book.user_id != user_id).all()
        
        system_catalog = [
            {"title": "The Lean Startup", "author": "Eric Ries", "description": "How today's entrepreneurs use continuous innovation to create radically successful businesses.", "genres": ["Business"]},
            {"title": "Thinking, Fast and Slow", "author": "Daniel Kahneman", "description": "An in-depth look at the two systems that drive the way we think—System 1 (fast) and System 2 (slow).", "genres": ["Psychology"]},
            {"title": "Zero to One", "author": "Peter Thiel", "description": "Notes on startups, or how to build the future. Focuses on creating something entirely new.", "genres": ["Business"]},
            {"title": "The Intelligent Investor", "author": "Benjamin Graham", "description": "The classic text on value investing, providing strategies for long-term financial success.", "genres": ["Finance"]},
            {"title": "Deep Work", "author": "Cal Newport", "description": "Rules for focused success in a distracted world, emphasizing cognitive concentration.", "genres": ["Self-help"]},
            {"title": "Principles: Life and Work", "author": "Ray Dalio", "description": "Principles and rules of thumb developed while building Bridgewater Associates.", "genres": ["Business"]},
            {"title": "Introduction to Algorithms", "author": "Thomas H. Cormen", "description": "A comprehensive textbook on computer algorithms, data structures, and mathematical analysis.", "genres": ["Tech"]},
            {"title": "Artificial Intelligence: A Modern Approach", "author": "Stuart Russell", "description": "The leading textbook in artificial intelligence, covering agent models, ML, logic, and planning.", "genres": ["Tech"]},
            {"title": "A Brief History of Time", "author": "Stephen Hawking", "description": "A landmark popular science book about cosmology, black holes, space-time, and quantum gravity.", "genres": ["Science"]},
            {"title": "Clean Code", "author": "Robert C. Martin", "description": "A handbook of agile software craftsmanship, explaining how to write readable, maintainable software.", "genres": ["Tech"]},
            {"title": "Sapiens: A Brief History of Humankind", "author": "Yuval Noah Harari", "description": "A historical analysis of human development from ancient hominids to modern civilization.", "genres": ["History"]},
            {"title": "Beyond Good and Evil", "author": "Friedrich Nietzsche", "description": "A philosophical text exploring morality, truth, and the will to power.", "genres": ["Philosophy"]}
        ]

        user_titles = {b.title.lower().strip() for b in user_books}
        added_titles = set()
        catalog_dict = []

        # Add other user's books if not owned by this user and not already added to catalog
        for b in catalog_books:
            title_norm = b.title.lower().strip()
            if title_norm not in user_titles and title_norm not in added_titles:
                genres_list = [b.genre.name] if b.genre else []
                catalog_dict.append({
                    "id": b.id,
                    "title": b.title,
                    "author": b.author,
                    "description": b.description or "",
                    "genres": genres_list
                })
                added_titles.add(title_norm)

        # Add system books if not owned by this user and not already added to catalog
        for idx, sys_b in enumerate(system_catalog):
            title_norm = sys_b["title"].lower().strip()
            if title_norm not in user_titles and title_norm not in added_titles:
                catalog_dict.append({
                    "id": -100 - idx,  # Unique negative ID
                    "title": sys_b["title"],
                    "author": sys_b["author"],
                    "description": sys_b["description"],
                    "genres": sys_b["genres"]
                })
                added_titles.add(title_norm)

        # 4. Generate recommendations using engine
        recs = self.engine.generate_recommendations(
            user_preferences=user_prefs_dict,
            user_books=user_books_dict,
            catalog=catalog_dict,
            top_n=count
        )

        # 5. Clear old recommendations
        db.query(Recommendation).filter(Recommendation.user_id == user_id).delete()
        db.commit()

        # 6. Save new recommendations to database
        db_recs = []
        for r in recs:
            db_rec = Recommendation(
                user_id=user_id,
                book_id=r["book_id"],
                recommended_title=r["recommended_title"],
                recommended_author=r["recommended_author"],
                reason=r["reason"],
                score=r["score"]
            )
            db.add(db_rec)
            db_recs.append(db_rec)

        db.commit()
        return db_recs
