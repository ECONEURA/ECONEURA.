"""Compatibilidad para ejecutar servicios NEURA sin dependencias pesadas.

Este paquete se carga antes que los microservicios individuales y rellena
stubs para bibliotecas opcionales como `psycopg2` y `httpx` cuando no están
instaladas. De esta forma, los servicios pueden ejecutarse en modo simulación
sin requerir compilar dependencias nativas.
"""
from __future__ import annotations

import sys
from types import ModuleType
from uuid import uuid4


def _ensure_psycopg2_stub() -> None:
    try:
        import psycopg2  # type: ignore  # noqa: F401
        import psycopg2.extras  # type: ignore  # noqa: F401
        return
    except ImportError:
        pass

    class _DummyCursor:
        def __init__(self) -> None:
            self._last_id = str(uuid4())

        def execute(self, *args, **kwargs) -> None:  # noqa: ANN001, ANN002
            sql = args[0] if args else ""
            if "RETURNING id" in sql:
                self._last_id = str(uuid4())

        def fetchone(self) -> dict:
            return {"id": self._last_id}

        def fetchall(self) -> list:
            return []

    class _DummyConnection:
        def cursor(self) -> _DummyCursor:
            return _DummyCursor()

        def commit(self) -> None:
            return None

        def close(self) -> None:
            return None

    stub = ModuleType("psycopg2")
    stub.connect = lambda *args, **kwargs: _DummyConnection()  # type: ignore[attr-defined]
    extras = ModuleType("psycopg2.extras")

    class _RealDictCursor(_DummyCursor):
        pass

    extras.RealDictCursor = _RealDictCursor  # type: ignore[attr-defined]

    sys.modules.setdefault("psycopg2", stub)
    sys.modules.setdefault("psycopg2.extras", extras)


def _ensure_httpx_stub() -> None:
    try:
        import httpx  # type: ignore  # noqa: F401
        return
    except ImportError:
        pass

    class _DummyResponse:
        def __init__(self) -> None:
            self.status_code = 503
            self.text = "httpx no instalado"

        def json(self) -> dict:
            return {"error": self.text}

    class _DummyAsyncClient:
        def __init__(self, *args, **kwargs) -> None:  # noqa: ANN001, ANN002
            self._error = RuntimeError("httpx no está instalado; ejecuta `pip install httpx` para habilitar solicitudes reales")

        async def __aenter__(self):
            raise self._error

        async def __aexit__(self, exc_type, exc, tb) -> bool:  # noqa: ANN001, ANN201
            return False

        async def post(self, *args, **kwargs):  # noqa: ANN001, ANN002
            raise self._error

        async def stream(self, *args, **kwargs):  # noqa: ANN001, ANN002
            raise self._error

    stub = ModuleType("httpx")
    stub.AsyncClient = _DummyAsyncClient  # type: ignore[attr-defined]
    stub.RequestError = RuntimeError  # type: ignore[attr-defined]

    sys.modules.setdefault("httpx", stub)


_ensure_psycopg2_stub()
_ensure_httpx_stub()
