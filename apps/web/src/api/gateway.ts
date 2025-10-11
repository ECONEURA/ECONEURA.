/**
 * Gateway API Client
 * Connects to Python Gateway on port 8080
 */

const GATEWAY_URL = '/api' // Proxied by Vite to http://localhost:8080

export interface InvokeRequest {
  input: {
    message: string
  }
  user_id: string
  correlation_id: string
}

export interface InvokeResponse {
  output?: string
  error?: string
  agent_id?: string
  status_code?: number
  detail?: string
}

/**
 * Invoca un agente a través del gateway
 */
export async function invokeAgent(agentId: string, message: string): Promise<InvokeResponse> {
  const correlationId = `web-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  
  const payload: InvokeRequest = {
    input: {
      message
    },
    user_id: 'web-user',
    correlation_id: correlationId
  }

  try {
    const response = await fetch(`${GATEWAY_URL}/invoke/${agentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }))
      throw new Error(errorData.error || errorData.detail || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data

  } catch (error: any) {
    console.error('Error invoking agent:', error)
    throw error
  }
}

/**
 * Verifica el estado del gateway
 */
export async function checkHealth(): Promise<any> {
  try {
    const response = await fetch(`${GATEWAY_URL}/health`)
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error('Gateway health check failed:', error)
    throw error
  }
}
