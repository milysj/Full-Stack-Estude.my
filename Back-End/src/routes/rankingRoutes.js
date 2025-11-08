import express from "express";
import { obterRanking, obterRankingNivel } from "../controllers/rankingController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Ranking
 *   description: Rotas relacionadas ao ranking de usuários
 */

/**
 * @swagger
 * /api/ranking:
 *   get:
 *     summary: Obtém o ranking de usuários baseado na média de acertos
 *     description: Ranking ordenado por média de acertos (descendente), com desempate por quantidade total de acertos. Retorna apenas os top 10 ALUNOS que completaram pelo menos uma fase. Professores não aparecem no ranking, mas continuam recebendo XP.
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/RankingItem"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", verificarToken, obterRanking);

/**
 * @swagger
 * /api/ranking/nivel:
 *   get:
 *     summary: Obtém o ranking de usuários baseado no nível/XP
 *     description: Ranking ordenado por nível (descendente), com desempate por XP total (descendente). Retorna apenas os top 10 ALUNOS com XP. Professores não aparecem no ranking, mas continuam recebendo XP.
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking de nível retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/RankingNivelItem"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/nivel", verificarToken, obterRankingNivel);

export default router;

