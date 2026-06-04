from datetime import date
from redis.asyncio import Redis

def get_resource_cache_key(room_id: int, date: date):
    return f"room:{room_id}:timeline:{date.isoformat()}"

async def clear_room_timeline_cache(room_id: int, redis_session: Redis):
    pattern = f"room:{room_id}:timeline:*"
    
    cursor = 0
    while True:
        cursor, keys = await redis_session.scan(cursor, match=pattern, count=100)
        if keys:
            await redis_session.delete(*keys)
        if cursor == 0:
            break

