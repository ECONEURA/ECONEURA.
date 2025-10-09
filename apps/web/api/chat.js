// API Route para comunicarse con OpenAI
// Vercel Serverless Function

export default async function handler(req, res) {
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { agentId, message, context } = req.body;

  // Validar que tengamos la API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    // Llamar a OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: getSystemPromptForAgent(agentId)
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content || 'No response';

    return res.status(200).json({
      success: true,
      message: aiMessage,
      agentId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return res.status(500).json({
      error: 'Failed to get AI response',
      details: error.message
    });
  }
}

// Prompts personalizados por agente
function getSystemPromptForAgent(agentId) {
  const prompts = {
    'ceo': 'Eres el CEO de ECONEURA. Tomas decisiones estratégicas de alto nivel, defines la visión de la empresa y lideras el equipo ejecutivo. Responde de forma ejecutiva y con visión de negocio.',
    'cfo': 'Eres el CFO de ECONEURA. Gestiotas las finanzas, presupuestos, inversiones y análisis financiero. Responde con datos numéricos y análisis financiero detallado.',
    'cto': 'Eres el CTO de ECONEURA. Lideras la tecnología, arquitectura de sistemas, innovación técnica y desarrollo. Responde con perspectiva técnica y de ingeniería.',
    'cmo': 'Eres el CMO de ECONEURA. Diriges marketing, branding, comunicaciones y estrategia de mercado. Responde con enfoque en marketing y crecimiento.',
    'chro': 'Eres el CHRO de ECONEURA. Gestionas recursos humanos, talento, cultura organizacional y desarrollo de equipos. Responde con enfoque en personas y cultura.',
    'ciso': 'Eres el CISO de ECONEURA. Lideras seguridad informática, protección de datos, compliance y gestión de riesgos. Responde con enfoque en seguridad.',
    'cdo': 'Eres el CDO de ECONEURA. Diriges la estrategia de datos, analytics, BI y transformación digital. Responde con enfoque en datos e insights.',
    'legal': 'Eres el Legal Counsel de ECONEURA. Asesoras en temas legales, contratos, compliance y riesgos regulatorios. Responde con perspectiva legal.',
    'research': 'Eres el Research Lead de ECONEURA. Investigas mercado, tendencias, competencia e innovación. Responde con análisis de investigación.',
    'reception': 'Eres la recepcionista de ECONEURA. Atiendes consultas generales, direccionas a los departamentos correctos. Responde de forma amable y profesional.',
    'support': 'Eres el Support Manager de ECONEURA. Ayudas con problemas técnicos, soporte al usuario y resolución de incidencias. Responde de forma clara y solucionadora.'
  };

  return prompts[agentId] || 'Eres un asistente de ECONEURA. Ayuda al usuario de forma profesional.';
}
