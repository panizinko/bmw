import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class Message(BaseModel):
    message: str


class SignUpCredentials(BaseModel):
    name: Optional[str] = Field(..., description="The name of the user")
    email: EmailStr = Field(..., description="The email of the user")
    password: str = Field(..., description="The password of the user")


class UserInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: Optional[str] = Field(..., description="The name of the user")
    email: EmailStr = Field(..., description="The email of the user")
    hashed_password: str = Field(..., description="The hashed password of the user")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class UserPublic(BaseModel):
    id: str
    name: Optional[str]
    email: EmailStr
    created_at: datetime
    updated_at: datetime
