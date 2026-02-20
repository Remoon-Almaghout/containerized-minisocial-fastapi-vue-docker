from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


