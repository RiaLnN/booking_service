from pydantic import BaseModel, Field, EmailStr

class UserBase(BaseModel):
    pass

class UserCreate(UserBase):
    username: str = Field(min_length=3, max_length=20)
    email: EmailStr
    password: str = Field(min_length=6)

class UserLogin(UserBase):
    email: EmailStr
    password: str = Field(min_length=6)

class User(UserBase):
    id: int
    username: str
    email: EmailStr
    hashed_password: str

class UserResponse(UserBase):
    user: User
    token: str

