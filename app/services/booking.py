from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from app.models.booking import Booking
from sqlalchemy.orm import joinedload
from app.schemas.booking import BookingCreate
from app.models.user import User
from fastapi import HTTPException, status
from typing import List
from app.models.resource import Resource


async def create_book(
        data: BookingCreate,
        user: User,
        session: AsyncSession
) -> Booking:
    resource_result = await session.execute(
        select(Resource)
        .where(Resource.id == data.resource_id)
        .with_for_update()
    )
    resource = resource_result.scalar_one_or_none()

    if resource is None:
        raise HTTPException(status_code=status.HTTP_444_NOT_FOUND, detail="Resource not found")
    
    if not resource.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Resource is inactive")
    
    busy_result = await session.execute(
        select(Booking)
        .where(
            and_(
                Booking.resource_id == data.resource_id,
                data.start_time < Booking.end_time,
                data.end_time > Booking.start_time
            )
        )
    )
    existing_book = busy_result.scalar_one_or_none()
    if existing_book is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="This timeslot is already booked")
    
    new_book = Booking(**data.model_dump(), user_id=user.id)
    session.add(new_book)
    await session.commit()
    await session.refresh(new_book)

    return new_book

async def get_books(
        user: User,
        session: AsyncSession
) -> List[Booking]:
    books = await session.execute(
        select(Booking)
        .where(Booking.user_id == user.id)
    )
    return list(books.scalars().all())

async def delete_book(
        book_id: int,
        user: User,
        session: AsyncSession
):
    result = await session.execute(
        select(Booking)
        .where(
            and_(
                Booking.id == book_id,
                Booking.user_id == user.id
            )
        )
    )
    book = result.scalar_one_or_none()
    if book is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Books dont exist")
    
    await session.execute(
        delete(Booking)
        .where(Booking.id == book_id)
    )
    await session.commit()
