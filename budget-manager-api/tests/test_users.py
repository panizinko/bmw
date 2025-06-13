from fastapi import status
from fastapi.testclient import TestClient


def test_create_user_success(client: TestClient):
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


def test_create_user_already_exists(client: TestClient):
    user_payload = {
        "name": "testuser",
        "email": "testuser@example.com",
        "password": "testpassword",
    }

    response1 = client.post("/api/v1/users", json=user_payload)

    assert response1.status_code == status.HTTP_201_CREATED

    response2 = client.post("/api/v1/users", json=user_payload)

    assert response2.status_code == status.HTTP_409_CONFLICT

    assert response2.json()["detail"] == "User with this email already exists"
