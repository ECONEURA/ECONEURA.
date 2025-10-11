const express = require("express");
const router = express.Router();
const { invokeOpenAIAgent } = require("../services/openaiService");

router.post("/api/invoke/neura-chat", require("../middleware/auth"), async (req, res) => {
  try {
    const { input, stream } = req.body || {};
    const correlationId = req.headers["x-correlation-id"] || "";
    const out = await invokeOpenAIAgent({ text: input, correlationId, stream: !!stream });
    res.json(out);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

module.exports = router;
