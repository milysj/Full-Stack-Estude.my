import Progresso from "../models/progresso.js";
import User from "../models/user.js";
import mongoose from "mongoose";
import { calcularNivel } from "./progressoController.js";

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
    // Buscar todos os usuários com XP
    const usuarios = await User.find({
      xpTotal: { $exists: true, $gte: 0 }
    }).select("nome username personagem fotoPerfil xpTotal");

    // Calcular nível para cada usuário e ordenar
    const rankingComNivel = usuarios
      .map((usuario) => {
        const xpTotal = usuario.xpTotal || 0;
        const dadosNivel = calcularNivel(xpTotal);
        
        return {
          _id: usuario._id ? usuario._id.toString() : null,
          name: usuario.username || usuario.nome || "Usuário",
          initial: (usuario.username || usuario.nome || "U").charAt(0).toUpperCase(),
          personagem: usuario.personagem || "",
          fotoPerfil: usuario.fotoPerfil || "",
          xpTotal: xpTotal,
          nivel: dadosNivel.nivel,
          xpAtual: dadosNivel.xpAtual,
          xpNecessario: dadosNivel.xpNecessario,
        };
      })
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

