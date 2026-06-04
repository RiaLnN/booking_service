from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.resource import ResourceCreate
from backend.models.user import User
from backend.models.resource import Resource
from backend.models.booking import Booking as BookingModel
from backend.schemas.resource import Booking
from typing import List
from sqlalchemy import select, delete, and_, cast, Date
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder
import json
from typing import List
from backend.helpers.cache import get_resource_cache_key, clear_room_timeline_cache
from datetime import date

async def create_room(
        data: ResourceCreate,
        user: User,
        session: AsyncSession
) -> Resource:
    new_room = Resource(**data.model_dump())
    
    session.add(new_room)
    await session.commit()
    await session.refresh(new_room)

    return new_room

async def get_rooms(
        user: User,
        session: AsyncSession
) -> List[Resource]:
    rooms = await session.execute(
        select(Resource)
    )

    return list(rooms.scalars().all())

async def delete_room(
    room_id: int,
    session: AsyncSession,
    redis_session: Redis
):
    try:
        result = await session.execute(
            select(Resource).where(Resource.id == room_id)
        )
        resource = result.scalar_one_or_none()

        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Room not found"
            )

        await session.delete(resource)
        await session.commit()
        await clear_room_timeline_cache(room_id=room_id, redis_session=redis_session)

    except HTTPException:
        raise
    except Exception as e:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal server error"
        )

async def get_room_ocupation_timeline(
        room_id: int,
        date: date,
        session: AsyncSession,
        redis_session: Redis
) -> List[Booking]:
    cache_key = get_resource_cache_key(room_id, date)
    timeline_raw = await redis_session.get(cache_key)
    if timeline_raw:
        cached_data = json.loads(timeline_raw)
        return [Booking(**item) for item in cached_data]
    
    results = await session.execute(
        select(BookingModel.id, BookingModel.start_time, BookingModel.end_time, BookingModel.is_booked)
        .where(
            and_(
                BookingModel.resource_id == room_id,
                cast(BookingModel.start_time, Date) <= date,
                cast(BookingModel.end_time, Date) >= date
            )
        )
    )
    res = [dict(row._mapping) for row in results.all()]
    validated_res = [Booking(**item) for item in res]

    if validated_res is not None:
        serializable_res = jsonable_encoder(validated_res)  
        await redis_session.set(cache_key, json.dumps(serializable_res), ex=3600)

    return validated_res