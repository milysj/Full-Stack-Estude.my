import Progresso from "../models/progresso.js";
import Fase from "../models/fase.js";

/**
 * Registra resultado de uma pergunta individual
 * Este endpoint é usado pelo jogo para registrar respostas individuais
 */
export const registrarResultado = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, perguntaId, acertou } = req.body;

    // Validação
    if (!faseId || perguntaId === undefined || acertou === undefined) {
      return res.status(400).json({
        message: "faseId, perguntaId e acertou são obrigatórios",
      });
    }

    // Buscar fase
    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Buscar ou criar progresso
    let progresso = await Progresso.findOne({
      userId,
      faseId,
    });

    if (!progresso) {
      // Criar novo progresso parcial
      progresso = await Progresso.create({
        userId,
        faseId,
        trilhaId: fase.trilhaId,
        pontuacao: 0,
        totalPerguntas: fase.perguntas?.length || 0,
        porcentagemAcertos: 0,
        xpGanho: 0,
        concluido: false,
        respostasUsuario: [],
        perguntasRespondidas: [],
      });
    }

    // Atualizar resposta específica
    const respostasArray = [...(progresso.respostasUsuario || [])];
    const perguntasRespondidas = [...(progresso.perguntasRespondidas || [])];

    // Garantir que o array tenha tamanho suficiente
    while (respostasArray.length <= perguntaId) {
      respostasArray.push(-1);
    }

    // Atualizar resposta (0 = errado, 1 = certo, -1 = não respondido)
    respostasArray[perguntaId] = acertou ? 1 : 0;

    // Adicionar à lista de perguntas respondidas se ainda não estiver
    if (!perguntasRespondidas.includes(perguntaId)) {
      perguntasRespondidas.push(perguntaId);
    }

    // Recalcular pontuação
    const pontuacao = respostasArray.filter((r) => r === 1).length;
    const totalPerguntas = fase.perguntas?.length || respostasArray.length;
    const porcentagemAcertos = totalPerguntas > 0
      ? Math.round((pontuacao / totalPerguntas) * 100)
      : 0;

    // Atualizar progresso
    progresso.respostasUsuario = respostasArray;
    progresso.perguntasRespondidas = perguntasRespondidas;
    progresso.pontuacao = pontuacao;
    progresso.totalPerguntas = totalPerguntas;
    progresso.porcentagemAcertos = porcentagemAcertos;

    await progresso.save();

    return res.status(200).json({
      message: "Resultado registrado com sucesso",
      progresso: {
        pontuacao,
        totalPerguntas,
        porcentagemAcertos,
        respostasUsuario: respostasArray,
      },
    });
  } catch (error) {
    console.error("Erro ao registrar resultado:", error);
    return res.status(500).json({
      message: "Erro ao registrar resultado",
      error: error.message,
    });
  }
};

