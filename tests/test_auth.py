# tests/test_auth.py

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from fastapi_service.main import app
from fastapi_service.routers import users

client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_user_db():
    """Ensures the in-memory user database is empty before each test."""
    users.fake_db.clear()
    client.cookies.clear()


def test_login_success():
    """
    Tests that a user can successfully log in with correct credentials
    and receive a valid token and user data.
    """
    user_payload = {
        "name": "testlogin",
        "email": "testlogin@example.com",
        "password": "password123",
    }
    client.post("/api/v1/users", json=user_payload)

    login_payload = {
        "username": "testlogin@example.com",
        "password": "password123",
    }
    response = client.post("/api/v1/auth/token", data=login_payload)

    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.cookies

    data = response.json()

    assert data["email"] == "testlogin@example.com"
    assert data["name"] == "testlogin"
    assert "id" in data


def test_login_wrong_password_fails():
    """
    Tests that a login attempt with an incorrect password fails.
    """
    user_payload = {
        "username": "wrongpass",
        "email": "wrongpass@example.com",
        "password": "correct_password",
    }
    client.post("/api/v1/users", json=user_payload)

    login_payload = {
        "username": "wrongpass@example.com",
        "password": "wrong_password",
    }
    response = client.post("/api/v1/auth/token", data=login_payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    data = response.json()
    assert data["detail"] == "Incorrect email or password"


def test_login_nonexistent_user_fails():
    """
    Tests that a login attempt for a user that does not exist fails.
    """
    login_payload = {
        "username": "ghost@example.com",
        "password": "password123",
    }
    response = client.post("/api/v1/auth/token", data=login_payload)

    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert response.json()["detail"] == "Incorrect email or password"


def test_logout_success():
    """
    Tests that a user can successfully log out and clear the access token cookie.
    """
    user_payload = {
        "name": "testlogout",
        "email": "testlogout@example.com",
        "password": "password123",
    }
    client.post("/api/v1/users", json=user_payload)

    login_payload = {
        "username": "testlogout@example.com",
        "password": "password123",
    }

    response = client.post("/api/v1/auth/token", data=login_payload)
    assert response.status_code == status.HTTP_200_OK
    assert "access_token" in response.cookies

    logout_response = client.post("/api/v1/auth/logout")
    assert logout_response.status_code == status.HTTP_200_OK
    assert "access_token" not in client.cookies
