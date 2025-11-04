import express from "express";
import {
  adicionarXP,
  obterScoreUsuario,
  obterScoreUsuarios,
  calcularXPFromPercentage,
} from "../controllers/scoreController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Score
 *   description: Rotas relacionadas ao sistema de pontuação, XP e níveis
 */

/**
 * @swagger
 * /api/score/adicionar-xp:
 *   post:
 *     summary: Adiciona XP ao usuário e recalcula nível
 *     tags: [Score]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - xpGanho
 *             properties:
 *               xpGanho:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: XP adicionado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/adicionar-xp", verificarToken, adicionarXP);

/**
 * @swagger
 * /api/score/usuario:
 *   get:
 *     summary: Obtém dados de score do usuário (XP e nível)
 *     tags: [Score]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de score retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/usuario", verificarToken, obterScoreUsuario);

/**
 * @swagger
 * /api/score/usuarios:
 *   post:
 *     summary: Obtém dados de score de múltiplos usuários (para ranking)
 *     tags: [Score]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Dados de scores retornados com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/usuarios", verificarToken, obterScoreUsuarios);

/**
 * @swagger
 * /api/score/calcular-xp:
 *   post:
 *     summary: Calcula XP baseado em porcentagem de acertos
 *     tags: [Score]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - porcentagemAcertos
 *             properties:
 *               porcentagemAcertos:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: XP calculado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/calcular-xp", verificarToken, calcularXPFromPercentage);

export default router;

