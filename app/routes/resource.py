from fastapi import APIRouter, Depends
from app.database import get_session
from app.services.auth import get_current_user
from app.services import resource as resource_service
from app.schemas.resource import ResourceCreate, ResourceResponse, ResourceTimelineResponse
from typing import Annotated
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("/", response_model=ResourceResponse)
async def create_room(
    data: ResourceCreate, 
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    room = await resource_service.create_room(data=data, user=user, session=session)
    return room

@router.get("/", response_model=List[ResourceResponse])
async def get_rooms(
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    rooms = await resource_service.get_rooms(user=user, session=session)
    return rooms

@router.delete("/{room_id}")
async def delete_room(
    room_id: int,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    await resource_service.delete_room(room_id=room_id, user=user, session=session)

@router.get("/{room_id}/timeline", response_model=ResourceTimelineResponse)
async def get_room_occupations_time(
    room_id: int,
    user: Annotated[User, Depends(get_current_user)],
    session: Annotated[AsyncSession, Depends(get_session)]
):
    timeline = await resource_service.get_room_ocupation_timeline(room_id=room_id, user=user, session=session)
    return {"timeline": timeline}