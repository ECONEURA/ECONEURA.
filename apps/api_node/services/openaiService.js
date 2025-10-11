const OpenAI = require("openai");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function invokeOpenAIAgent({ text, correlationId, stream = false }) {
  // Usar API estándar de chat completions con gpt-4o-mini (gratuito en tier free)
  const req = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: String(text || "") }],
    temperature: 0.7,
    max_tokens: 1000
  };

  if (!stream) {
    const response = await client.chat.completions.create(req);
    return { 
      output: response.choices[0]?.message?.content || "", 
      model: response.model, 
      id: response.id 
    };
  }

  // Streaming support
  const streamResponse = await client.chat.completions.create({
    ...req,
    stream: true
  });
  
  let out = "";
  for await (const chunk of streamResponse) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) out += content;
  }
  return { output: out };
}

module.exports = { invokeOpenAIAgent };
