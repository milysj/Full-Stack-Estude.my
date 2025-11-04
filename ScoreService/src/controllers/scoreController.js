import Score from "../models/score.js";
import mongoose from "mongoose";

/**
 * Função para calcular XP ganho baseado na porcentagem de acertos
 * 100% = 500 XP, 0% = 0 XP (progressão linear)
 */
export const calcularXP = (porcentagemAcertos) => {
  return Math.round((porcentagemAcertos / 100) * 500);
};

/**
 * Função para calcular nível baseado em XP total
 * Nível 1: precisa de 100 XP total (0-100)
 * Nível 2: precisa de 210 XP total (100-210)
 * Nível 3: precisa de 441 XP total (210-441)
 * Fórmula: nível N precisa de XP_total = XP_nível_anterior + (XP_nível_anterior * 0.1) + 100
 */
export const calcularNivel = (xpTotal) => {
  if (xpTotal < 0) xpTotal = 0;
  
  let nivel = 1;
  let xpParaProximoNivel = 100; // XP necessário para passar do nível 1 ao 2
  let xpAcumuladoAteNivelAtual = 0; // XP total acumulado até alcançar o nível atual

  // Para alcançar o nível 1: precisa de 0 XP (já está no nível 1)
  // Para alcançar o nível 2: precisa de 100 XP total
  // Para alcançar o nível 3: precisa de 210 XP total (100 + 100*1.1)
  // Para alcançar o nível 4: precisa de 441 XP total (210 + 210*1.1)

  // Calcular qual nível o usuário alcançou
  while (xpTotal >= xpAcumuladoAteNivelAtual + xpParaProximoNivel) {
    xpAcumuladoAteNivelAtual += xpParaProximoNivel;
    xpParaProximoNivel = Math.round(100 + xpParaProximoNivel * 1.1);
    nivel++;
  }

  // xpAtual é o XP que o usuário tem no nível atual
  const xpAtual = xpTotal - xpAcumuladoAteNivelAtual;

  return {
    nivel,
    xpAtual,
    xpNecessario: xpParaProximoNivel,
    xpAcumulado: xpAcumuladoAteNivelAtual,
  };
};

/**
 * Adiciona XP ao usuário e recalcula nível
 * Endpoint: POST /api/score/adicionar-xp
 */
export const adicionarXP = async (req, res) => {
  try {
    const userId = req.userId;
    const { xpGanho } = req.body;

    if (xpGanho === undefined || xpGanho < 0) {
      return res.status(400).json({
        message: "xpGanho é obrigatório e deve ser maior ou igual a 0",
      });
    }

    // Converter userId para ObjectId se necessário
    const userIdObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Buscar ou criar score do usuário
    let score = await Score.findOne({ userId: userIdObjectId });

    if (!score) {
      // Criar novo registro de score
      score = await Score.create({
        userId: userIdObjectId,
        xpTotal: xpGanho,
      });
    } else {
      // Adicionar XP ao total existente
      score.xpTotal = (score.xpTotal || 0) + xpGanho;
    }

    // Recalcular nível e dados relacionados
    const dadosNivel = calcularNivel(score.xpTotal);
    score.nivel = dadosNivel.nivel;
    score.xpAtual = dadosNivel.xpAtual;
    score.xpNecessario = dadosNivel.xpNecessario;
    score.xpAcumulado = dadosNivel.xpAcumulado;

    await score.save();

    res.status(200).json({
      message: "XP adicionado com sucesso",
      xpGanho,
      score: {
        xpTotal: score.xpTotal,
        nivel: score.nivel,
        xpAtual: score.xpAtual,
        xpNecessario: score.xpNecessario,
        xpAcumulado: score.xpAcumulado,
      },
    });
  } catch (error) {
    console.error("[SCORE] Erro ao adicionar XP:", error);
    res.status(500).json({
      message: "Erro ao adicionar XP",
      error: error.message,
    });
  }
};

/**
 * Obtém dados de score do usuário (XP e nível)
 * Endpoint: GET /api/score/usuario
 */
