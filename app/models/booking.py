from typing import TYPE_CHECKING
from app.database import Base
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Integer, ForeignKey, DateTime
from datetime import date
from app.models.resource import Resource

if TYPE_CHECKING:
    from app.models.user import User

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    resource_id: Mapped[int] = mapped_column(ForeignKey("resources.id"))
    start_time: Mapped[date] = mapped_column(DateTime)
    end_time: Mapped[date] = mapped_column(DateTime)

    user: Mapped["User"] = relationship(back_populates="bookings")
    resource: Mapped["Resource"] = relationship(back_populates="bookings")


