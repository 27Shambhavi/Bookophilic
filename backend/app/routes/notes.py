from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.note_schema import NoteCreate, NoteUpdate, NoteResponse
from app.services.note_service import NoteService
from app.models.user_model import User
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["notes"])
note_service = NoteService()

@router.get("/", response_model=List[NoteResponse])
def get_all_notes(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    return note_service.get_notes_by_user(db, current_user.id)

@router.get("/book/{book_id}", response_model=List[NoteResponse])
def get_book_notes(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.get_notes_by_book(db, current_user.id, book_id)

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.create_note(db, note_data, current_user.id)

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_data: NoteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    note = note_service.update_note(db, note_id, current_user.id, note_data)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found or unauthorized")
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = note_service.delete_note(db, note_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Note not found or unauthorized")
    return None

@router.post("/book/{book_id}/summarize")
def summarize_notes(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    summary = note_service.summarize_user_notes(db, current_user.id, book_id)
    return {"summary": summary}

@router.post("/book/{book_id}/reflect")
def reflect_on_notes(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reflections = note_service.generate_note_reflections(db, current_user.id, book_id)
    return {"reflections": reflections}

from pydantic import BaseModel

class ActionPointsRequest(BaseModel):
    text: str

class QuizRequest(BaseModel):
    text: str

class SummarySingleRequest(BaseModel):
    text: str

@router.post("/action-points")
def get_action_points(req: ActionPointsRequest):
    return {"action_points": note_service.generate_action_points(req.text)}

@router.post("/quiz")
def get_quiz(req: QuizRequest):
    return {"quiz": note_service.generate_quiz(req.text)}

@router.post("/summarize-single")
def get_summarize_single(req: SummarySingleRequest):
    return {"summary": note_service.generate_single_summary(req.text)}

@router.get("/semantic-search")
def get_semantic_search_notes(
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return note_service.semantic_search_notes(db, current_user.id, query)
