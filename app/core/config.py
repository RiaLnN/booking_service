from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./booking.db"
    DATABASE_URL_DEV: str = ""
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""
    REDIS_MAX_CONNECTIONS: int = 20
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    DB_PASSWORD: str = ""
    DB_USER: str = ""
    DB_NAME: str = ""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

settings = Settings()
