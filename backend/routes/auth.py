from fastapi import APIRouter, Depends
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from backend.routes.deps import get_session
from backend.services import auth as auth_service
from backend.schemas.auth import UserCreate, UserLogin, UserResponse
from backend.core.security import create_jwt

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(
    data: UserCreate, 
    session: Annotated[AsyncSession, Depends(get_session)]
):
    user = await auth_service.save_user(data, session)
    return {"user": user, "token": create_jwt(user.id)}


@router.post("/login", response_model=UserResponse)
async def login(
    data: UserLogin, 
    session: Annotated[AsyncSession, Depends(get_session)]
):
    user = await auth_service.login_user(data, session)
    return {"user": user, "token": create_jwt(user.id)}