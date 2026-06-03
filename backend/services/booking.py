from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from backend.models.booking import Booking as BookingModel
import json
from backend.schemas.booking import BookingCreate
from backend.models.user import User
from fastapi import HTTPException, status
from typing import List
from backend.models.resource import Resource
from redis.asyncio import Redis
from fastapi.encoders import jsonable_encoder
from backend.schemas.resource import Booking

async def create_book(
        data: BookingCreate,
        user: User,
        session: AsyncSession,
        redis_session: Redis
) -> BookingModel:
    resource_result = await session.execute(
        select(Resource)
        .where(Resource.id == data.resource_id)
        .with_for_update()
    )
    resource = resource_result.scalar_one_or_none()

    if resource is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    
    if not resource.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resource is inactive")
    
    busy_result = await session.execute(
        select(BookingModel)
        .where(
            and_(
                BookingModel.resource_id == data.resource_id,
                data.start_time < BookingModel.end_time,
                data.end_time > BookingModel.start_time
            )
        )
    )
    existing_book = busy_result.scalar_one_or_none()
    if existing_book is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This timeslot is already booked")
    
    new_book = BookingModel(**data.model_dump(), user_id=user.id)
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book)
    cache_key = f"resource:{data.resource_id}"
    await redis_session.delete(cache_key)

    return new_book

async def get_books(
        user: User,
        session: AsyncSession
) -> List[BookingModel]:
    books = await session.execute(
        select(BookingModel)
        .where(BookingModel.user_id == user.id)
    )
    return list(books.scalars().all())

async def delete_book(
    book_id: int,
    user: User,
    session: AsyncSession,
    redis_session: Redis
):
    result = await session.execute(
        select(BookingModel)
        .where(
            and_(
                BookingModel.id == book_id,
                BookingModel.user_id == user.id
            )
        )
    )
    book = result.scalar_one_or_none()
    if book is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Book does not exist")
    
    resource_id = book.resource_id 

    await session.execute(
        delete(BookingModel)
        .where(BookingModel.id == book_id)
    )
    await session.commit()
    
    await redis_session.delete(f"resource:{resource_id}")
