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
 *     description: Ranking ordenado por média de acertos (descendente), com desempate por quantidade total de acertos
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
 *                 type: object
 *                 properties:
 *                   position:
 *                     type: number
 *                   name:
 *                     type: string
 *                   totalFases:
 *                     type: number
 *                   totalAcertos:
 *                     type: number
 *                   mediaAcertos:
 *                     type: number
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, obterRanking);
router.get("/nivel", verificarToken, obterRankingNivel);

export default router;

