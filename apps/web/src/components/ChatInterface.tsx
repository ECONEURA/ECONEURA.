import { useState } from 'react'
import { Agent } from '../EconeuraCockpit'
import MessageList from './MessageList'
import { invokeAgent } from '../api/gateway'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  agent: Agent
}

export default function ChatInterface({ agent }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await invokeAgent(agent.id, input)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.output || response.error || 'Sin respuesta del agente',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message || 'Error al comunicarse con el agente')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Error: ${err.message || 'No se pudo conectar con el agente'}`,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setError(null)
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg flex flex-col h-[calc(100vh-200px)]">
      {/* Agent Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {agent.title}
            </h2>
            <p className="text-sm text-gray-400">
              {agent.desc}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <button
                onClick={handleClear}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border-t border-red-800">
          <div className="text-sm text-red-200">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Escribe tu mensaje para ${agent.title}...`}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳' : '📤'} Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
