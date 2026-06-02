from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.resource import ResourceCreate
from backend.models.user import User
from backend.models.resource import Resource
from backend.models.booking import Booking as BookingModel
from backend.schemas.resource import Booking
from typing import List
from sqlalchemy import select, delete, and_
from fastapi import HTTPException, status
from datetime import datetime, timezone
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder
import json
from typing import List

async def create_room(
        data: ResourceCreate,
        user: User,
        session: AsyncSession
) -> Resource:
    
    # TODO: check user.is_admin

    new_room = Resource(**data.model_dump())
    
    session.add(new_room)
    await session.commit()
    await session.refresh(new_room)

    return new_room

async def get_rooms(
        user: User,
        session: AsyncSession
) -> List[Resource]:
    
    # TODO: check user.is_admin

    rooms = await session.execute(
        select(Resource)
    )

    return list(rooms.scalars().all())

async def delete_room(
        room_id: int,
        user: User,
        session: AsyncSession
):
    
    # TODO: check user.is_admin

    try:
        await session.execute(
            delete(Resource)
            .where(Resource.id == room_id)
        )
        await session.commit()
    except:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Room don't exist")
    

async def get_room_ocupation_timeline(
        room_id: int,
        user: User,
        session: AsyncSession,
        redis_session: Redis
) -> List[Booking]:
    cache_key = f"resource:{room_id}"
    timeline_raw = await redis_session.get(cache_key)
    if timeline_raw:
        cached_data = json.loads(timeline_raw)
        return [Booking(**item) for item in cached_data]
    
    results = await session.execute(
        select(BookingModel.id, BookingModel.start_time, BookingModel.end_time)
        .where(
            and_(
                BookingModel.resource_id == room_id,
                BookingModel.end_time > datetime.now(timezone.utc)
            )
        )
    )
    res = [dict(row._mapping) for row in results.all()]
    validated_res = [Booking(**item) for item in res]

    if validated_res is not None:
        serializable_res = jsonable_encoder(validated_res)  
        await redis_session.set(cache_key, json.dumps(serializable_res), ex=3600)

    return validated_res