export const obterScoreUsuario = async (req, res) => {
  try {
    const userId = req.userId;

    // Converter userId para ObjectId se necessário
    const userIdObjectId = typeof userId === 'string' 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    let score = await Score.findOne({ userId: userIdObjectId });

    if (!score) {
      // Criar score inicial se não existir
      score = await Score.create({
        userId: userIdObjectId,
        xpTotal: 0,
      });
      // Recalcular dados do nível
      const dadosNivel = calcularNivel(0);
      score.nivel = dadosNivel.nivel;
      score.xpAtual = dadosNivel.xpAtual;
      score.xpNecessario = dadosNivel.xpNecessario;
      score.xpAcumulado = dadosNivel.xpAcumulado;
      await score.save();
    } else {
      // Recalcular para garantir que está atualizado
      const dadosNivel = calcularNivel(score.xpTotal);
      // Atualizar apenas se houver diferença (para evitar writes desnecessários)
      if (
        score.nivel !== dadosNivel.nivel ||
        score.xpAtual !== dadosNivel.xpAtual ||
        score.xpNecessario !== dadosNivel.xpNecessario ||
        score.xpAcumulado !== dadosNivel.xpAcumulado
      ) {
        score.nivel = dadosNivel.nivel;
        score.xpAtual = dadosNivel.xpAtual;
        score.xpNecessario = dadosNivel.xpNecessario;
        score.xpAcumulado = dadosNivel.xpAcumulado;
        await score.save();
      }
    }

    res.json({
      xpTotal: score.xpTotal,
      nivel: score.nivel,
      xpAtual: score.xpAtual,
      xpNecessario: score.xpNecessario,
      xpAcumulado: score.xpAcumulado,
    });
  } catch (error) {
    console.error("[SCORE] Erro ao obter score do usuário:", error);
    res.status(500).json({
      message: "Erro ao obter score do usuário",
      error: error.message,
    });
  }
};

/**
 * Obtém dados de score de múltiplos usuários (para ranking)
 * Endpoint: POST /api/score/usuarios
 */
export const obterScoreUsuarios = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "userIds deve ser um array não vazio",
      });
    }

    const scores = await Score.find({
      userId: { $in: userIds },
    });

    // Preencher com score inicial para usuários que não têm registro
    const scoresMap = new Map();
    scores.forEach((score) => {
      scoresMap.set(score.userId.toString(), score);
    });

    const resultados = userIds.map((userId) => {
      const score = scoresMap.get(userId.toString());
      if (score) {
        // Recalcular para garantir que está atualizado
        const dadosNivel = calcularNivel(score.xpTotal);
        return {
          userId: score.userId,
          xpTotal: score.xpTotal,
          nivel: dadosNivel.nivel,
          xpAtual: dadosNivel.xpAtual,
          xpNecessario: dadosNivel.xpNecessario,
          xpAcumulado: dadosNivel.xpAcumulado,
        };
      } else {
        // Retornar score inicial para usuários sem registro
        const dadosNivel = calcularNivel(0);
        return {
          userId,
          xpTotal: 0,
          nivel: dadosNivel.nivel,
          xpAtual: dadosNivel.xpAtual,
          xpNecessario: dadosNivel.xpNecessario,
          xpAcumulado: dadosNivel.xpAcumulado,
        };
      }
    });

    res.json(resultados);
  } catch (error) {
    console.error("[SCORE] Erro ao obter scores de usuários:", error);
    res.status(500).json({
      message: "Erro ao obter scores de usuários",
      error: error.message,
    });
  }
};

/**
 * Calcula XP baseado em porcentagem de acertos
 * Endpoint: POST /api/score/calcular-xp
 */
export const calcularXPFromPercentage = async (req, res) => {
  try {
    const { porcentagemAcertos } = req.body;

    if (porcentagemAcertos === undefined || porcentagemAcertos < 0 || porcentagemAcertos > 100) {
      return res.status(400).json({
        message: "porcentagemAcertos deve ser um número entre 0 e 100",
      });
    }

    const xpGanho = calcularXP(porcentagemAcertos);

    res.json({
      porcentagemAcertos,
      xpGanho,
    });
  } catch (error) {
    console.error("[SCORE] Erro ao calcular XP:", error);
    res.status(500).json({
      message: "Erro ao calcular XP",
      error: error.message,
    });
  }
};

// Funções utilitárias já estão exportadas inline acima:
// - calcularXP (linha 7)
// - calcularNivel (linha 18)

