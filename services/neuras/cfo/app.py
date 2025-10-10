"""
ECONEURA Chief Financial Officer (neura-3)
Agente especializado en análisis financiero con capacidades ChatGPT
Memoria conversacional, personalidad CFO, streaming responses
"""
from fastapi import FastAPI, Request, Header, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
from datetime import datetime
from uuid import uuid4

try:
    import httpx  # type: ignore
except ImportError:  # pragma: no cover - dependencia opcional
    httpx = None  # type: ignore

try:
    import psycopg2  # type: ignore
    from psycopg2.extras import RealDictCursor  # type: ignore
except ImportError:  # pragma: no cover - dependencia opcional
    psycopg2 = None  # type: ignore
    RealDictCursor = None  # type: ignore


class _DummyCursor:
    def __init__(self):
        self._last_id = str(uuid4())

    def execute(self, *args, **kwargs):
        sql = args[0] if args else ""
        if "RETURNING id" in sql:
            self._last_id = str(uuid4())

    def fetchone(self):
        return {"id": self._last_id}

    def fetchall(self):
        return []


class _DummyConnection:
    def cursor(self):
        return _DummyCursor()

    def commit(self):
        return None

    def close(self):
        return None

from opentelemetry import trace
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from observability.otlp_utils import setup_observability, instrument_fastapi_app
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from shared.enhanced_agent import EnhancedAgent, ConversationHistory

# Configuración Azure OpenAI
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_API_ENDPOINT", "")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")

# Base de datos
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "econeura_dev"),
    "user": os.getenv("DB_USER", "econeura"),
    "password": os.getenv("DB_PASSWORD", "dev_password"),
}

# Inicializar Enhanced Agent (con capacidades ChatGPT)
enhanced_agent = EnhancedAgent(
    agent_id="neura-3",
    db_config=DB_CONFIG,
    azure_config={
        "endpoint": AZURE_OPENAI_ENDPOINT,
        "key": AZURE_OPENAI_KEY,
        "version": AZURE_OPENAI_VERSION,
        "deployment": AZURE_OPENAI_DEPLOYMENT
    }
)

# Inicializar FastAPI
app = FastAPI(
    title="ECONEURA Chief Financial Officer",
    version="1.0.0",
    description="Agent specialized in Chief Financial Officer responsibilities"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar observabilidad
tracer, meter = setup_observability("neura-cfo", "1.0.0")
instrument_fastapi_app(app, "neura-cfo")

# Métricas
request_counter = meter.create_counter(
    "cfo_requests_total",
    description="Total requests to Chief Financial Officer"
)
error_counter = meter.create_counter(
    "cfo_errors_total",
    description="Total errors in Chief Financial Officer"
)

# Modelos
class TaskRequest(BaseModel):
    input: dict
    user_id: str
    correlation_id: str

class TaskResponse(BaseModel):
    status: str
    invocation_id: str
    output: dict | None = None
    error: str | None = None

# Utilidades DB
def get_db_connection():
    if not psycopg2:
        return _DummyConnection()

    try:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")
    except Exception:
        return _DummyConnection()

# Endpoints
@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "service": "neura-cfo",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "enhanced": True,
        "agent_name": enhanced_agent.personality.name,
        "agent_role": enhanced_agent.personality.role,
        "openai_configured": bool(AZURE_OPENAI_KEY),
    "db_configured": bool(psycopg2)
    }

@app.post("/v1/task", response_model=TaskResponse)
async def execute_task(
    task: TaskRequest,
    authorization: str = Header(None),
    x_correlation_id: str = Header(None)
):
    """
    Execute CFO task with enhanced AI capabilities
    - Memoria conversacional automática
    - Personalidad CFO especializada
    - Contexto de conversaciones previas
    """
    with tracer.start_as_current_span("cfo_task_enhanced") as span:
        span.set_attribute("correlation_id", task.correlation_id)
        span.set_attribute("user_id", task.user_id)

        conn = None
        invocation_id = None

        try:
            # Registrar invocación en DB
            conn = get_db_connection()
            cursor = conn.cursor()

            cursor.execute("""
                INSERT INTO invocations (agent_id, user_id, input, correlation_id, status)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, ("neura-3", task.user_id, json.dumps(task.input), task.correlation_id, "processing"))

            invocation_id = cursor.fetchone()["id"]
            conn.commit()
            span.set_attribute("invocation_id", str(invocation_id))

            # Si no hay Azure OpenAI configurado, modo simulación
            if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
                result = {
                    "mode": "simulation",
                    "message": "Azure OpenAI not configured - configure AZURE_OPENAI_API_KEY to enable full AI capabilities",
                    "agent": "Chief Financial Officer (Simulation)",
                    "input_received": task.input
                }

                cursor.execute("""
                    UPDATE invocations
                    SET output = %s, status = 'success', completed_at = NOW()
                    WHERE id = %s
                """, (json.dumps(result), invocation_id))
                conn.commit()

                request_counter.add(1, {"status": "simulation"})

                return TaskResponse(
                    status="success",
                    invocation_id=str(invocation_id),
                    output=result
                )

            if not httpx:
                result = {
                    "mode": "simulation",
                    "message": "httpx no instalado: ejecute `pip install httpx` o mantenga modo simulación",
                    "agent": "Chief Financial Officer (Simulation)",
                    "input_received": task.input
                }

                cursor.execute("""
                    UPDATE invocations
                    SET output = %s, status = 'success', completed_at = NOW()
                    WHERE id = %s
                """, (json.dumps(result), invocation_id))
                conn.commit()

                request_counter.add(1, {"status": "simulation"})

                return TaskResponse(
                    status="success",
                    invocation_id=str(invocation_id),
                    output=result
                )

            # Extraer mensaje del usuario
            user_message = task.input.get("message") or task.input.get("input") or json.dumps(task.input)

            # Generar respuesta con Enhanced Agent (incluye memoria automática)
            start_time = datetime.utcnow()

            result = await enhanced_agent.generate_response(
                user_input=str(user_message),
                user_id=task.user_id,
                correlation_id=task.correlation_id
            )

            duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

            # Actualizar invocación como success
            cursor.execute("""
                UPDATE invocations
                SET output = %s, status = 'success', completed_at = NOW(), duration_ms = %s
                WHERE id = %s
            """, (json.dumps(result), duration_ms, invocation_id))
            conn.commit()

            # Registrar costo si hay tokens
            if result.get("usage"):
                usage = result["usage"]
                cursor.execute("""
                    INSERT INTO cost_tracking (invocation_id, agent_id, tokens_input, tokens_output, model)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    invocation_id,
                    "neura-3",
                    usage.get("prompt_tokens", 0),
                    usage.get("completion_tokens", 0),
                    AZURE_OPENAI_DEPLOYMENT
                ))
                conn.commit()

            request_counter.add(1, {"status": "success", "enhanced": "true"})

            return TaskResponse(
                status="success",
                invocation_id=str(invocation_id),
                output=result
            )

        except HTTPException:
            raise
        except Exception as e:
            error_counter.add(1, {"error_type": type(e).__name__})

            # Actualizar como error en DB
            if cursor and invocation_id:
                try:
                    cursor.execute("""
                        UPDATE invocations
                        SET status = 'error', error_message = %s, completed_at = NOW()

                    conn.commit()
                except:
                    pass

            return TaskResponse(
                status="error",
                invocation_id=str(invocation_id) if invocation_id else "unknown",
                error=str(e)
            )
        finally:
            if conn:
                conn.close()

# Modelos adicionales para chat
class ChatMessage(BaseModel):
    message: str
    user_id: str
    correlation_id: str = "chat-session"
    load_history: bool = True

@app.post("/v1/chat")
async def chat(
    chat_msg: ChatMessage,
    authorization: str = Header(None)
):
    """
    Chat conversacional con memoria automática
    Endpoint estilo ChatGPT - mantiene contexto de conversaciones previas
    """
    with tracer.start_as_current_span("cfo_chat") as span:
        span.set_attribute("user_id", chat_msg.user_id)

        try:
            if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
                return JSONResponse(
                    status_code=503,
                    content={
                        "error": "Azure OpenAI not configured",
                        "message": "Configure AZURE_OPENAI_API_KEY to enable chat"
                    }
                )

            # Cargar historial si se solicita
            conversation_history = None
            if chat_msg.load_history:
                conversation_history = await enhanced_agent.load_conversation_history(
                    chat_msg.user_id,
                    limit=10
                )
                span.set_attribute("history_messages", len(conversation_history.messages))

            # Generar respuesta con contexto
            result = await enhanced_agent.generate_response(
                user_input=chat_msg.message,
                user_id=chat_msg.user_id,
                conversation_history=conversation_history,
                correlation_id=chat_msg.correlation_id
            )

            # Registrar en DB para historial futuro
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO invocations (agent_id, user_id, input, output, correlation_id, status, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    "neura-3",
                    chat_msg.user_id,
                    json.dumps({"message": chat_msg.message}),
                    json.dumps(result),
                    chat_msg.correlation_id,
                    "success"
                ))
                conn.commit()
            finally:
                conn.close()

            request_counter.add(1, {"status": "success", "endpoint": "chat"})

            return {
                "status": "success",
                "response": result["result"],
                "agent": result["agent"],
                "role": result["role"],
                "context_messages": result.get("conversation_context", 0),
                "usage": result.get("usage", {})
            }

        except Exception as e:
            error_counter.add(1, {"error_type": type(e).__name__, "endpoint": "chat"})
            return JSONResponse(
                status_code=500,
                content={"error": str(e)}
            )

@app.post("/v1/stream")
async def stream_chat(
    chat_msg: ChatMessage,
    authorization: str = Header(None)
):
    """
    Chat con streaming (respuestas token por token)
    Usa Server-Sent Events para respuestas en tiempo real tipo ChatGPT
    """
    async def event_generator():
        try:
            if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
                yield f"data: {json.dumps({'error': 'Azure OpenAI not configured'})}\n\n"
                return

            # Cargar historial
            conversation_history = None
            if chat_msg.load_history:
                conversation_history = await enhanced_agent.load_conversation_history(
                    chat_msg.user_id,
                    limit=10
                )

            # Metadata inicial
            yield f"data: {json.dumps({'type': 'start', 'agent': enhanced_agent.personality.name})}\n\n"

            # Stream de contenido
            full_response = ""
            async for token in enhanced_agent.generate_response_stream(
                user_input=chat_msg.message,
                user_id=chat_msg.user_id,
                conversation_history=conversation_history
            ):
                full_response += token
                yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"

            # Finalizar
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

            # Registrar en DB
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO invocations (agent_id, user_id, input, output, correlation_id, status, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    "neura-3",
                    chat_msg.user_id,
                    json.dumps({"message": chat_msg.message}),
                    json.dumps({"result": full_response}),
                    chat_msg.correlation_id,
                    "success"
                ))
                conn.commit()
            finally:
                conn.close()

            request_counter.add(1, {"status": "success", "endpoint": "stream"})

        except Exception as e:
            error_counter.add(1, {"error_type": type(e).__name__, "endpoint": "stream"})
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8103)


```

