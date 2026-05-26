from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import Base, engine
from app.routes.api import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

def get_app() -> FastAPI:
    app = FastAPI(lifespan=lifespan)
    app.include_router(router=router)

    return app

