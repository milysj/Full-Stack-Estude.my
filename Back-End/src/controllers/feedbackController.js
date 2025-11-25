import Feedback from "../models/feedback.js";

/**
 * Cria um novo feedback
 */
export const criarFeedback = async (req, res) => {
  try {
    const { tipo, avaliacao, sugestao } = req.body;
    const userId = req.user?._id || null; // Permite feedback anônimo

    // Validação
    if (!tipo || !avaliacao) {
      return res.status(400).json({
        message: "Tipo e avaliação são obrigatórios",
      });
    }

    if (!["bug", "suggestion", "doubt", "praise", "other"].includes(tipo)) {
      return res.status(400).json({
        message: "Tipo de feedback inválido",
      });
    }

    if (avaliacao < 1 || avaliacao > 5) {
      return res.status(400).json({
        message: "Avaliação deve ser entre 1 e 5",
      });
    }

    // Criar feedback
    const feedback = await Feedback.create({
      usuario: userId,
      tipo,
      avaliacao,
      sugestao: sugestao || "",
      data: new Date(),
    });

    return res.status(201).json({
      message: "Feedback enviado com sucesso!",
      feedback: {
        _id: feedback._id,
        tipo: feedback.tipo,
        avaliacao: feedback.avaliacao,
        sugestao: feedback.sugestao,
        data: feedback.data,
      },
    });
  } catch (error) {
    console.error("Erro ao criar feedback:", error);
    return res.status(500).json({
      message: "Erro ao enviar feedback",
      error: error.message,
    });
  }
};

/**
 * Lista todos os feedbacks (apenas para administradores)
 */
export const listarFeedbacks = async (req, res) => {
  try {
    // Verificar se é administrador
    if (req.user?.tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Apenas administradores podem ver feedbacks.",
      });
    }

    const feedbacks = await Feedback.find()
      .populate("usuario", "nome email username")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      feedbacks,
    });
  } catch (error) {
    console.error("Erro ao listar feedbacks:", error);
    return res.status(500).json({
      message: "Erro ao listar feedbacks",
      error: error.message,
    });
  }
};

