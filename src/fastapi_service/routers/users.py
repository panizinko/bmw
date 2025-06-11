from fastapi import APIRouter, Depends, HTTPException, Request, status

from fastapi_service.models import SignUpCredentials, UserInDB, UserPublic
from fastapi_service.security import decode_access_token, hash_password
from fastapi_service.shared import ACCESS_TOKEN_COOKIE_NAME

router = APIRouter(prefix="/users", tags=["users"])

fake_db: dict[str, UserInDB] = {}


def get_current_user(request: Request) -> UserInDB:
    """
    Dependency to get the current user from the access token cookie.
    """
    token = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    user_id = payload["sub"]
    user = fake_db.get(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return user


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


@router.get("/me", response_model=UserPublic)
def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """
    Get the profile for the currently logged-in user.
    """
    return current_user
