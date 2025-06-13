from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    ACCESS_TOKEN_COOKIE_NAME: str
    REFRESH_TOKEN_EXPIRE_DAYS: int
    REFRESH_TOKEN_COOKIE_NAME: str
    DATABASE_URL: str

    IN_PRODUCTION: bool = False

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
