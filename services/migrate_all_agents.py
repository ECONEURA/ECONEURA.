#!/usr/bin/env python3
"""
Script para migrar todos los agentes ECONEURA a EnhancedAgent
Aplica mejoras de capacidades ChatGPT a los 11 servicios
"""
import os
import re
from pathlib import Path

# Directorio base de servicios
SERVICES_DIR = Path(__file__).parent.parent
NEURAS_DIR = SERVICES_DIR / "neuras"

# Mapeo de agentes
AGENTS = {
    "analytics": {
        "id": "neura-1",
        "port": 8101,
        "title": "ECONEURA Analytics Specialist",
        "description": "Agent specialized in data analytics and metrics"
    },
    "cdo": {
        "id": "neura-2",
        "port": 8102,
        "title": "ECONEURA Chief Data Officer",
        "description": "Agent specialized in Chief Data Officer responsibilities"
    },
    "cfo": {
        "id": "neura-3",
        "port": 8103,
        "title": "ECONEURA Chief Financial Officer",
        "description": "Agent specialized in Chief Financial Officer responsibilities"
    },
    "chro": {
        "id": "neura-4",
        "port": 8104,
        "title": "ECONEURA Chief Human Resources Officer",
        "description": "Agent specialized in Chief Human Resources Officer responsibilities"
    },
    "ciso": {
        "id": "neura-5",
        "port": 8105,
        "title": "ECONEURA Chief Information Security Officer",
        "description": "Agent specialized in Chief Information Security Officer responsibilities"
    },
    "cmo": {
        "id": "neura-6",
        "port": 8106,
        "title": "ECONEURA Chief Marketing Officer",
        "description": "Agent specialized in Chief Marketing Officer responsibilities"
    },
    "cto": {
        "id": "neura-7",
        "port": 8107,
        "title": "ECONEURA Chief Technology Officer",
        "description": "Agent specialized in Chief Technology Officer responsibilities"
    },
    "legal": {
        "id": "neura-8",
        "port": 8108,
        "title": "ECONEURA Legal Counsel",
        "description": "Agent specialized in legal counsel and compliance"
    },
    "reception": {
        "id": "neura-9",
        "port": 8109,
        "title": "ECONEURA Reception Assistant",
        "description": "First point of contact and routing assistant"
    },
    "research": {
        "id": "neura-10",
        "port": 8110,
        "title": "ECONEURA Research Specialist",
        "description": "Agent specialized in research and development"
    },
    "support": {
        "id": "neura-support",
        "port": 8111,
        "title": "ECONEURA Technical Support",
        "description": "Customer support and troubleshooting specialist"
    }
}

