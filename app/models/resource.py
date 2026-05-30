from typing import List, TYPE_CHECKING
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, String

if TYPE_CHECKING:
    from app.models.booking import Booking

class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[str] = mapped_column(String)
    room: Mapped[int] = mapped_column(Integer)
    description: Mapped[str] = mapped_column(String)

    bookings: Mapped[List["Booking"]] = relationship(back_populates="resource", cascade="all, delete-orphan")
