const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// Cargar configuración de agentes
const agentsConfigPath = path.join(__dirname, "../config/agents.json");
let agentsConfig = { makeAgents: {}, openaiAgents: {} };

try {
  if (fs.existsSync(agentsConfigPath)) {
    agentsConfig = JSON.parse(fs.readFileSync(agentsConfigPath, "utf8"));
  }
} catch (error) {
  console.error("⚠️  Error cargando agents.json:", error.message);
}

/**
 * POST /api/agent/execute
 * Ejecuta un agente enviando datos a su webhook de Make.com
 */
router.post("/api/agent/execute", require("../middleware/auth"), async (req, res) => {
  try {
    const { agent_id, department, action = "execute", parameters = {} } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: "agent_id es requerido" });
    }

    // Buscar webhook del agente
    const agentConfig = agentsConfig.makeAgents[agent_id];
    
    if (!agentConfig || !agentConfig.webhookUrl) {
      return res.status(404).json({ 
        error: `Agente ${agent_id} no encontrado o sin webhook configurado` 
      });
    }

    if (agentConfig.webhookUrl.includes("REEMPLAZA")) {
      return res.status(503).json({ 
        error: `Webhook del agente ${agent_id} no configurado. Edita config/agents.json` 
      });
    }

    // Preparar payload para Make.com
    const payload = {
      agent_id,
      department: department || agent_id.split("-")[1]?.toUpperCase(),
      action,
      timestamp: new Date().toISOString(),
      correlation_id: req.headers["x-correlation-id"] || `exec-${Date.now()}`,
      parameters
    };

    console.log(`🚀 Ejecutando agente ${agent_id} → ${agentConfig.webhookUrl}`);

    // Llamar al webhook de Make.com
    const fetch = (await import("node-fetch")).default;
    const response = await fetch(agentConfig.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      timeout: 10000 // 10 segundos
    });

    if (!response.ok) {
      throw new Error(`Make.com respondió con status ${response.status}`);
    }

    const result = await response.json().catch(() => ({ status: "accepted" }));

    res.json({
      success: true,
      agent_id,
      webhook_url: agentConfig.webhookUrl,
      make_response: result,
      timestamp: payload.timestamp
    });

  } catch (error) {
    console.error("❌ Error ejecutando agente:", error);
    res.status(500).json({ 
      error: "Error ejecutando agente", 
      message: error.message 
    });
  }
});

/**
 * GET /api/agent/list
 * Lista todos los agentes configurados
 */
router.get("/api/agent/list", require("../middleware/auth"), (req, res) => {
  const agents = Object.keys(agentsConfig.makeAgents).map(id => ({
    id,
    configured: !agentsConfig.makeAgents[id].webhookUrl.includes("REEMPLAZA"),
    webhookUrl: agentsConfig.makeAgents[id].webhookUrl
  }));

  res.json({
    total: agents.length,
    configured: agents.filter(a => a.configured).length,
    agents
  });
});

module.exports = router;
