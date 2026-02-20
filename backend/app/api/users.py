from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from ..db.models import User, Post
from ..schemas.user import UserOut, UserPublic
from ..schemas.post import PostOut
from .deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserPublic)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user

@router.get("/{user_id}/posts", response_model=list[PostOut])
def get_user_posts(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    posts = (
        db.query(Post)
        .options(
            joinedload(Post.likes),
            joinedload(Post.comments),
        )
        .filter(Post.user_id == user_id)
        .order_by(Post.created_at.desc())
        .all()
    )

    for p in posts:
        setattr(p, "username", user.username)
        setattr(p, "likes_count", len(p.likes))
        setattr(p, "comments_count", len(p.comments))
        setattr(p, "liked_by_me", False)  # optional auf Profilseite

    return posts

@router.get("/me", response_model=UserPublic)
def me(current_user: User = Depends(get_current_user)):
    return current_user