import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Acesso negado. Token não fornecido."
      });
    }

    console.log("Token recebido:", req.headers.authorization);  

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id;
    const user = await User.findById(userId).select("-senha");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado."
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`[Auth] Erro na verificação do token: ${error.message}`);

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

/**
 * Middleware para verificar se o usuário é PROFESSOR ou ADMINISTRADOR
 * Deve ser usado APÓS o middleware verificarToken
 */
export const verificarProfessor = async (req, res, next) => {
  try {
    // O usuário já deve estar no req.user pelo middleware verificarToken
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado."
      });
    }

    // Verificar se o usuário é PROFESSOR ou ADMINISTRADOR
    if (req.user.tipoUsuario !== "PROFESSOR" && req.user.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas professores e administradores podem realizar esta ação."
      });
    }

    next();
  } catch (error) {
    console.error(`[Auth] Erro na verificação de professor: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar permissões."
    });
  }
};

/**
 * Middleware para verificar se o usuário é ADMINISTRADOR
 * Deve ser usado APÓS o middleware verificarToken
 */
export const verificarAdministrador = async (req, res, next) => {
  try {
    // O usuário já deve estar no req.user pelo middleware verificarToken
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Usuário não autenticado."
      });
    }

    // Verificar se o usuário é ADMINISTRADOR
    if (req.user.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        success: false,
        message: "Acesso negado. Apenas administradores podem realizar esta ação."
      });
    }

    next();
  } catch (error) {
    console.error(`[Auth] Erro na verificação de administrador: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: "Erro ao verificar permissões."
    });
  }
};
