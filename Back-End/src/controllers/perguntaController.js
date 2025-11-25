import Fase from "../models/fase.js";
import { verificarToken, verificarProfessor } from "../middlewares/authMiddleware.js";

/**
 * Lista perguntas de uma fase
 */
export const listarPerguntasPorFase = async (req, res) => {
  try {
    const { faseId } = req.params;

    if (!faseId) {
      return res.status(400).json({ message: "ID da fase é obrigatório" });
    }

    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Retorna as perguntas da fase
    return res.status(200).json(fase.perguntas || []);
  } catch (error) {
    console.error("Erro ao listar perguntas:", error);
    return res.status(500).json({
      message: "Erro ao listar perguntas",
      error: error.message,
    });
  }
};

/**
 * Cria uma nova pergunta em uma fase
 */
export const criarPergunta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, enunciado, alternativas, respostaCorreta } = req.body;

    // Validação
    if (!faseId || !enunciado || !alternativas || respostaCorreta === undefined) {
      return res.status(400).json({
        message: "faseId, enunciado, alternativas e respostaCorreta são obrigatórios",
      });
    }

    if (!Array.isArray(alternativas) || alternativas.length < 2) {
      return res.status(400).json({
        message: "Alternativas deve ser um array com pelo menos 2 opções",
      });
    }

    if (respostaCorreta < 0 || respostaCorreta >= alternativas.length) {
      return res.status(400).json({
        message: "respostaCorreta deve ser um índice válido do array alternativas",
      });
    }

    // Buscar fase
    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Verificar se o usuário é o criador da trilha ou administrador
    const Trilha = (await import("../models/trilha.js")).default;
    const trilha = await Trilha.findById(fase.trilhaId);
    
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    if (trilha.usuario.toString() !== userId.toString() && req.user.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Apenas o criador da trilha ou administradores podem adicionar perguntas.",
      });
    }

    // Criar nova pergunta (respostaCorreta deve ser string conforme o schema)
    const novaPergunta = {
      enunciado,
      alternativas,
      respostaCorreta: String(respostaCorreta),
    };

    // Adicionar pergunta à fase
    if (!fase.perguntas) {
      fase.perguntas = [];
    }
    fase.perguntas.push(novaPergunta);
    await fase.save();

    return res.status(201).json({
      message: "Pergunta criada com sucesso",
      pergunta: novaPergunta,
      fase: fase,
    });
  } catch (error) {
    console.error("Erro ao criar pergunta:", error);
    return res.status(500).json({
      message: "Erro ao criar pergunta",
      error: error.message,
    });
  }
};

/**
 * Atualiza uma pergunta existente
 */
export const atualizarPergunta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, perguntaIndex } = req.params;
    const { enunciado, alternativas, respostaCorreta } = req.body;

    if (!faseId || perguntaIndex === undefined) {
      return res.status(400).json({
        message: "faseId e perguntaIndex são obrigatórios",
      });
    }

    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Verificar se o usuário é o criador da trilha ou administrador
    const Trilha = (await import("../models/trilha.js")).default;
    const trilha = await Trilha.findById(fase.trilhaId);
    
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    if (trilha.usuario.toString() !== userId.toString() && req.user.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Apenas o criador da trilha ou administradores podem editar perguntas.",
      });
    }

    const index = parseInt(perguntaIndex);
    if (!fase.perguntas || index < 0 || index >= fase.perguntas.length) {
      return res.status(404).json({ message: "Pergunta não encontrada" });
    }

    // Atualizar pergunta
    if (enunciado !== undefined) fase.perguntas[index].enunciado = enunciado;
    if (alternativas !== undefined) {
      if (!Array.isArray(alternativas) || alternativas.length < 2) {
        return res.status(400).json({
          message: "Alternativas deve ser um array com pelo menos 2 opções",
        });
      }
      fase.perguntas[index].alternativas = alternativas;
    }
    if (respostaCorreta !== undefined) {
      const altArray = alternativas || fase.perguntas[index].alternativas;
      const respostaNum = typeof respostaCorreta === 'string' ? parseInt(respostaCorreta) : respostaCorreta;
      if (respostaNum < 0 || respostaNum >= altArray.length) {
        return res.status(400).json({
          message: "respostaCorreta deve ser um índice válido do array alternativas",
        });
      }
      fase.perguntas[index].respostaCorreta = String(respostaCorreta);
    }

    await fase.save();

    return res.status(200).json({
      message: "Pergunta atualizada com sucesso",
      pergunta: fase.perguntas[index],
    });
  } catch (error) {
    console.error("Erro ao atualizar pergunta:", error);
    return res.status(500).json({
      message: "Erro ao atualizar pergunta",
      error: error.message,
    });
  }
};

/**
 * Deleta uma pergunta
 */
export const deletarPergunta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, perguntaIndex } = req.params;

    if (!faseId || perguntaIndex === undefined) {
      return res.status(400).json({
        message: "faseId e perguntaIndex são obrigatórios",
      });
    }

    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Verificar se o usuário é o criador da trilha ou administrador
    const Trilha = (await import("../models/trilha.js")).default;
    const trilha = await Trilha.findById(fase.trilhaId);
    
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    if (trilha.usuario.toString() !== userId.toString() && req.user.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Apenas o criador da trilha ou administradores podem deletar perguntas.",
      });
    }

    const index = parseInt(perguntaIndex);
    if (!fase.perguntas || index < 0 || index >= fase.perguntas.length) {
      return res.status(404).json({ message: "Pergunta não encontrada" });
    }

    // Remover pergunta
    fase.perguntas.splice(index, 1);
    await fase.save();

    return res.status(200).json({
      message: "Pergunta deletada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar pergunta:", error);
    return res.status(500).json({
      message: "Erro ao deletar pergunta",
      error: error.message,
    });
  }
};

