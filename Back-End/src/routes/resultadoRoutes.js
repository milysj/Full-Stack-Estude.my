import express from "express";
import { registrarResultado } from "../controllers/resultadoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Resultados
 *   description: Rotas relacionadas aos resultados do jogo
 */

/**
 * @swagger
 * /api/resultados:
 *   post:
 *     summary: Registra resultado de uma pergunta individual
 *     description: Registra se o usuário acertou ou errou uma pergunta específica durante o jogo
 *     tags: [Resultados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faseId
 *               - perguntaId
 *               - acertou
 *             properties:
 *               faseId:
 *                 type: string
 *                 description: ID da fase
 *               perguntaId:
 *                 type: number
 *                 description: Índice da pergunta (0-based)
 *               acertou:
 *                 type: boolean
 *                 description: Se o usuário acertou a pergunta
 *     responses:
 *       200:
 *         description: Resultado registrado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Fase não encontrada
 */
router.post("/", verificarToken, registrarResultado);

export default router;

