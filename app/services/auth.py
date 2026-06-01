from sqlalchemy.ext.asyncio import AsyncSession 
from app.models.user import User
from sqlalchemy import select
from app.schemas.auth import UserCreate, UserLogin
from fastapi import HTTPException, status
from typing import Annotated
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from app.core import security
from app.database import get_session
import jwt

async def user_exist(
        data: UserCreate | UserLogin,
        session: AsyncSession
) -> User | None:
    user = await session.execute(
        select(User)
        .where(User.email == data.email)
    )
    return user.scalar_one_or_none()


async def save_user(
        data: UserCreate, 
        session: AsyncSession
) -> User:
    new_user = await user_exist(data=data, session=session)
    
    if (new_user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exist")
    
    new_user = User (
        username=data.username,
        email=data.email,
        hashed_password=security.hash_password(data.password)
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    return new_user

async def login_user (
        data: UserLogin,
        session: AsyncSession
) -> User:
    user = await user_exist(data=data, session=session)

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User dont exist")
    
    return user

async def get_user_by_id(
        id: int,
        session: AsyncSession
) -> User | None:
    user = await session.execute(
        select(User)
        .where(User.id == id)
    )
    return user.scalar_one_or_none()

async def get_current_user(
        credentials: Annotated[HTTPAuthorizationCredentials, Depends(security.security)],
        session: Annotated[AsyncSession, Depends(get_session)]
) -> User:
    token = credentials.credentials

    try:
        payload = security.get_payload(token)
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
        
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    user = await get_user_by_id(user_id, session)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    return user
