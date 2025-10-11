# 🌐 ECONEURA Gateway

API Gateway FastAPI para ruteo de 11 agentes Python.

## 🚀 Inicio Rápido

```powershell
# Opción 1: Usar script PowerShell
.\start.ps1

# Opción 2: Comando directo
python -m uvicorn app:app --host 0.0.0.0 --port 8080 --reload
```

## 📡 Endpoints

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Lista de Agentes
```bash
curl http://localhost:8080/api/agents
```

### Invocar Agente
```bash
curl -X POST http://localhost:8080/api/invoke/neura-9 \
  -H "Content-Type: application/json" \
  -d '{"input":{"message":"Hola"},"user_id":"user123","correlation_id":"test1"}'
```

## 🔌 Agentes Configurados

| ID | Puerto | Agente |
|----|--------|--------|
| neura-1 | 8101 | Analytics |
| neura-2 | 8102 | CDO |
| neura-3 | 8103 | CFO |
| neura-4 | 8104 | CHRO |
| neura-5 | 8105 | CISO |
| neura-6 | 8106 | CMO |
| neura-7 | 8107 | CTO |
| neura-8 | 8108 | Legal |
| neura-9 | 3101 | Reception |
| neura-10 | 8110 | Research |
| neura-11 | 8111 | Support |

## 🛠️ Tecnología

- **FastAPI** - Framework web Python
- **httpx** - Cliente HTTP async
- **uvicorn** - ASGI server

## 📝 Notas

- Puerto: **8080**
- CORS: Habilitado para todos los orígenes
- Timeout: 30 segundos por request
- Retry: No implementado (agregar si es necesario)
