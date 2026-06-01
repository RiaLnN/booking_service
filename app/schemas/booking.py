from pydantic import BaseModel
from datetime import datetime

class BookingBase(BaseModel):
    pass

class BookingCreate(BookingBase):
    start_time: datetime
    end_time: datetime
    resource_id: int

class BookingResponse(BookingCreate):
    id: int
    user_id: int
    created_at: datetime