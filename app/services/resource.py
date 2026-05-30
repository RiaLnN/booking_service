from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.resource import ResourceCreate
from app.models.user import User
from app.models.resource import Resource
from app.models.booking import Booking
from typing import List
from sqlalchemy import select, delete, and_
from fastapi import HTTPException, status
from datetime import datetime

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
        session: AsyncSession
):
    results = await session.execute(
        select(Booking.start_time, Booking.end_time)
        .where(
            and_(
                Booking.resource_id == room_id,
                Booking.end_time > datetime.now()
            )
        )
    )
    res = results.all()
    print(res)
    return res