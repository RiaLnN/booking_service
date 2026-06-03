from fastapi import FastAPI
from contextlib import asynccontextmanager
from backend.routes.api import router
import backend.models
from backend.core.redis import redis_manager
from backend.core.middlewares import setup_middlewares

@asynccontextmanager
async def lifespan(app: FastAPI):
    redis_manager.init_pool()
    yield
    await redis_manager.close_pool()

def get_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    setup_middlewares(app=app)
    app.include_router(router=router)
    
    return app

app = get_app()