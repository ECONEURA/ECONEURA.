"""
ECONEURA Chief Financial Officer (neura-3)
Agente especializado en análisis de datos, métricas y reportes
"""
from fastapi import FastAPI, Request, Header, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import httpx
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
import json
from opentelemetry import trace
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))
from observability.otlp_utils import setup_observability, instrument_fastapi_app

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
    try:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {str(e)}")

# Endpoints
@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "service": "neura-cfo",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "openai_configured": bool(AZURE_OPENAI_KEY),
        "db_configured": True
    }

@app.post("/v1/task", response_model=TaskResponse)
async def execute_task(
    task: TaskRequest,
    authorization: str = Header(None),
    x_correlation_id: str = Header(None)
):
    """
    Execute analytics task using Azure OpenAI
    Registers invocation in database and returns results
    """
    with tracer.start_as_current_span("cfo_task") as span:
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
                    "message": "Azure OpenAI not configured - simulation mode",
                    "input_received": task.input,
                    "simulated_output": "Analytics result placeholder - configure AZURE_OPENAI_API_KEY"
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
            
            # Llamar Azure OpenAI
            start_time = datetime.utcnow()
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version={AZURE_OPENAI_VERSION}",
                    headers={
                        "api-key": AZURE_OPENAI_KEY,
                        "Content-Type": "application/json"
                    },
                    json={
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are an financial analysis and planning expert. Provide clear, actionable insights based on the data provided."
                            },
                            {
                                "role": "user",
                                "content": json.dumps(task.input)
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 2000
                    }
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=502,
                        detail=f"OpenAI API error: {response.status_code} - {response.text}"
                    )
                
                result = response.json()
                output = result["choices"][0]["message"]["content"]
                usage = result.get("usage", {})
                
                duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                
                # Actualizar invocación como success
                cursor.execute("""
                    UPDATE invocations 
                    SET output = %s, status = 'success', completed_at = NOW(), duration_ms = %s
                    WHERE id = %s
                """, (json.dumps({"result": output, "usage": usage}), duration_ms, invocation_id))
                conn.commit()
                
                # Registrar costo si hay tokens
                if usage:
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
                
                request_counter.add(1, {"status": "success"})
                
                return TaskResponse(
                    status="success",
                    invocation_id=str(invocation_id),
                    output={"result": output, "usage": usage}
                )
                
        except HTTPException:
            raise
        except Exception as e:
            error_counter.add(1, {"error_type": type(e).__name__})
            
            # Actualizar como error en DB
            if conn and invocation_id:
                try:
                    cursor.execute("""
                        UPDATE invocations 
                        SET status = 'error', error_message = %s, completed_at = NOW()
                        WHERE id = %s
                    """, (str(e), invocation_id))
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8103)

