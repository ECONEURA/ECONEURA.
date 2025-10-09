/**
 * ECONEURA - invokeAgent() Unificado
 * Funciona en desarrollo (backend Node.js) y producción (serverless Vercel)
 */

export interface InvokeAgentPayload {
  input?: string;
  context?: Record<string, any>;
  [key: string]: any;
}

export interface InvokeAgentResponse {
  ok: boolean;
  output: string;
  raw?: any;
}

const NEURA_AGENTS = [
  'ceo', 'cfo', 'cto', 'cmo', 'chro', 'ciso', 'cdo', 
  'legal', 'research', 'reception', 'support', 'analytics'
];

/**
 * Invoca un agente NEURA (CEO, CTO, etc.)
 * - En DEV: llama a backend Node.js en /api/invoke/:agentId
 * - En PROD: llama a serverless /api/chat (OpenAI)
 */
async function invokeAgent(
  agentId: string, 
  route: 'local' | 'azure' = 'azure', 
  payload: InvokeAgentPayload = {}
): Promise<InvokeAgentResponse> {
  // @ts-ignore - Vite proporciona import.meta.env
  const isDev = import.meta.env.DEV;
  // @ts-ignore - Vite proporciona import.meta.env
  const isProd = import.meta.env.PROD;
  
  // Detectar si es agente NEURA
  const isNeuraAgent = NEURA_AGENTS.some(dept => 
    agentId.toLowerCase().includes(dept)
  );
  
  // PRODUCCIÓN (Vercel): usar serverless /api/chat con OpenAI
  if (isProd && isNeuraAgent) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: agentId.toLowerCase().replace(/[^a-z]/g, ''),
          message: payload?.input ?? 'Hola, ¿cómo puedo ayudarte?',
          context: payload?.context ?? {}
        }),
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'No disponible' }));
        return { 
          ok: false, 
          output: `Error OpenAI: ${error.error || res.statusText}` 
        };
      }
      
      const data = await res.json();
      return { 
        ok: true, 
        output: data.message || 'Sin respuesta de OpenAI',
        raw: data
      };
    } catch (error: any) {
      return { 
        ok: false, 
        output: `Error de conexión: ${error.message}` 
      };
    }
  }
  
  // DESARROLLO (local): usar backend Node.js en /api/invoke
  if (isDev) {
    try {
      const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const res = await fetch(`/api/invoke/${agentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-token-local-123',
          'X-Route': route,
          'X-Correlation-Id': correlationId,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        return { 
          ok: false, 
          output: `Error backend (${res.status}): ${errorText}` 
        };
      }
      
      const data = await res.json();
      
      // Backend puede devolver: { resp: { output }, echo: { input } }
      const output = data.resp?.output || data.echo?.input || JSON.stringify(data);
      
      return { 
        ok: true, 
        output: output,
        raw: data
      };
    } catch (error: any) {
      return { 
        ok: false, 
        output: `Error al conectar con backend: ${error.message}` 
      };
    }
  }
  
  // Fallback (no debería llegar aquí)
  return { 
    ok: false, 
    output: 'Modo no reconocido (ni dev ni prod)' 
  };
}

export default invokeAgent;
