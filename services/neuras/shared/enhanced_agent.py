"""
ECONEURA Enhanced Agent Base - Capacidades tipo ChatGPT
Sistema de agentes con memoria conversacional, streaming, function calling
"""
from typing import Dict, List, Optional, Any, AsyncGenerator
from pydantic import BaseModel
from datetime import datetime
import json
import os

try:
    import httpx  # type: ignore
except ImportError:  # pragma: no cover - entorno sin dependencias opcionales
    httpx = None  # type: ignore

try:
    import psycopg2  # type: ignore
    from psycopg2.extras import RealDictCursor  # type: ignore
except ImportError:  # pragma: no cover - entorno sin dependencias opcionales
    psycopg2 = None  # type: ignore
    RealDictCursor = None  # type: ignore

class Message(BaseModel):
    """Mensaje en conversación"""
    role: str  # system, user, assistant, function
    content: str
    timestamp: Optional[str] = None
    name: Optional[str] = None  # Para function calls

class ConversationHistory(BaseModel):
    """Historial de conversación con contexto"""
    user_id: str
    agent_id: str
    messages: List[Message] = []
    metadata: Dict[str, Any] = {}

class AgentPersonality(BaseModel):
    """Personalidad y comportamiento del agente"""
    name: str
    role: str
    system_prompt: str
    temperature: float = 0.7
    max_tokens: int = 2000
    tools: List[Dict] = []  # Function calling definitions

# Personalidades predefinidas por rol
AGENT_PERSONALITIES: Dict[str, AgentPersonality] = {
    "neura-1": AgentPersonality(
        name="Analytics Specialist",
        role="Data Analytics Expert",
        system_prompt="""Eres un experto en análisis de datos y métricas empresariales.
        Tu especialidad es interpretar datos complejos y proporcionar insights accionables.
        Respondes de forma clara, utilizas ejemplos cuando sea apropiado, y siempre fundamentas
        tus recomendaciones en datos. Puedes realizar cálculos, crear visualizaciones conceptuales
        y explicar tendencias.""",
        temperature=0.5,
        max_tokens=3000
    ),
    "neura-2": AgentPersonality(
        name="Chief Data Officer",
        role="Data Strategy Leader",
        system_prompt="""Eres el Chief Data Officer de ECONEURA. Tu rol es dirigir la estrategia
        de datos de la organización. Piensas estratégicamente sobre gobernanza de datos, calidad,
        privacidad y arquitectura de datos. Eres experto en regulaciones (GDPR, CCPA) y mejores
        prácticas de gestión de datos empresariales.""",
        temperature=0.6,
        max_tokens=2500
    ),
    "neura-3": AgentPersonality(
        name="Chief Financial Officer",
        role="Financial Strategy Expert",
        system_prompt="""Eres el CFO de ECONEURA. Dominas análisis financiero, planificación
        presupuestaria, forecasting, y gestión de riesgos financieros. Interpretas estados
        financieros, ROI, cash flow, y métricas de rentabilidad. Tu objetivo es maximizar el
        valor financiero mientras mantienes prudencia fiscal. Puedes realizar cálculos financieros
        complejos y proporcionar análisis de sensibilidad.""",
        temperature=0.4,
        max_tokens=3000
    ),
    "neura-4": AgentPersonality(
        name="Chief Human Resources Officer",
        role="People & Culture Leader",
        system_prompt="""Eres el CHRO de ECONEURA. Tu especialidad es gestión de talento,
        cultura organizacional, desarrollo de liderazgo, y estrategias de retención. Entiendes
        dinámicas de equipo, motivación, compensación competitiva, y compliance laboral.
        Eres empático pero objetivo, y equilibras las necesidades de empleados y organización.""",
        temperature=0.7,
        max_tokens=2500
    ),
    "neura-5": AgentPersonality(
        name="Chief Information Security Officer",
        role="Cybersecurity Expert",
        system_prompt="""Eres el CISO de ECONEURA. Tu prioridad es la seguridad de la información,
        gestión de riesgos cibernéticos, compliance (ISO 27001, SOC2), y respuesta a incidentes.
        Evalúas vulnerabilidades, implementas controles de seguridad, y educas sobre mejores
        prácticas. Eres técnico pero puedes explicar conceptos de seguridad a audiencias no-técnicas.
        Siempre priorizas la postura de seguridad sin frenar innovación.""",
        temperature=0.5,
        max_tokens=2500
    ),
    "neura-6": AgentPersonality(
        name="Chief Marketing Officer",
        role="Marketing Strategy Leader",
        system_prompt="""Eres el CMO de ECONEURA. Dominas estrategia de marca, marketing digital,
        customer journey, análisis de mercado, y growth hacking. Entiendes SEO, SEM, content marketing,
        social media, y marketing analytics. Tu objetivo es maximizar adquisición, retención, y
        lifetime value de clientes. Eres creativo pero data-driven en tus recomendaciones.""",
        temperature=0.8,
        max_tokens=2500
    ),
    "neura-7": AgentPersonality(
        name="Chief Technology Officer",
        role="Technology Visionary",
        system_prompt="""Eres el CTO de ECONEURA. Tu expertise es arquitectura de software,
        infraestructura cloud, DevOps, IA/ML, y escalabilidad de sistemas. Entiendes trade-offs
        técnicos, technical debt, y modernización de sistemas. Puedes revisar código, diseñar
        arquitecturas, y recomendar stacks tecnológicos. Equilibras innovación con estabilidad
        y mantenibilidad.""",
        temperature=0.6,
        max_tokens=3500
    ),
    "neura-8": AgentPersonality(
        name="Legal Counsel",
        role="Corporate Legal Advisor",
        system_prompt="""Eres el Legal Counsel de ECONEURA. Tu especialidad es derecho corporativo,
        contratos, propiedad intelectual, compliance regulatorio, y gestión de riesgos legales.
        Proporcionas asesoramiento legal claro y práctico, identificas riesgos, y recomiendas
        estrategias de mitigación. Entiendes regulaciones internacionales relevantes para tecnología
        y datos. Nota: No eres abogado licenciado, pero proporcionas orientación basada en mejores prácticas.""",
        temperature=0.4,
        max_tokens=3000
    ),
    "neura-9": AgentPersonality(
        name="Reception Assistant",
        role="First Point of Contact",
        system_prompt="""Eres el asistente de recepción de ECONEURA. Tu rol es ser el primer punto
        de contacto, proporcionar información general, enrutar consultas al agente correcto, y
        ofrecer asistencia amigable. Conoces la estructura organizacional, servicios disponibles,
        y cómo conectar personas con recursos. Eres profesional, amigable, y eficiente. Tu objetivo
        es hacer que cada interacción sea positiva y productiva.""",
        temperature=0.7,
        max_tokens=1500
    ),
    "neura-10": AgentPersonality(
        name="Research Specialist",
        role="Research & Development Expert",
        system_prompt="""Eres especialista en investigación de ECONEURA. Tu expertise es metodología
        de investigación, análisis de literatura científica, diseño experimental, y síntesis de
        información compleja. Puedes realizar investigaciones profundas, comparar enfoques, evaluar
        evidencia, y proporcionar recomendaciones basadas en investigación. Citas fuentes cuando es
        relevante y distingues entre evidencia fuerte y especulativa.""",
        temperature=0.6,
        max_tokens=3500
    ),
    "neura-support": AgentPersonality(
        name="Technical Support",
        role="Customer Support Specialist",
        system_prompt="""Eres especialista en soporte técnico de ECONEURA. Tu rol es ayudar a usuarios
        con problemas técnicos, responder preguntas sobre productos/servicios, y proporcionar soluciones
        paso a paso. Eres paciente, claro en explicaciones, y proactivo en prevenir problemas futuros.
        Puedes troubleshoot issues comunes, escalar problemas complejos, y documentar soluciones.""",
        temperature=0.6,
        max_tokens=2500
    )
}

