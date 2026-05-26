from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database.connection import get_db
from app.schemas.book_schema import BookCreate, BookUpdate, BookResponse, GenreResponse, GenreCreate, CommentCreate, CommentResponse
from app.models.book_model import Book, Genre, BookComment
from app.models.user_model import User
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/", response_model=List[BookResponse])
def get_books(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Book).filter(Book.user_id == current_user.id).all()

@router.get("/genres", response_model=List[GenreResponse])
def get_genres(db: Session = Depends(get_db)):
    return db.query(Genre).all()

@router.post("/genres", response_model=GenreResponse, status_code=status.HTTP_201_CREATED)
def create_genre(genre_data: GenreCreate, db: Session = Depends(get_db)):
    existing = db.query(Genre).filter(Genre.name == genre_data.name).first()
    if existing:
        return existing
    db_genre = Genre(name=genre_data.name)
    db.add(db_genre)
    db.commit()
    db.refresh(db_genre)
    return db_genre

@router.post("/", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
def create_book(
    book_data: BookCreate, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    db_book = Book(
        title=book_data.title,
        author=book_data.author,
        description=book_data.description,
        isbn=book_data.isbn,
        cover_image_url=book_data.cover_image_url,
        page_count=book_data.page_count,
        current_page=book_data.current_page,
        status=book_data.status,
        genre_id=book_data.genre_id,
        subcategory=book_data.subcategory,
        is_life_changing=book_data.is_life_changing,
        user_id=current_user.id
    )
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    return db_book

@router.get("/{book_id}", response_model=BookResponse)
def get_book(
    book_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@router.put("/{book_id}", response_model=BookResponse)
def update_book(
    book_id: int,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    for key, val in book_data.dict(exclude_unset=True).items():
        setattr(book, key, val)
        
    db.commit()
    db.refresh(book)
    return book

@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_book(
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id, Book.user_id == current_user.id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return None

@router.get("/{book_id}/comments", response_model=List[CommentResponse])
def get_comments(
    book_id: int,
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    comments = db.query(BookComment).filter(BookComment.book_id == book_id).order_by(BookComment.created_at.desc()).all()
    
    res = []
    for c in comments:
        res.append(CommentResponse(
            id=c.id,
            book_id=c.book_id,
            user_id=c.user_id,
            content=c.content,
            created_at=c.created_at,
            user_name=c.user.full_name or c.user.email if c.user else "Anonymous"
        ))
    return res

@router.post("/{book_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    book_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    db_comment = BookComment(
        book_id=book_id,
        user_id=current_user.id,
        content=comment_data.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return CommentResponse(
        id=db_comment.id,
        book_id=db_comment.book_id,
        user_id=db_comment.user_id,
        content=db_comment.content,
        created_at=db_comment.created_at,
        user_name=current_user.full_name or current_user.email
    )
