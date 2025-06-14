from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .config import settings
from .logging_config import setup_logging
from .models import Message
from .routers import auth, users

API_PREFIX = "/api/v1"


# This context manager will handle the application's startup and shutdown events.
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manages the application's startup and shutdown logic.
    Creates the database engine and session factory on startup.
    """
    print("INFO:     Application startup: Creating database engine.")

    engine = create_engine(settings.DATABASE_URL)

    app.state.db_session_factory = sessionmaker(
        autocommit=False, autoflush=False, bind=engine
    )
    print("INFO:     Application startup: Database engine created.")

    yield  # The application is now running

    # --- Code to run on shutdown ---
    print("INFO:     Application shutdown.")


def create_app() -> FastAPI:
    """
    Creates and configures the FastAPI application instance.
    """
    setup_logging()
    app = FastAPI(title="Budget Manager API", lifespan=lifespan)

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

    return app


app = create_app()
