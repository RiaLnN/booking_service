from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI


def setup_middlewares(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"], # Адрес фронтенда Vite
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )