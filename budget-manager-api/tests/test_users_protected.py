from fastapi import status
from fastapi.testclient import TestClient


def test_get_me_unauthenticated(client: TestClient):
    """
    Tests that accessing /me without a token fails with 401.
    """
    response = client.get("/api/v1/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_get_me_with_invalid_token(client: TestClient):
    """
    Tests that accessing /me with a malformed token fails with 401.
    """
    client.cookies.set("access_token", "invalid_token")
    response = client.get("/api/v1/users/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED


def test_user_with_valid_token(client: TestClient):
    """
    Tests the full flow: sign up, log in (which sets the cookie),
    and then access the protected /me endpoint.
    """
    user_payload = {
        "name": "test_me",
        "email": "testme@example.com",
        "password": "password123",
    }
    create_response = client.post("/api/v1/users", json=user_payload)
    assert create_response.status_code == status.HTTP_201_CREATED

    login_payload = {
        "username": "testme@example.com",
        "password": "password123",
    }
    login_response = client.post("/api/v1/auth/token", data=login_payload)
    assert login_response.status_code == status.HTTP_200_OK
    assert "access_token" in login_response.cookies
    me_response = client.get("/api/v1/users/me")

    assert me_response.status_code == status.HTTP_200_OK
    data = me_response.json()
    assert data["email"] == "testme@example.com"
    assert data["name"] == "test_me"
    assert "id" in data
