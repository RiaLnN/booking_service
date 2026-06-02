from fastapi import APIRouter
from backend.routes import booking, auth, resource
router = APIRouter()

router.include_router(booking.router, prefix="/booking")
router.include_router(resource.router, prefix="/resources")
router.include_router(auth.router, prefix="/auth")