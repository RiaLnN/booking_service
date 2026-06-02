import redis.asyncio as redis
from backend.core.config import settings


class RedisManager:
    def __init__(self):
        self.pool: redis.ConnectionPool | None = None

    def init_pool(self) -> None:
        self.pool = redis.ConnectionPool(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD,
            decode_responses=True,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            socket_timeout=5.0,
        )
    
    async def close_pool(self) -> None:
        if self.pool:
            await self.pool.aclose()
    
    def get_client(self) -> redis.Redis:
        if not self.pool:
            raise RuntimeError("Redis connection pool is not initialized")
        
        return redis.Redis(connection_pool=self.pool)
    
redis_manager = RedisManager()