from pydantic import BaseModel, Field
from datetime import datetime

class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)

class PostUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)

class PostOut(BaseModel):
    id: int
    user_id: int
    content: str
    image_path: str | None
    created_at: datetime
    updated_at: datetime

    username: str | None = None
    likes_count: int = 0
    comments_count: int = 0 
    liked_by_me: bool = False

    class Config:
        from_attributes = True

