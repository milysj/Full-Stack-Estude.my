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
 *     summary: Adiciona XP ao usuário e recalcula nível automaticamente
 *     description: Adiciona XP ao usuário autenticado e atualiza automaticamente seu nível, XP atual, XP necessário e XP acumulado baseado na fórmula de progressão
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
 *                 description: Quantidade de XP a ser adicionada
 *                 example: 100
 *     responses:
 *       200:
 *         description: XP adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "XP adicionado com sucesso"
 *                 xpGanho:
 *                   type: number
 *                   example: 100
 *                 score:
 *                   $ref: "#/components/schemas/Score"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/adicionar-xp", verificarToken, adicionarXP);

/**
 * @swagger
 * /api/score/usuario:
 *   get:
 *     summary: Obtém dados de score do usuário autenticado (XP e nível)
 *     description: Retorna o XP total, nível atual, XP atual no nível, XP necessário para o próximo nível e XP acumulado do usuário autenticado. Se o usuário não tiver um registro de score, um novo será criado com valores iniciais.
 *     tags: [Score]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados de score retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Score"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/usuario", verificarToken, obterScoreUsuario);

/**
 * @swagger
 * /api/score/usuarios:
 *   post:
 *     summary: Obtém dados de score de múltiplos usuários (para ranking)
 *     description: Retorna os dados de score (XP, nível, etc.) de múltiplos usuários de uma vez. Útil para construir rankings e comparar usuários. Se um usuário não tiver registro de score, retorna valores padrão (XP: 0, Nível: 1).
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
 *                 description: Array de IDs dos usuários
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
 *                 minItems: 1
 *     responses:
 *       200:
 *         description: Dados de scores retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                     example: "507f1f77bcf86cd799439011"
 *                   xpTotal:
 *                     type: number
 *                     example: 1750
 *                   nivel:
 *                     type: number
 *                     example: 5
 *                   xpAtual:
 *                     type: number
 *                     example: 150
 *                   xpNecessario:
 *                     type: number
 *                     example: 200
 *                   xpAcumulado:
 *                     type: number
 *                     example: 1600
 *       400:
 *         description: Dados inválidos (userIds deve ser um array não vazio)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/usuarios", verificarToken, obterScoreUsuarios);

/**
 * @swagger
 * /api/score/calcular-xp:
 *   post:
 *     summary: Calcula XP baseado em porcentagem de acertos
 *     description: Calcula a quantidade de XP que será ganha baseado na porcentagem de acertos em uma fase. A fórmula é: XP = (porcentagemAcertos / 100) * 500. Não adiciona XP ao usuário, apenas calcula o valor.
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
 *                 description: Porcentagem de acertos (0 a 100)
 *                 example: 80
 *     responses:
 *       200:
 *         description: XP calculado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 porcentagemAcertos:
 *                   type: number
 *                   example: 80
 *                 xpGanho:
 *                   type: number
 *                   description: Quantidade de XP que será ganha
 *                   example: 400
 *       400:
 *         description: Dados inválidos (porcentagemAcertos deve ser entre 0 e 100)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/calcular-xp", verificarToken, calcularXPFromPercentage);

export default router;