TEMPLATE = '''"""
{title}
Agente con capacidades ChatGPT avanzadas
Memoria conversacional, personalidad especializada, streaming responses
"""
from fastapi import FastAPI, Request, Header, HTTPException, Depends
from fastapi.responses import JSONResponse, StreamingResponse
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
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from shared.enhanced_agent import EnhancedAgent, ConversationHistory

# Configuración Azure OpenAI
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_API_ENDPOINT", "")
AZURE_OPENAI_KEY = os.getenv("AZURE_OPENAI_API_KEY", "")
AZURE_OPENAI_VERSION = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
AZURE_OPENAI_DEPLOYMENT = os.getenv("AZURE_OPENAI_DEPLOYMENT", "gpt-4")

# Base de datos
DB_CONFIG = {{
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "database": os.getenv("DB_NAME", "econeura_dev"),
    "user": os.getenv("DB_USER", "econeura"),
    "password": os.getenv("DB_PASSWORD", "dev_password"),
}}

# Inicializar Enhanced Agent
enhanced_agent = EnhancedAgent(
    agent_id="{agent_id}",
    db_config=DB_CONFIG,
    azure_config={{
        "endpoint": AZURE_OPENAI_ENDPOINT,
        "key": AZURE_OPENAI_KEY,
        "version": AZURE_OPENAI_VERSION,
        "deployment": AZURE_OPENAI_DEPLOYMENT
    }}
)

# Inicializar FastAPI
app = FastAPI(
    title="{title}",
    version="2.0.0",
    description="{description}"
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
tracer, meter = setup_observability("{service_name}", "2.0.0")
instrument_fastapi_app(app, "{service_name}")

# Métricas
request_counter = meter.create_counter(
    "{service_name}_requests_total",
    description="Total requests to {title}"
)
error_counter = meter.create_counter(
    "{service_name}_errors_total",
    description="Total errors in {title}"
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

class ChatMessage(BaseModel):
    message: str
    user_id: str
    correlation_id: str = "chat-session"
    load_history: bool = True

# Utilidades DB
def get_db_connection():
    try:
        return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
    except psycopg2.OperationalError as e:
        raise HTTPException(status_code=503, detail=f"Database unavailable: {{str(e)}}")

# Endpoints
@app.get("/health")
def health():
    """Health check endpoint"""
    return {{
        "service": "{service_name}",
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "2.0.0",
        "enhanced": True,
        "agent_name": enhanced_agent.personality.name,
        "agent_role": enhanced_agent.personality.role,
        "openai_configured": bool(AZURE_OPENAI_KEY),
        "db_configured": True
    }}

@app.post("/v1/task", response_model=TaskResponse)
async def execute_task(
    task: TaskRequest,
    authorization: str = Header(None),
    x_correlation_id: str = Header(None)
):
    """
    Execute task with enhanced AI capabilities
    - Memoria conversacional automática
    - Personalidad especializada
    - Contexto de conversaciones previas
    """
    with tracer.start_as_current_span("{service_name}_task_enhanced") as span:
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
            """, ("{agent_id}", task.user_id, json.dumps(task.input), task.correlation_id, "processing"))
            
            invocation_id = cursor.fetchone()["id"]
            conn.commit()
            span.set_attribute("invocation_id", str(invocation_id))
            
            # Si no hay Azure OpenAI configurado, modo simulación
            if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
                result = {{
                    "mode": "simulation",
                    "message": "Azure OpenAI not configured - configure AZURE_OPENAI_API_KEY to enable full AI capabilities",
                    "agent": enhanced_agent.personality.name,
                    "input_received": task.input
                }}
                
                cursor.execute("""
                    UPDATE invocations 
                    SET output = %s, status = 'success', completed_at = NOW()
                    WHERE id = %s
                """, (json.dumps(result), invocation_id))
                conn.commit()
                
                request_counter.add(1, {{"status": "simulation"}})
                
                return TaskResponse(
                    status="success",
                    invocation_id=str(invocation_id),
                    output=result
                )
            
            # Extraer mensaje del usuario
            user_message = task.input.get("message") or task.input.get("input") or json.dumps(task.input)
            
            # Generar respuesta con Enhanced Agent
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
                    "{agent_id}",
                    usage.get("prompt_tokens", 0),
                    usage.get("completion_tokens", 0),
                    AZURE_OPENAI_DEPLOYMENT
                ))
                conn.commit()
            
            request_counter.add(1, {{"status": "success", "enhanced": "true"}})
            
            return TaskResponse(
                status="success",
                invocation_id=str(invocation_id),
                output=result
            )
                
        except HTTPException:
            raise
        except Exception as e:
            error_counter.add(1, {{"error_type": type(e).__name__}})
            
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

@app.post("/v1/chat")
async def chat(
    chat_msg: ChatMessage,
    authorization: str = Header(None)
):
    """
    Chat conversacional con memoria automática
    Endpoint estilo ChatGPT - mantiene contexto de conversaciones previas
    """
    with tracer.start_as_current_span("{service_name}_chat") as span:
        span.set_attribute("user_id", chat_msg.user_id)
        
        try:
            if not AZURE_OPENAI_KEY or not AZURE_OPENAI_ENDPOINT:
                return JSONResponse(
                    status_code=503,
                    content={{
                        "error": "Azure OpenAI not configured",
                        "message": "Configure AZURE_OPENAI_API_KEY to enable chat"
                    }}
                )
            
            # Cargar historial
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
            
            # Registrar en DB
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO invocations (agent_id, user_id, input, output, correlation_id, status, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    "{agent_id}",
                    chat_msg.user_id,
                    json.dumps({{"message": chat_msg.message}}),
                    json.dumps(result),
                    chat_msg.correlation_id,
                    "success"
                ))
                conn.commit()
            finally:
                conn.close()
            
            request_counter.add(1, {{"status": "success", "endpoint": "chat"}})
            
            return {{
                "status": "success",
                "response": result["result"],
                "agent": result["agent"],
                "role": result["role"],
                "context_messages": result.get("conversation_context", 0),
                "usage": result.get("usage", {{}})
            }}
            
        except Exception as e:
            error_counter.add(1, {{"error_type": type(e).__name__, "endpoint": "chat"}})
            return JSONResponse(
                status_code=500,
                content={{"error": str(e)}}
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
                yield f"data: {{json.dumps({{'error': 'Azure OpenAI not configured'}})}}\\n\\n"
                return
            
            # Cargar historial
            conversation_history = None
            if chat_msg.load_history:
                conversation_history = await enhanced_agent.load_conversation_history(
                    chat_msg.user_id,
                    limit=10
                )
            
            # Metadata inicial
            yield f"data: {{json.dumps({{'type': 'start', 'agent': enhanced_agent.personality.name}})}}\\n\\n"
            
            # Stream de contenido
            full_response = ""
            async for token in enhanced_agent.generate_response_stream(
                user_input=chat_msg.message,
                user_id=chat_msg.user_id,
                conversation_history=conversation_history
            ):
                full_response += token
                yield f"data: {{json.dumps({{'type': 'token', 'content': token}})}}\\n\\n"
            
            # Finalizar
            yield f"data: {{json.dumps({{'type': 'done'}})}}\\n\\n"
            
            # Registrar en DB
            conn = get_db_connection()
            try:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO invocations (agent_id, user_id, input, output, correlation_id, status, completed_at)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                """, (
                    "{agent_id}",
                    chat_msg.user_id,
                    json.dumps({{"message": chat_msg.message}}),
                    json.dumps({{"result": full_response}}),
                    chat_msg.correlation_id,
                    "success"
                ))
                conn.commit()
            finally:
                conn.close()
            
            request_counter.add(1, {{"status": "success", "endpoint": "stream"}})
            
        except Exception as e:
            error_counter.add(1, {{"error_type": type(e).__name__, "endpoint": "stream"}})
            yield f"data: {{json.dumps({{'type': 'error', 'error': str(e)}})}}\\n\\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={{
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port={port})
'''

