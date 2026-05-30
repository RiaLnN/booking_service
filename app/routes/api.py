from fastapi import APIRouter
from app.routes import booking, auth
router = APIRouter()

router.include_router(booking.router)
router.include_router(auth.router, prefix="/auth")