import redis.asyncio as redis
from typing import AsyncGenerator
from backend.core.redis import redis_manager
from backend.database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from backend.core import security
from fastapi import Depends, HTTPException, status
import jwt
from backend.models import User
from backend.services.auth import get_user_by_id
from fastapi.security import HTTPAuthorizationCredentials

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    client = redis_manager.get_client()
    try:
        yield client
    finally:
        await client.close()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session

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

async def get_admin_user(
        user: Annotated[User, Depends(get_current_user)]
) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enouth priveleges")
    return user