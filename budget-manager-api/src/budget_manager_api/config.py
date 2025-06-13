from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ACCESS_TOKEN_COOKIE_NAME: str
    REFRESH_TOKEN_EXPIRE_DAYS: int
    REFRESH_TOKEN_COOKIE_NAME: str

    IN_PRODUCTION: bool = False

    model_config = SettingsConfigDict()


settings = Settings()
