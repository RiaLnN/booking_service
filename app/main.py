from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.routes.api import router
import app.models
from app.core.redis import redis_manager

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_manager.init_pool()
    yield
    await redis_manager.close_pool()

def get_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    app.include_router(router=router)

    return app

app = get_app()