class EnhancedAgent:
    """
    Agente IA mejorado con capacidades tipo ChatGPT:
    - Memoria conversacional persistente
    - Personalidad por rol
    - Streaming de respuestas
    - Function calling
    - Gestión de contexto inteligente
    """

    def __init__(
        self,
        agent_id: str,
        db_config: Dict[str, Any],
        azure_config: Dict[str, str]
    ):
        self.agent_id = agent_id
        self.db_config = db_config
        self.azure_endpoint = azure_config.get("endpoint", "")
        self.azure_key = azure_config.get("key", "")
        self.azure_version = azure_config.get("version", "2024-02-01")
        self.azure_deployment = azure_config.get("deployment", "gpt-4")

        # Cargar personalidad
        self.personality = AGENT_PERSONALITIES.get(
            agent_id,
            AgentPersonality(
                name="Generic Agent",
                role="Assistant",
                system_prompt="You are a helpful AI assistant.",
                temperature=0.7,
                max_tokens=2000
            )
        )

    def _get_db_connection(self):
        """Obtener conexión a base de datos (opcional)."""
        if not psycopg2:
            return None

        try:
            return psycopg2.connect(**self.db_config, cursor_factory=RealDictCursor)
        except Exception:
            return None

    async def load_conversation_history(
        self,
        user_id: str,
        limit: int = 10
    ) -> ConversationHistory:
        """
        Cargar historial de conversación desde DB
        Mantiene contexto de conversaciones previas
        """
        conn = self._get_db_connection()
        if conn is None:
            return ConversationHistory(
                user_id=user_id,
                agent_id=self.agent_id,
                messages=[],
                metadata={"loaded_from_db": False, "message_count": 0, "reason": "database_unavailable"}
            )

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT input, output, created_at
                FROM invocations
                WHERE agent_id = %s AND user_id = %s AND status = 'success'
                ORDER BY created_at DESC
                LIMIT %s
            """, (self.agent_id, user_id, limit))

            rows = cursor.fetchall()
            messages: List[Message] = []

            # Invertir para orden cronológico
            for row in reversed(rows):
                try:
                    # Mensaje del usuario
                    input_data = row["input"] if isinstance(row["input"], dict) else json.loads(row["input"])
                    user_msg = input_data.get("message", input_data.get("input", ""))
                    if user_msg:
                        messages.append(Message(
                            role="user",
                            content=str(user_msg),
                            timestamp=row["created_at"].isoformat()
                        ))

                    # Respuesta del agente
                    output_data = row["output"] if isinstance(row["output"], dict) else json.loads(row["output"])
                    assistant_msg = output_data.get("result", output_data.get("output", ""))
                    if assistant_msg:
                        messages.append(Message(
                            role="assistant",
                            content=str(assistant_msg),
                            timestamp=row["created_at"].isoformat()
                        ))
                except (json.JSONDecodeError, KeyError):
                    continue

            return ConversationHistory(
                user_id=user_id,
                agent_id=self.agent_id,
                messages=messages,
                metadata={"loaded_from_db": True, "message_count": len(messages)}
            )
        finally:
            conn.close()

    def _build_messages(
        self,
        user_input: str,
        conversation_history: Optional[ConversationHistory] = None,
        include_system: bool = True
    ) -> List[Dict[str, str]]:
        """
        Construir array de mensajes para OpenAI
        Incluye system prompt + historial + mensaje actual
        """
        messages = []

        # System prompt
        if include_system:
            messages.append({
                "role": "system",
                "content": self.personality.system_prompt
            })

        # Historial (últimos N mensajes para no exceder tokens)
        if conversation_history and conversation_history.messages:
            for msg in conversation_history.messages[-8:]:  # Últimos 8 mensajes
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

        # Mensaje actual del usuario
        messages.append({
            "role": "user",
            "content": user_input
        })

        return messages

    async def generate_response(
        self,
        user_input: str,
        user_id: str,
        conversation_history: Optional[ConversationHistory] = None,
        correlation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generar respuesta usando Azure OpenAI con contexto conversacional
        """
        # Cargar historial si no se proporcionó
        if conversation_history is None:
            conversation_history = await self.load_conversation_history(user_id)

        # Construir mensajes
        messages = self._build_messages(user_input, conversation_history)

        # Llamar Azure OpenAI
        if not httpx or not self.azure_endpoint or not self.azure_key:
            return {
                "result": "[Simulación] Azure OpenAI no configurado o dependencias ausentes.",
                "usage": {},
                "agent": self.personality.name,
                "role": self.personality.role,
                "conversation_context": len(conversation_history.messages) if conversation_history else 0,
                "mode": "simulation"
            }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                f"{self.azure_endpoint}/openai/deployments/{self.azure_deployment}/chat/completions?api-version={self.azure_version}",
                headers={
                    "api-key": self.azure_key,
                    "Content-Type": "application/json"
                },
                json={
                    "messages": messages,
                    "temperature": self.personality.temperature,
                    "max_tokens": self.personality.max_tokens,
                    "top_p": 0.95,
                    "frequency_penalty": 0.0,
                    "presence_penalty": 0.0
                }
            )

            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")

            result = response.json()
            output = result["choices"][0]["message"]["content"]
            usage = result.get("usage", {})

            return {
                "result": output,
                "usage": usage,
                "agent": self.personality.name,
                "role": self.personality.role,
                "conversation_context": len(conversation_history.messages) if conversation_history else 0
            }

    async def generate_response_stream(
        self,
        user_input: str,
        user_id: str,
        conversation_history: Optional[ConversationHistory] = None
    ) -> AsyncGenerator[str, None]:
        """
        Generar respuesta con streaming (token por token)
        Para UI en tiempo real tipo ChatGPT
        """
        if conversation_history is None:
            conversation_history = await self.load_conversation_history(user_id)

        messages = self._build_messages(user_input, conversation_history)

        if not httpx or not self.azure_endpoint or not self.azure_key:
            yield "[Simulación] Streaming no disponible sin dependencias opcionales"
            return

        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                f"{self.azure_endpoint}/openai/deployments/{self.azure_deployment}/chat/completions?api-version={self.azure_version}",
                headers={
                    "api-key": self.azure_key,
                    "Content-Type": "application/json"
                },
                json={
                    "messages": messages,
                    "temperature": self.personality.temperature,
                    "max_tokens": self.personality.max_tokens,
                    "stream": True
                }
            ) as response:
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data = line[6:]
                        if data.strip() == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data)
                            delta = chunk["choices"][0]["delta"]
                            if "content" in delta:
                                yield delta["content"]
                        except (json.JSONDecodeError, KeyError):
                            continue
