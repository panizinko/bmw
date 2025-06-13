# tests/conftest.py

from pathlib import Path

import pytest
from dotenv import dotenv_values
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from budget_manager_api.db_schema import metadata
from budget_manager_api.dependencies import get_db_session

# Import the app factory and dependency function
from budget_manager_api.main import create_app

# --- This is the only configuration section needed ---

# 1. Define the absolute path to the .env.test file.
env_path = Path(__file__).parent.parent / ".env.test"

# 2. Use dotenv to load the key-value pairs from the file into a dictionary.
test_env_vars = dotenv_values(env_path)

# 3. Get the specific DATABASE_URL for testing.
TEST_DATABASE_URL = test_env_vars.get("DATABASE_URL")

if not TEST_DATABASE_URL:
    raise ValueError(f"DATABASE_URL not found in {env_path}. Please check the file.")

# 4. Create a test-specific engine that is guaranteed to use the correct URL.
engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Create the app instance for testing.
app = create_app()

# 6. Create tables in the test database before any tests run.
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
