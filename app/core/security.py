import bcrypt
import jwt
from app.core.config import settings
from fastapi.security import HTTPBearer

security = HTTPBearer()

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password=bytes(password, "utf-8"), salt=bcrypt.gensalt())
    return hashed.decode("utf-8")

def check_hash_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        password=password.encode("utf-8"), 
        hashed_password=hashed_password.encode("utf-8")
    )

def create_jwt(id: int) -> str:
    payload = {
        "user_id": id,
        }
    return jwt.encode(payload=payload, key=settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def get_payload(token: str) -> dict:
    payload = jwt.decode(jwt=token, key=settings.SECRET_KEY, algorithms=settings.ALGORITHM)
    return payload
