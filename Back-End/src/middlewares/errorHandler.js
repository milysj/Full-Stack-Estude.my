// src/middlewares/errorHandler.js

export const errorHandler = (err, req, res, next) => {
  console.error("🔥 Erro:", err);

  // Erros com código HTTP definido manualmente em controllers
  const statusCode = err.statusCode || 500;

  // Tratamento de erros de validação do Mongoose
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Erro de validação dos dados",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  // Erros de token JWT (autenticação)
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Token inválido" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expirado" });
  }

  // Caso padrão: erro interno genérico
  res.status(statusCode).json({
    message: err.message || "Erro interno no servidor",
  });
};
