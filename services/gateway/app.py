"""
ECONEURA Gateway - Proxy FastAPI para ruteo de agentes
Puerto 8080 - Conecta Frontend con 11 agentes Python
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse, FileResponse
import httpx
import os
from datetime import datetime
from typing import Dict, Any
from pathlib import Path

# Inicializar FastAPI
app = FastAPI(
    title="ECONEURA Gateway",
    version="1.0.0",
    description="API Gateway para ruteo de 11 agentes Python"
)

# CORS - permitir todos los orígenes en desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mapa de agentes (11 agentes Python en services/neuras/)
AGENT_ROUTES: Dict[str, str] = {
    'neura-1': 'http://localhost:8101',  # analytics
    'neura-2': 'http://localhost:8102',  # cdo
    'neura-3': 'http://localhost:8103',  # cfo
    'neura-4': 'http://localhost:8104',  # chro
    'neura-5': 'http://localhost:8105',  # ciso
    'neura-6': 'http://localhost:8106',  # cmo
    'neura-7': 'http://localhost:8107',  # cto
    'neura-8': 'http://localhost:8108',  # legal
    'neura-9': 'http://localhost:3101',  # reception (puerto especial)
    'neura-10': 'http://localhost:8110', # research
    'neura-11': 'http://localhost:8111', # support
}

# ==================== ENDPOINTS ====================

@app.get("/", response_class=HTMLResponse)
def root():
    """Root endpoint - sirve test.html"""
    html_path = Path(__file__).parent / "test.html"
    if html_path.exists():
        return FileResponse(html_path)
    return HTMLResponse("""
        <html>
            <body style="background:#0f0f1e;color:white;font-family:sans-serif;padding:40px;text-align:center;">
                <h1>🧠 ECONEURA Gateway</h1>
                <p>Gateway funcionando en puerto 8080</p>
                <p><a href="/api/health" style="color:#00d4ff;">Ver /api/health</a></p>
            </body>
        </html>
    """)


@app.get("/api/health")
def health():
    """Health check endpoint"""
    return {
        "service": "econeura-gateway",
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "agents_configured": len(AGENT_ROUTES),
        "agent_ids": list(AGENT_ROUTES.keys())
    }


@app.get("/api/agents")
def list_agents():
    """Lista todos los agentes disponibles"""
    agents = []
    for agent_id, url in AGENT_ROUTES.items():
        agents.append({
            "id": agent_id,
            "endpoint": url,
            "status": "configured"
        })
    
    return {
        "total": len(agents),
        "agents": agents
    }


@app.post("/api/invoke/{agent_id}")
async def invoke_agent(agent_id: str, request: Request):
    """
    Invoca un agente específico y retorna la respuesta
    
    Args:
        agent_id: ID del agente (neura-1, neura-2, etc.)
        request: Body con el payload para el agente
    
    Returns:
        Respuesta JSON del agente
    """
    # Validar que el agente existe
    if agent_id not in AGENT_ROUTES:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Agent '{agent_id}' not found",
                "available_agents": list(AGENT_ROUTES.keys())
            }
        )
    
    # Obtener URL del agente
    agent_url = AGENT_ROUTES[agent_id]
    
    try:
        # Leer body del request
        body = await request.json()
        
        # Headers para forward
        headers = {
            "Content-Type": "application/json",
            "X-Forwarded-For": request.client.host if request.client else "unknown",
            "X-Correlation-Id": request.headers.get("X-Correlation-Id", "gateway-req")
        }
        
        # Forward request al agente con timeout de 30 segundos
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{agent_url}/v1/task",
                json=body,
                headers=headers
            )
            
            # Si el agente responde con error HTTP, retornar el error
            if response.status_code != 200:
                return JSONResponse(
                    status_code=response.status_code,
                    content={
                        "error": "Agent returned error",
                        "agent_id": agent_id,
                        "status_code": response.status_code,
                        "detail": response.text
                    }
                )
            
            # Retornar respuesta del agente
            return response.json()
    
    except httpx.ConnectError:
        # Error de conexión - agente no disponible
        raise HTTPException(
            status_code=503,
            detail={
                "error": "Agent unavailable",
                "agent_id": agent_id,
                "agent_url": agent_url,
                "message": f"Cannot connect to agent at {agent_url}"
            }
        )
    
    except httpx.TimeoutException:
        # Timeout - agente tardó más de 30 segundos
        raise HTTPException(
            status_code=504,
            detail={
                "error": "Agent timeout",
                "agent_id": agent_id,
                "message": "Agent took too long to respond (>30s)"
            }
        )
    
    except Exception as e:
        # Error genérico
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Gateway error",
                "agent_id": agent_id,
                "message": str(e)
            }
        )


# ==================== STARTUP ====================

@app.on_event("startup")
async def startup_event():
    """Log de inicio"""
    print("=" * 60)
    print("🚀 ECONEURA Gateway Starting...")
    print(f"📊 Version: 1.0.0")
    print(f"🔌 Agents configured: {len(AGENT_ROUTES)}")
    print(f"🌐 CORS: Enabled (all origins)")
    print("=" * 60)
    print("\n📋 Available Agents:")
    for agent_id, url in AGENT_ROUTES.items():
        print(f"   • {agent_id:12} → {url}")
    print("\n" + "=" * 60)
    print("✅ Gateway ready on http://localhost:8080")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8080,
        log_level="info"
    )
