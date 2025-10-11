// Middleware de autenticación simple
module.exports = (req, res, next) => {
  const auth = req.headers.authorization || "";
  // En desarrollo acepta "Bearer DEV", en producción validar token real
  if (auth === "Bearer DEV" || process.env.NODE_ENV === "development") {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
};
