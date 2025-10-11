const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use(require("./routes/invoke"));
app.use(require("./routes/agent"));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", model: "gpt-4o-mini", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ API Node.js con GPT-4o-mini corriendo en http://localhost:${PORT}`);
});
