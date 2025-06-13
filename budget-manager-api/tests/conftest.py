# tests/conftest.py

from pathlib import Path

import pytest
from dotenv import dotenv_values
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from budget_manager_api.db_schema import metadata
from budget_manager_api.dependencies import get_db_session
from budget_manager_api.main import create_app

env_path = Path(__file__).parent.parent / ".env.test"

test_env_vars = dotenv_values(env_path)

TEST_DATABASE_URL = test_env_vars.get("DATABASE_URL")

if not TEST_DATABASE_URL:
    raise ValueError(f"DATABASE_URL not found in {env_path}. Please check the file.")

engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = create_app()

metadata.create_all(bind=engine)


# --- The fixtures below are correct and need no changes ---


@pytest.fixture(scope="function")
def db_session_for_test():
    """Provides a transactional session for a single test."""
    connection = engine.connect()
    transaction = connection.begin()
    db = TestingSessionLocal(bind=connection)
    yield db
    db.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function", autouse=True)
def override_get_db(db_session_for_test: Session):
    """Overrides the 'get_db_session' dependency for all tests."""

    def get_db_override():
        return db_session_for_test

    app.dependency_overrides[get_db_session] = get_db_override
    yield
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client():
    """Provides a TestClient instance configured for tests."""
    with TestClient(app) as c:
        yield c
