from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import List, Optional

class RoomType(str, Enum):
    ROOM = "room"
    DESK = "desk"

class ResourceBase(BaseModel):
    pass

class ResourceCreate(ResourceBase):
    name: str = Field(min_length=3, max_length=20)
    room_type: RoomType
    is_active: bool = Field(default=True)

class ResourceResponse(ResourceCreate):
    id: int

class Booking(BaseModel):
    id: int
    start_time: datetime
    end_time: datetime

class ResourceTimelineResponse(ResourceBase):
    timeline: Optional[List[Booking]]
