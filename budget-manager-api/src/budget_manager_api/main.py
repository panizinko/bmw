from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings
from .logging_config import setup_logging
from .models import Message
from .routers import auth, users

API_PREFIX = "/api/v1"


def create_app() -> FastAPI:
    setup_logging()
    app = FastAPI(title="Budget Manager API")

    origins = ["http://localhost:4200"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(users.router, prefix=API_PREFIX)
    app.include_router(auth.router, prefix=API_PREFIX)

    @app.get("/", response_model=Message, tags=["Root"])
    def read_root() -> Message:
        return Message(message="Welcome to the Budget Manager API")

    engine = create_engine(settings.DATABASE_URL, echo=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    app.state.db_session_factory = SessionLocal

    return app


app = create_app()
