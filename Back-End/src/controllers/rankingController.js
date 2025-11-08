import Progresso from "../models/progresso.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// URL do microsserviço SCORE
const SCORE_SERVICE_URL = process.env.SCORE_SERVICE_URL || "http://localhost:5001";

/**
 * Função helper para chamar o microsserviço SCORE
 * Retorna null se o serviço não estiver disponível (não lança erro)
 */
const chamarScoreService = async (endpoint, method = "GET", body = null, token = null) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    };

    if (token) {
      // Se o token já contém "Bearer ", usar diretamente, senão adicionar
      if (token.startsWith("Bearer ")) {
        options.headers.Authorization = token;
      } else {
        options.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${SCORE_SERVICE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SCORE Service] Erro HTTP ${response.status} em ${endpoint}:`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Não lançar erro, apenas logar e retornar null
    if (error.name === "AbortError" || error.code === "ECONNREFUSED" || error.message.includes("fetch failed")) {
      console.warn(`[SCORE Service] Microsserviço não disponível (${SCORE_SERVICE_URL}). Sistema continuará funcionando sem atualização de XP.`);
    } else {
      console.error(`[SCORE Service] Erro ao chamar ${endpoint}:`, error.message);
    }
    return null;
  }
};

// Obter ranking de usuários baseado na média de acertos
// Critério de desempate: quantidade total de acertos
export const obterRanking = async (req, res) => {
  try {
    // Agregar dados de progresso por usuário
    const ranking = await Progresso.aggregate([
      {
        $group: {
          _id: "$userId",
          totalFases: { $sum: 1 },
          totalAcertos: { $sum: "$pontuacao" },
          totalPerguntas: { $sum: "$totalPerguntas" },
          porcentagens: { $push: "$porcentagemAcertos" },
        },
      },
      {
        $addFields: {
          // Calcular média de acertos
          mediaAcertos: {
            $cond: {
              if: { $gt: ["$totalFases", 0] },
              then: {
                $divide: [
                  {
                    $reduce: {
                      input: "$porcentagens",
                      initialValue: 0,
                      in: { $add: ["$$value", "$$this"] },
                    },
                  },
                  "$totalFases",
                ],
              },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "usuario",
        },
      },
      {
        $unwind: {
          path: "$usuario",
          preserveNullAndEmptyArrays: false, // Apenas usuários válidos
        },
      },
      {
        // Filtrar apenas usuários que têm pelo menos uma fase completada
        $match: {
          totalFases: { $gt: 0 },
        },
      },
      {
        $project: {
          _id: 1,
          nome: "$usuario.nome",
          username: "$usuario.username",
          personagem: "$usuario.personagem",
          fotoPerfil: "$usuario.fotoPerfil",
          totalFases: 1,
          totalAcertos: 1,
          totalPerguntas: 1,
          mediaAcertos: { $round: ["$mediaAcertos", 2] },
        },
      },
      {
        // Ordenar por média de acertos (desc), depois por total de acertos (desc)
        $sort: {
          mediaAcertos: -1,
          totalAcertos: -1,
        },
      },
    ]);

    // Adicionar posição no ranking e limitar a top 10
    const rankingComPosicao = ranking
      .slice(0, 10)
      .map((item, index) => ({
        position: index + 1,
        _id: item._id ? item._id.toString() : null,
        name: item.username || item.nome || "Usuário",
        initial: (item.username || item.nome || "U").charAt(0).toUpperCase(),
        totalFases: item.totalFases || 0,
        totalAcertos: item.totalAcertos || 0,
        totalPerguntas: item.totalPerguntas || 0,
        mediaAcertos: item.mediaAcertos || 0,
        personagem: item.personagem || "",
        fotoPerfil: item.fotoPerfil || "",
      }));

    res.json(rankingComPosicao);
  } catch (error) {
    console.error("Erro ao obter ranking:", error);
    res.status(500).json({ message: "Erro ao obter ranking", error: error.message });
  }
};

// Obter ranking de usuários baseado no nível/XP
export const obterRankingNivel = async (req, res) => {
  try {
    // Buscar todos os usuários (agora não filtramos por xpTotal, pois está no microsserviço)
    const usuarios = await User.find({}).select("nome username personagem fotoPerfil");

    if (usuarios.length === 0) {
      return res.json([]);
    }

    // Buscar scores de todos os usuários do microsserviço SCORE
    const authHeader = req.headers.authorization;
    const userIds = usuarios.map((u) => u._id.toString());
    const scoresData = await chamarScoreService(
      "/api/score/usuarios",
      "POST",
      { userIds },
      authHeader
    ) || [];

    // Criar mapa de scores por userId
    const scoresMap = new Map();
    if (Array.isArray(scoresData)) {
      scoresData.forEach((score) => {
        scoresMap.set(score.userId.toString(), score);
      });
    }

    // Combinar dados de usuários com scores
    const rankingComNivel = usuarios
      .map((usuario) => {
        const score = scoresMap.get(usuario._id.toString()) || {
          xpTotal: 0,
          nivel: 1,
          xpAtual: 0,
          xpNecessario: 100,
        };

        return {
          _id: usuario._id ? usuario._id.toString() : null,
          name: usuario.username || usuario.nome || "Usuário",
          initial: (usuario.username || usuario.nome || "U").charAt(0).toUpperCase(),
          personagem: usuario.personagem || "",
          fotoPerfil: usuario.fotoPerfil || "",
          xpTotal: score.xpTotal || 0,
          nivel: score.nivel || 1,
          xpAtual: score.xpAtual || 0,
          xpNecessario: score.xpNecessario || 100,
        };
      })
      .filter((item) => item.xpTotal > 0) // Filtrar apenas usuários com XP
      .sort((a, b) => {
        // Ordenar por nível (desc), depois por XP total (desc)
        if (b.nivel !== a.nivel) {
          return b.nivel - a.nivel;
        }
        return b.xpTotal - a.xpTotal;
      });

    // Adicionar posição no ranking e limitar a top 10
    const rankingComPosicao = rankingComNivel
      .slice(0, 10)
      .map((item, index) => ({
        position: index + 1,
        ...item,
      }));

    res.json(rankingComPosicao);
  } catch (error) {
    console.error("Erro ao obter ranking de nível:", error);
    res.status(500).json({ message: "Erro ao obter ranking de nível", error: error.message });
  }
};

