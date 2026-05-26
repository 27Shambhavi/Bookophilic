from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserPreferenceBase(BaseModel):
    preferred_genres: Optional[str] = None
    theme: Optional[str] = "dark"
    reading_goal_pages: Optional[int] = 50

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
