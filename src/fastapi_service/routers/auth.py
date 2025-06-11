from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from fastapi_service.config import settings
from fastapi_service.models import SignInResponse, UserInDB, UserPublic
from fastapi_service.routers.users import fake_db
from fastapi_service.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_user_by_email(db: dict[str, UserInDB], email: str) -> UserInDB | None:
    """Helper function to find a user by email."""
    return next((user for user in db.values() if user.email == email), None)


@router.post("/token", response_model=SignInResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> SignInResponse:
    """
    Login for access token.
    """
    user = get_user_by_email(fake_db, form_data.username)

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )

    user_public = UserPublic.model_validate(user)

    return SignInResponse(access_token=access_token, user=user_public)
