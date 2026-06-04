from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from backend.models.booking import Booking as BookingModel
from backend.schemas.booking import BookingCreate
from backend.models.user import User
from fastapi import HTTPException, status
from typing import List
from backend.models.resource import Resource
from redis.asyncio import Redis
from backend.helpers.cache import get_resource_cache_key, clear_room_timeline_cache

async def create_book(
        data: BookingCreate,
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
    
    new_book = BookingModel(**data.model_dump())
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book)
    await clear_room_timeline_cache(new_book.resource_id, redis_session)

    return new_book

async def occupate_room(
        book_id: int,
        user: User,
        session: AsyncSession,
        redis_session: Redis
) -> BookingModel:
    res = await session.execute(
        select(BookingModel)
        .where(
            and_ (
                BookingModel.id == book_id,
                BookingModel.is_booked == False
            )
        )
        .with_for_update()
    )
    book = res.scalar_one_or_none()
    if not book:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This timeslot is already booked")
    
    book.is_booked = True
    book.user_id = user.id
    await session.commit()
    await session.refresh(book)
    await clear_room_timeline_cache(book.resource_id, redis_session)
    return book




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
    
    await clear_room_timeline_cache(resource_id, redis_session)
