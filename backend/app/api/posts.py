import os
import time
from fastapi import APIRouter, Depends, HTTPException,UploadFile, File ,Query
from sqlalchemy.orm import Session,joinedload
from datetime import datetime

from ..db.models import Post, User
from ..schemas.post import PostCreate, PostUpdate, PostOut
from .deps import get_db, get_current_user
from ..core.config import settings
from ..db.models import Like,Comment
from ..schemas.comment import CommentCreate, CommentOut


router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("", response_model=list[PostOut])
def list_posts(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.owner), joinedload(Post.likes))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    for p in posts:
        setattr(p, "username", p.owner.username if p.owner else None)
        setattr(p, "likes_count", len(p.likes))
        setattr(p, "liked_by_me", False)

    return posts

@router.get("/me-feed", response_model=list[PostOut])
def my_feed(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=50),
    offset: int = Query(0, ge=0),
):
    posts = (
        db.query(Post)
        .options(joinedload(Post.owner), joinedload(Post.likes))
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    liked_post_ids = {
        x[0]
        for x in db.query(Like.post_id)
        .filter(Like.user_id == user.id)
        .all()
    }

    for p in posts:
        setattr(p, "username", p.owner.username if p.owner else None)
        setattr(p, "likes_count", len(p.likes))
        setattr(p, "liked_by_me", p.id in liked_post_ids)

    return posts

@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    return post

@router.post("", response_model=PostOut)
def create_post(
    data: PostCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = Post(
        user_id=user.id,
        content=data.content,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post

@router.put("/{post_id}", response_model=PostOut)
def update_post(
    post_id: int,
    data: PostUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(404, "Post not found")

    if post.user_id != user.id:
        raise HTTPException(403, "Not allowed")

    post.content = data.content
    post.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(post)
    return post

@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(404, "Post not found")

    if post.user_id != user.id:
        raise HTTPException(403, "Not allowed")

    # Bild löschen, falls vorhanden
    if post.image_path:
        rel = post.image_path.replace("/uploads/", "").lstrip("/")
        full = os.path.join(settings.UPLOAD_DIR, rel)

        if os.path.exists(full):
            os.remove(full)

    db.delete(post)
    db.commit()

    return {"status": "deleted"}

@router.post("/{post_id}/image", response_model=PostOut)
def upload_post_image(
    post_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")
    if post.user_id != user.id:
        raise HTTPException(403, "Not allowed")

    # 1) Extension check
    ext = (file.filename.split(".")[-1] if "." in file.filename else "").lower()
    allowed = settings.allowed_exts
    if ext not in allowed:
        raise HTTPException(400, f"Invalid file extension. Allowed: {sorted(allowed)}")

    # 2) MIME type check
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "Invalid MIME type")

    # 3) Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    filename = f"post{post_id}_{int(time.time())}.{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)

    with open(filepath, "wb") as f:
        f.write(file.file.read())

    # 4) optional: delete old image
    if post.image_path:
        old_path = post.image_path.replace("/uploads/", "").lstrip("/")
        old_full = os.path.join(settings.UPLOAD_DIR, old_path)
        if os.path.exists(old_full):
            os.remove(old_full)

    # 5) Store public URL path
    post.image_path = f"/uploads/{filename}"
    post.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(post)
    return post

@router.post("/{post_id}/like")
def like_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")

    existing = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user.id).first()
    if existing:
        return {"status": "already_liked"}

    like = Like(post_id=post_id, user_id=user.id)
    db.add(like)
    db.commit()
    return {"status": "liked"}

@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    like = db.query(Like).filter(Like.post_id == post_id, Like.user_id == user.id).first()
    if not like:
        return {"status": "not_liked"}

    db.delete(like)
    db.commit()
    return {"status": "unliked"}

@router.get("/{post_id}/comments", response_model=list[CommentOut])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")

    return (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

@router.post("/{post_id}/comments", response_model=CommentOut)
def add_comment(
    post_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(404, "Post not found")

    c = Comment(post_id=post_id, user_id=user.id, content=data.content)
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    c = db.query(Comment).filter(Comment.id == comment_id).first()
    if not c:
        raise HTTPException(404, "Comment not found")

    if c.user_id != user.id:
        raise HTTPException(403, "Not allowed")

    db.delete(c)
    db.commit()
    return {"status": "deleted"}
