"""
ECONEURA Context Memory System
Sistema de memoria contextual para mantener conversaciones coherentes
Similar a cómo GitHub Copilot mantiene el contexto de la conversación
"""
import os
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import deque

class ContextMemory:
    """
    Gestiona el contexto y memoria de conversaciones por usuario
    Mantiene historial limitado por tokens y tiempo
    """
    
    def __init__(
        self,
        max_messages: int = 50,
        max_tokens: int = 8000,
        context_ttl_hours: int = 24
    ):
        self.max_messages = max_messages
        self.max_tokens = max_tokens
        self.context_ttl = timedelta(hours=context_ttl_hours)
        
        # Memoria por usuario: user_id -> deque de mensajes
        self.user_contexts: Dict[str, deque] = {}
        
        # Metadata por usuario: timestamps, token counts
        self.user_metadata: Dict[str, Dict] = {}
    
    def add_message(
        self,
        user_id: str,
        role: str,
        content: str,
        metadata: Optional[Dict] = None
    ):
        """
        Agrega un mensaje al contexto del usuario
        
        Args:
            user_id: ID del usuario
            role: "user", "assistant", "system", o "tool"
            content: Contenido del mensaje
            metadata: Metadata adicional (tool_calls, usage, etc.)
        """
        # Inicializar contexto si no existe
        if user_id not in self.user_contexts:
            self.user_contexts[user_id] = deque(maxlen=self.max_messages)
            self.user_metadata[user_id] = {
                "created_at": datetime.utcnow(),
                "last_activity": datetime.utcnow(),
                "total_messages": 0,
                "total_tokens": 0
            }
        
        # Estimar tokens (aproximación: 1 token ≈ 4 caracteres)
        estimated_tokens = len(content) // 4
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow().isoformat(),
            "tokens": estimated_tokens,
            "metadata": metadata or {}
        }
        
        # Agregar mensaje
        self.user_contexts[user_id].append(message)
        
        # Actualizar metadata
        self.user_metadata[user_id]["last_activity"] = datetime.utcnow()
        self.user_metadata[user_id]["total_messages"] += 1
        self.user_metadata[user_id]["total_tokens"] += estimated_tokens
        
        # Limpiar mensajes antiguos si excede tokens
        self._trim_context(user_id)
    
    def get_context(
        self,
        user_id: str,
        include_system: bool = True,
        max_messages: Optional[int] = None
    ) -> List[Dict[str, Any]]:
        """
        Obtiene el contexto completo del usuario en formato Azure OpenAI
        
        Returns:
            Lista de mensajes en formato [{"role": "...", "content": "..."}]
        """
        if user_id not in self.user_contexts:
            return []
        
        # Verificar si el contexto ha expirado
        if self._is_context_expired(user_id):
            self.clear_context(user_id)
            return []
        
        messages = list(self.user_contexts[user_id])
        
        # Filtrar mensajes del sistema si se solicita
        if not include_system:
            messages = [m for m in messages if m["role"] != "system"]
        
        # Limitar número de mensajes
        if max_messages:
            messages = messages[-max_messages:]
        
        # Convertir a formato OpenAI (solo role y content)
        return [
            {"role": m["role"], "content": m["content"]}
            for m in messages
        ]
    
    def get_summary(self, user_id: str) -> Dict[str, Any]:
        """
        Obtiene resumen del contexto del usuario
        """
        if user_id not in self.user_metadata:
            return {"exists": False}
        
        metadata = self.user_metadata[user_id]
        context = self.user_contexts[user_id]
        
        return {
            "exists": True,
            "message_count": len(context),
            "total_tokens": sum(m["tokens"] for m in context),
            "created_at": metadata["created_at"].isoformat(),
            "last_activity": metadata["last_activity"].isoformat(),
            "age_hours": (datetime.utcnow() - metadata["created_at"]).total_seconds() / 3600,
            "is_expired": self._is_context_expired(user_id)
        }
    
    def clear_context(self, user_id: str):
        """Limpia el contexto de un usuario"""
        if user_id in self.user_contexts:
            del self.user_contexts[user_id]
        if user_id in self.user_metadata:
            del self.user_metadata[user_id]
    
    def _trim_context(self, user_id: str):
        """
        Recorta el contexto si excede el límite de tokens
        Mantiene los mensajes más recientes
        """
        context = self.user_contexts[user_id]
        total_tokens = sum(m["tokens"] for m in context)
        
        # Remover mensajes antiguos hasta estar bajo el límite
        while total_tokens > self.max_tokens and len(context) > 1:
            removed = context.popleft()
            total_tokens -= removed["tokens"]
    
    def _is_context_expired(self, user_id: str) -> bool:
        """Verifica si el contexto ha expirado por inactividad"""
        if user_id not in self.user_metadata:
            return True
        
        last_activity = self.user_metadata[user_id]["last_activity"]
        return (datetime.utcnow() - last_activity) > self.context_ttl
    
    def cleanup_expired_contexts(self):
        """
        Limpia contextos expirados de todos los usuarios
        Debe llamarse periódicamente (e.g., cada hora)
        """
        expired_users = [
            user_id
            for user_id in self.user_contexts
            if self._is_context_expired(user_id)
        ]
        
        for user_id in expired_users:
            self.clear_context(user_id)
        
        return {
            "cleaned": len(expired_users),
            "remaining": len(self.user_contexts)
        }
    
    def get_statistics(self) -> Dict[str, Any]:
        """Estadísticas globales del sistema de memoria"""
        total_messages = sum(
            len(context) for context in self.user_contexts.values()
        )
        total_tokens = sum(
            sum(m["tokens"] for m in context)
            for context in self.user_contexts.values()
        )
        
        return {
            "active_users": len(self.user_contexts),
            "total_messages": total_messages,
            "total_tokens": total_tokens,
            "avg_messages_per_user": total_messages / max(len(self.user_contexts), 1),
            "avg_tokens_per_user": total_tokens / max(len(self.user_contexts), 1)
        }


# Singleton instance
context_memory = ContextMemory(
    max_messages=int(os.getenv("MAX_CONTEXT_MESSAGES", "50")),
    max_tokens=int(os.getenv("CONTEXT_WINDOW_TOKENS", "8000")),
    context_ttl_hours=24
)
