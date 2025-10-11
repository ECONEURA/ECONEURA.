"""
ECONEURA Reception Agent (neura-9)
Agente especializado en recepción y atención al cliente con capacidades avanzadas
Incluye: búsqueda web, análisis de archivos, ejecución de código, integración GitHub
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

# TEMPORAL: Comentar OTLP para testing
# from observability.otlp_utils import setup_observability, instrument_fastapi_app

# Import herramientas avanzadas (módulos en parent directory)
try:
    from advanced_tools import advanced_tools
    from context_memory import context_memory
except ImportError:
    # Si falla, intentar import relativo
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from advanced_tools import advanced_tools
    from context_memory import context_memory

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
    title="ECONEURA Reception Agent",
    version="1.0.0",
    description="Agent specialized in Reception Agent responsibilities"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TEMPORAL: Comentar OTLP para testing
# Configurar observabilidad
# tracer, meter = setup_observability("neura-reception", "1.0.0")
# instrument_fastapi_app(app, "neura-reception")
tracer = trace.get_tracer("neura-reception")

# Métricas (mock temporal)
class MockCounter:
    def add(self, value, attributes=None):
        pass

request_counter = MockCounter()
error_counter = MockCounter()

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
        "service": "neura-reception",
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
    with tracer.start_as_current_span("reception_task") as span:
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
            """, ("neura-9", task.user_id, json.dumps(task.input), task.correlation_id, "processing"))
            
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
            
            # Llamar Azure OpenAI con herramientas avanzadas y memoria contextual
            start_time = datetime.utcnow()
            
            # Obtener herramientas disponibles
            tools = advanced_tools.get_available_tools()
            
            # Obtener contexto previo del usuario
            user_context = context_memory.get_context(
                task.user_id,
                include_system=False,
                max_messages=10  # Últimos 10 mensajes
            )
            
            # Construir mensajes con contexto
            messages = [
                {
                    "role": "system",
                    "content": """Eres un asistente de recepción experto con capacidades avanzadas.
                    
Puedes:
- Buscar información actualizada en Internet (web_search)
- Analizar archivos de código y documentos (analyze_file)
- Ejecutar código Python/JavaScript de forma segura (execute_code)
- Buscar código en GitHub (github_search)

Usa estas herramientas cuando sea necesario para proporcionar respuestas precisas y actualizadas.
Sé claro, profesional y orientado a soluciones.

IMPORTANTE: Mantén contexto de la conversación previa con el usuario."""
                }
            ]
            
            # Agregar contexto previo si existe
            if user_context:
                messages.extend(user_context)
            
            # Agregar mensaje actual del usuario
            user_message = json.dumps(task.input) if isinstance(task.input, dict) else str(task.input)
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            # Guardar mensaje del usuario en memoria
            context_memory.add_message(
                task.user_id,
                "user",
                user_message,
                {"correlation_id": task.correlation_id}
            )
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                # Primera llamada a OpenAI (puede solicitar function calling)
                response = await client.post(
                    f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version={AZURE_OPENAI_VERSION}",
                    headers={
                        "api-key": AZURE_OPENAI_KEY,
                        "Content-Type": "application/json"
                    },
                    json={
                        "messages": messages,
                        "tools": tools,
                        "tool_choice": "auto",
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
                assistant_message = result["choices"][0]["message"]
                
                # Verificar si el asistente quiere usar herramientas
                tool_calls = assistant_message.get("tool_calls", [])
                
                if tool_calls:
                    # El asistente solicitó usar herramientas
                    messages.append(assistant_message)
                    
                    # Ejecutar cada tool call
                    for tool_call in tool_calls:
                        function_name = tool_call["function"]["name"]
                        function_args = json.loads(tool_call["function"]["arguments"])
                        
                        span.add_event(f"Executing tool: {function_name}", {
                            "arguments": json.dumps(function_args)
                        })
                        
                        # Ejecutar la herramienta
                        tool_result = await advanced_tools.execute_tool(
                            function_name,
                            function_args
                        )
                        
                        # Agregar resultado como mensaje
                        messages.append({
                            "role": "tool",
                            "tool_call_id": tool_call["id"],
                            "name": function_name,
                            "content": json.dumps(tool_result)
                        })
                    
                    # Segunda llamada a OpenAI con resultados de herramientas
                    response = await client.post(
                        f"{AZURE_OPENAI_ENDPOINT}/openai/deployments/{AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version={AZURE_OPENAI_VERSION}",
                        headers={
                            "api-key": AZURE_OPENAI_KEY,
                            "Content-Type": "application/json"
                        },
                        json={
                            "messages": messages,
                            "temperature": 0.7,
                            "max_tokens": 2000
                        }
                    )
                    
                    if response.status_code != 200:
                        raise HTTPException(
                            status_code=502,
                            detail=f"OpenAI API error (second call): {response.status_code} - {response.text}"
                        )
                    
                    result = response.json()
                    assistant_message = result["choices"][0]["message"]
                
                output = assistant_message.get("content", "")
                usage = result.get("usage", {})
                
                duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
                
                # Guardar respuesta del asistente en memoria contextual
                context_memory.add_message(
                    task.user_id,
                    "assistant",
                    output,
                    {
                        "invocation_id": str(invocation_id),
                        "usage": usage,
                        "duration_ms": duration_ms,
                        "tools_used": len(tool_calls) if tool_calls else 0
                    }
                )
                
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
                        "neura-9",
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

@app.get("/context/{user_id}")
def get_user_context(user_id: str):
    """Obtiene el resumen del contexto de un usuario"""
    summary = context_memory.get_summary(user_id)
    return {"user_id": user_id, "context": summary}

@app.delete("/context/{user_id}")
def clear_user_context(user_id: str):
    """Limpia el contexto de un usuario"""
    context_memory.clear_context(user_id)
    return {"user_id": user_id, "status": "cleared"}

@app.get("/memory/stats")
def get_memory_stats():
    """Estadísticas del sistema de memoria"""
    return context_memory.get_statistics()

@app.post("/memory/cleanup")
def cleanup_expired():
    """Limpia contextos expirados"""
    result = context_memory.cleanup_expired_contexts()
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8109)


