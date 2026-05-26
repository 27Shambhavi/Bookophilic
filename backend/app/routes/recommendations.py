from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.services.recommendation_service import RecommendationService
from app.models.user_model import User
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/recommendations", tags=["recommendations"])
rec_service = RecommendationService()

@router.get("/")
def get_recommendations(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    recs = rec_service.get_user_recommendations(db, current_user.id)
    return recs

@router.post("/generate")
def generate_recommendations(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    recs = rec_service.generate_and_save_recommendations(db, current_user.id)
    return {"message": f"Successfully generated {len(recs)} recommendations", "data": recs}
