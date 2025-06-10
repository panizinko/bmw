from fastapi import APIRouter, HTTPException, status

from fastapi_service.models import SignUpCredentials, UserInDB, UserPublic
from fastapi_service.security import hash_password

router = APIRouter(prefix="/users", tags=["users"])

fake_db: dict[str, UserInDB] = {}


@router.post("/", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(credentials: SignUpCredentials) -> UserPublic:
    """
    Creates a new user, hashes their password, and stores it in the database.
    Returns the public user data.
    """

    existing_user = next(
        (user for user in fake_db.values() if user.email == credentials.email), None
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    hashed_password = hash_password(credentials.password)
    user = UserInDB(
        name=credentials.name,
        email=credentials.email,
        hashed_password=hashed_password,
    )
    fake_db[user.id] = user
    return user
