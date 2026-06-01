import redis.asyncio as redis
from typing import AsyncGenerator
from app.core.redis import redis_manager
from app.database import SessionLocal
from sqlalchemy.ext.asyncio import AsyncSession

async def get_redis() -> AsyncGenerator[redis.Redis, None]:
    client = redis_manager.get_client()
    try:
        yield client
    finally:
        await client.close()

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
