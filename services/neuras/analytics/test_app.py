"""
Tests para el agente Analytics de ECONEURA
"""
import pytest
from fastapi.testclient import TestClient
import sys
import os

# Agregar path al módulo
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Mock de las dependencias para testing
os.environ["AZURE_OPENAI_API_ENDPOINT"] = ""
os.environ["AZURE_OPENAI_API_KEY"] = ""
os.environ["DB_HOST"] = "localhost"
os.environ["DB_NAME"] = "test_db"

from app import app

client = TestClient(app)

def test_health_endpoint():
    """Test que el endpoint de health responde correctamente"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "neura-analytics"
    assert data["status"] == "ok"
    assert "timestamp" in data
    assert "version" in data

def test_task_endpoint_missing_auth():
    """Test que el endpoint de task requiere autorización"""
    response = client.post("/v1/task", json={
        "input": {"query": "test"},
        "user_id": "test-user",
        "correlation_id": "test-corr-123"
    })
    # Debería fallar sin headers de autorización
    assert response.status_code in [401, 422]

def test_task_endpoint_structure():
    """Test que el endpoint de task acepta la estructura correcta"""
    response = client.post(
        "/v1/task",
        json={
            "input": {"query": "Analyze sales trend"},
            "user_id": "test-user-123",
            "correlation_id": "test-correlation-456"
        },
        headers={
            "Authorization": "Bearer test-token",
            "X-Correlation-Id": "test-correlation-456"
        }
    )
    # En modo simulación (sin Azure OpenAI config), debería responder OK
    data = response.json()
    assert "status" in data
    # Puede ser success (simulación) o error (sin DB)
    assert data["status"] in ["success", "error"]

def test_openapi_schema():
    """Test que la API genera el schema de OpenAPI correctamente"""
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "ECONEURA Analytics Agent"
    assert "/health" in schema["paths"]
    assert "/v1/task" in schema["paths"]

@pytest.mark.parametrize("endpoint", ["/health", "/docs", "/openapi.json"])
def test_public_endpoints_accessible(endpoint):
    """Test que los endpoints públicos son accesibles"""
    response = client.get(endpoint)
    assert response.status_code == 200
