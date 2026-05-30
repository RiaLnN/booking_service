from typing import List, TYPE_CHECKING
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String, Boolean
from app.schemas.resource import RoomType

if TYPE_CHECKING:
    from app.models.booking import Booking


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    room_type: Mapped[RoomType] = mapped_column()
    is_active: Mapped[bool] = mapped_column(Boolean)

    bookings: Mapped[List["Booking"]] = relationship(back_populates="resource", cascade="all, delete-orphan")
