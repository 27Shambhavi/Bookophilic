from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.user_schema import (
    UserCreate, UserResponse, Token, UserPreferenceUpdate, UserPreferenceResponse,
    ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
)
from app.models.user_model import User, UserPreference
from app.services.auth_service import AuthService
from app.dependencies.auth import get_current_user
from datetime import datetime, timedelta
import random
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    hashed_pw = AuthService.get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_pw,
        full_name=user_data.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Initialize preferences
    prefs = UserPreference(
        user_id=db_user.id,
        preferred_genres="",
        theme="dark",
        reading_goal_pages=50
    )
    db.add(prefs)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not AuthService.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token = AuthService.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/preferences", response_model=UserPreferenceResponse)
def update_preferences(
    pref_data: UserPreferenceUpdate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    prefs = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not prefs:
        prefs = UserPreference(user_id=current_user.id)
        db.add(prefs)
        
    if pref_data.preferred_genres is not None:
        prefs.preferred_genres = pref_data.preferred_genres
    if pref_data.theme is not None:
        prefs.theme = pref_data.theme
    if pref_data.reading_goal_pages is not None:
        prefs.reading_goal_pages = pref_data.reading_goal_pages
        
    db.commit()
    db.refresh(prefs)
    return prefs

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User with this email does not exist"
        )
    
    otp = f"{random.randint(100000, 999999)}"
    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    EmailService.send_otp_email(user.email, otp)
    return {"message": "OTP code sent successfully to email"}

@router.post("/verify-otp")
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.otp_code or user.otp_code != req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    if not user.otp_expiry or user.otp_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP code has expired"
        )
    
    # Generate temporary password reset JWT token valid for 10 minutes
    reset_token = AuthService.create_access_token(
        data={"sub": user.email, "type": "password_reset"},
        expires_delta=timedelta(minutes=10)
    )
    return {"reset_token": reset_token}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = AuthService.decode_access_token(req.reset_token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired reset token"
        )
    
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update password and clear OTP fields
    user.hashed_password = AuthService.get_password_hash(req.new_password)
    user.otp_code = None
    user.otp_expiry = None
    db.commit()
    
    return {"message": "Password reset successfully"}
