import pytest
from fastapi import status
from fastapi.testclient import TestClient

from fastapi_service.main import app
from fastapi_service.routers import users

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_fake_db():
    """
    A fixture to clear our in-memory database before each test.
    This ensures test isolation.
    """
    users.fake_db.clear()


def test_create_user_success():
    response = client.post(
        "/api/v1/users",
        json={
            "name": "testuser",
            "email": "testuser@example.com",
            "password": "testpassword",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED

    data = response.json()

    assert data["name"] == "testuser"
    assert data["email"] == "testuser@example.com"
    assert "id" in data
    assert "hashed_password" not in data


def test_create_user_already_exists():
    user_payload = {
        "name": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword",
    }

    response1 = client.post("/api/v1/users", json=user_payload)

    assert response1.status_code == status.HTTP_201_CREATED

    response2 = client.post("/api/v1/users", json=user_payload)

    assert response2.status_code == status.HTTP_409_CONFLICT

    data = response2.json()

    assert data["detail"] == "User with this email already exists"
