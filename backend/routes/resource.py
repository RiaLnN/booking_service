from fastapi import APIRouter, Depends
from backend.routes.deps import get_session, get_redis
from backend.routes.deps import get_current_user, get_admin_user
from backend.services import resource as resource_service
from backend.schemas.resource import ResourceCreate, ResourceResponse, ResourceTimelineResponse
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from backend.models.user import User
from typing import List
from redis.asyncio import Redis
from backend.helpers.time import get_date
from datetime import date

router = APIRouter()

@router.post("", response_model=ResourceResponse)
async def create_room(
    data: ResourceCreate, 
    user: Annotated[User, Depends(get_admin_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    room = await resource_service.create_room(
        data=data, 
        user=user, 
        session=session
    )
    return room

@router.get("", response_model=List[ResourceResponse])
async def get_rooms(
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    rooms = await resource_service.get_rooms(
        user=user, 
        session=session
    )
    return rooms

@router.delete("/{room_id}")
async def delete_room(
    room_id: int,
    user: Annotated[User, Depends(get_admin_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    redis_session: Annotated[Redis, Depends(get_redis)]
):
    await resource_service.delete_room(
        room_id=room_id, 
        session=session, 
        redis_session=redis_session
    )

@router.get("/{room_id}/date", response_model=ResourceTimelineResponse)
async def get_room_occupations_time(
    room_id: int,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)],
    redis_session: Annotated[Redis, Depends(get_redis)],
    date: Annotated[date, Depends(get_date)],
):
    timeline = await resource_service.get_room_ocupation_timeline(
        room_id=room_id, 
        date=date, 
        session=session, 
        redis_session=redis_session
    )
    return {"timeline": timeline}