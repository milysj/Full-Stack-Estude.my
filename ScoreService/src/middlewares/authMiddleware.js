import jwt from "jsonwebtoken";

/**
 * Middleware simplificado para validar JWT
 * O microsserviço SCORE não precisa do modelo User completo,
 * apenas valida o token e extrai o userId
 */
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acesso negado. Token não fornecido."
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extrair userId do token decodificado
    const userId = decoded.id || decoded._id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token inválido. userId não encontrado."
      });
    }

    // Adicionar userId ao request (garantir que seja string)
    req.userId = userId.toString();
    next();
  } catch (error) {
    console.error(`[SCORE Auth] Erro na verificação do token: ${error.message}`);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado. Faça login novamente."
      });
    }

    return res.status(401).json({
      success: false,
      message: "Token inválido."
    });
  }
};

