from fastapi import APIRouter, Depends
from backend.schemas.booking import BookingCreate, BookingResponse
from typing import Annotated
from backend.models.user import User
from backend.routes.deps import get_session, get_redis
from backend.services.auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from backend.services import booking as booking_service
from typing import List
from redis.asyncio import Redis

router = APIRouter()

@router.post("/", response_model=BookingResponse)
async def booking_room(
    data: BookingCreate,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    book = await booking_service.create_book(data=data, user=user, session=session)
    return book

@router.get("/my", response_model=List[BookingResponse])
async def get_bookings(
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    books = await booking_service.get_books(user=user, session=session)
    return books

@router.delete("/{book_id}")
async def delete_book(
    book_id: int,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    redis: Annotated[Redis, Depends(get_redis)]
):
    await booking_service.delete_book(book_id=book_id, user=user, session=session, redis_session=redis)