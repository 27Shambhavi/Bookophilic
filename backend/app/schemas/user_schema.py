from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List
from datetime import datetime
import re

def validate_password_strength(v: str) -> str:
    if len(v) < 6:
        raise ValueError("Password must be at least 6 characters long")
    if not re.search(r"[A-Za-z]", v):
        raise ValueError("Password must contain at least one alphabetic letter")
    if not re.search(r"\d", v):
        raise ValueError("Password must contain at least one numeric digit")
    if not re.search(r"[@$!%*?&#_+-]", v):
        raise ValueError("Password must contain at least one special character (e.g. @$!%*?&#_+-)")
    return v

class UserPreferenceBase(BaseModel):
    preferred_genres: Optional[str] = None
    theme: Optional[str] = "dark"
    reading_goal_pages: Optional[int] = 50
    avatar: Optional[str] = None

class UserPreferenceUpdate(UserPreferenceBase):
    pass

class UserPreferenceResponse(UserPreferenceBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

    @field_validator('password')
    @classmethod
    def check_password_strength(cls, v):
        return validate_password_strength(v)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    preferences: Optional[UserPreferenceResponse] = None

    class Config:
        from_attributes = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str = Field(..., min_length=6)

    @field_validator('new_password')
    @classmethod
    def check_new_password_strength(cls, v):
        return validate_password_strength(v)

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

    @field_validator('new_password')
    @classmethod
    def check_new_password_strength(cls, v):
        return validate_password_strength(v)