def migrate_agent(agent_name: str, config: dict):
    """Migrar un agente a EnhancedAgent"""
    agent_dir = NEURAS_DIR / agent_name
    app_file = agent_dir / "app.py"
    
    if not agent_dir.exists():
        print(f"❌ {agent_name}: directorio no existe")
        return False
    
    # Generar código desde template
    code = TEMPLATE.format(
        title=config["title"],
        description=config["description"],
        agent_id=config["id"],
        port=config["port"],
        service_name=f"neura-{agent_name}"
    )
    
    # Escribir archivo
    with open(app_file, "w", encoding="utf-8") as f:
        f.write(code)
    
    print(f"✅ {agent_name}: migrado exitosamente ({config['id']} puerto {config['port']})")
    return True

def main():
    print("🚀 ECONEURA Agent Migration Tool")
    print("Migrando todos los agentes a EnhancedAgent con capacidades ChatGPT\n")
    
    success_count = 0
    total = len(AGENTS)
    
    for agent_name, config in AGENTS.items():
        if migrate_agent(agent_name, config):
            success_count += 1
    
    print(f"\n📊 Resultado: {success_count}/{total} agentes migrados exitosamente")
    
    if success_count == total:
        print("\n✅ TODOS LOS AGENTES MEJORADOS")
        print("\nCapacidades añadidas:")
        print("  ✓ Memoria conversacional automática")
        print("  ✓ Personalidades especializadas por rol")
        print("  ✓ Streaming de respuestas (token por token)")
        print("  ✓ 3 endpoints: /v1/task, /v1/chat, /v1/stream")
        print("\nPróximos pasos:")
        print("  1. Configurar AZURE_OPENAI_API_KEY en .env")
        print("  2. Iniciar servicios: cd services/neuras/<agente> && python app.py")
        print("  3. Probar chat: curl -X POST http://localhost:810X/v1/chat")
    else:
        print(f"\n⚠️ {total - success_count} agentes fallaron")

if __name__ == "__main__":
    main()
