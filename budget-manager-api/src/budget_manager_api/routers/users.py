import uuid

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import insert, select
from sqlalchemy.orm import Session

from budget_manager_api.db_schema import users_table
from budget_manager_api.dependencies import get_db_session
from budget_manager_api.models import SignUpCredentials, UserInDB, UserPublic
from budget_manager_api.security import decode_access_token, hash_password
from budget_manager_api.shared import ACCESS_TOKEN_COOKIE_NAME

logger = structlog.get_logger()

router = APIRouter(tags=["users"])


def get_current_user(
    request: Request, db: Session = Depends(get_db_session)
) -> UserInDB:
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

    query = select(users_table).where(users_table.c.id == user_id)
    user = db.execute(query).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    return UserInDB.model_validate(user, from_attributes=True)


@router.post("/users", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def create_user(
    credentials: SignUpCredentials, db: Session = Depends(get_db_session)
) -> UserPublic:
    """
    Creates a new user, hashes their password, and stores it in the database.
    Returns the public user data.
    """
    logger.info("User creation attempt", email=credentials.email)

    query = select(users_table).where(users_table.c.email == credentials.email)
    existing_user = db.execute(query).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this email already exists",
        )

    user_id = str(uuid.uuid4())
    hashed_password = hash_password(credentials.password)
    new_user_data = {
        "id": user_id,
        "name": credentials.name,
        "email": credentials.email,
        "hashed_password": hashed_password,
    }

    insert_stmt = insert(users_table).values(new_user_data)
    db.execute(insert_stmt)
    db.commit()

    created_user_query = select(users_table).where(users_table.c.id == user_id)
    created_user = db.execute(created_user_query).first()

    logger.info("User created", user_id=user_id, email=credentials.email)

    return UserInDB.model_validate(created_user, from_attributes=True)


@router.get("/users/me", response_model=UserPublic)
def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    """
    Get the profile for the currently logged-in user.
    """
    logger.info("Getting user profile", user=current_user)
    return current_user
