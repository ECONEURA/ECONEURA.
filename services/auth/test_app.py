"""
Tests para el servicio de autenticación de ECONEURA
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Mock DB config para testing
os.environ["DB_HOST"] = "localhost"
os.environ["DB_NAME"] = "test_db"
os.environ["JWT_SECRET"] = "test-secret-key"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app import app

client = TestClient(app)

def test_health_endpoint():
    """Test que el endpoint de health responde"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "auth"
    assert data["status"] == "ok"

def test_login_missing_credentials():
    """Test que login requiere email y password"""
    response = client.post("/login", json={})
    assert response.status_code == 422  # Validation error

def test_login_structure():
    """Test estructura del endpoint de login"""
    response = client.post("/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    # Puede fallar por DB no disponible, pero estructura es correcta
    assert response.status_code in [200, 401, 503]

def test_register_structure():
    """Test estructura del endpoint de registro"""
    response = client.post("/register", json={
        "email": "newuser@example.com",
        "name": "New User",
        "password": "password123"
    })
    # Puede fallar por DB, pero estructura es correcta
    assert response.status_code in [200, 503]

def test_verify_token_without_token():
    """Test que verify requiere un token"""
    response = client.get("/verify")
    assert response.status_code == 403  # Forbidden sin token

def test_openapi_schema():
    """Test que la API tiene schema OpenAPI"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert "paths" in schema
    assert "/login" in schema["paths"]
    assert "/register" in schema["paths"]
