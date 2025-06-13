from datetime import timedelta

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from sqlalchemy.orm import Session

from budget_manager_api.config import settings
from budget_manager_api.db_schema import users_table
from budget_manager_api.dependencies import get_db_session
from budget_manager_api.models import SignInResponse, UserInDB, UserPublic
from budget_manager_api.security import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    verify_password,
)

logger = structlog.get_logger()

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_user_by_email(db: dict[str, UserInDB], email: str) -> UserInDB | None:
    """Helper function to find a user by email."""
    query = select(users_table).where(users_table.c.email == email)
    result = db.execute(query).first()

    if result:
        return UserInDB.model_validate(result, from_attributes=True)
    return None


@router.post("/token", response_model=UserPublic)
def login_for_access_token(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db_session),
) -> SignInResponse:
    """
    Login for access token.
    """
    logger.info("Login for access token", form_data=form_data)
    user = get_user_by_email(db, form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        logger.warning("Invalid credentials", form_data=form_data)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info("User found", user=user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    refresh_token = create_refresh_token(
        data={"sub": user.id}, expires_delta=refresh_token_expires
    )

    samesite_policy = "lax"
    is_secure = False
    if settings.IN_PRODUCTION:
        samesite_policy = "none"
        is_secure = True

    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        httponly=True,  # Makes it inaccessible to JavaScript
        samesite=samesite_policy,  # Lax helps prevent CSRF
        secure=is_secure,  # Set to True in production (requires HTTPS)
        max_age=int(access_token_expires.total_seconds()),
    )

    response.set_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        samesite=samesite_policy,
        secure=is_secure,
        max_age=int(refresh_token_expires.total_seconds()),
        path="/api/v1/auth/refresh",
    )

    return UserPublic.model_validate(user)


@router.post("/refresh")
def refresh_access_token(
    request: Request, response: Response, db: Session = Depends(get_db_session)
):
    """
    Refresh the access token.
    """
    token = request.cookies.get(settings.REFRESH_TOKEN_COOKIE_NAME)

    logger.info("Refresh access token", token=token)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found",
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )
    user_id = payload["sub"]

    user = get_user_by_email(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    samesite_policy = "lax"
    is_secure = False
    if settings.IN_PRODUCTION:
        samesite_policy = "none"
        is_secure = True

    response.set_cookie(
        key=settings.ACCESS_TOKEN_COOKIE_NAME,
        value=new_access_token,
        httponly=True,
        samesite=samesite_policy,
        secure=is_secure,
        max_age=int(access_token_expires.total_seconds()),
    )

    logger.info("New access token created", new_access_token=new_access_token)

    return UserPublic.model_validate(user)


@router.post("/logout")
def logout(response: Response):
    """
    Logs the user out by clearing the access token cookie.
    """
    logger.info("Logging out", response=response)

    response.delete_cookie(settings.ACCESS_TOKEN_COOKIE_NAME)
    response.delete_cookie(
        key=settings.REFRESH_TOKEN_COOKIE_NAME, path="/api/v1/auth/refresh"
    )
    return {"status": "ok", "message": "Successfully logged out"}
