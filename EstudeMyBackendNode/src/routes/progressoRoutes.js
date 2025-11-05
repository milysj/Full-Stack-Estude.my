import express from "express";
import {
  salvarResultado,
  salvarResposta,
  verificarProgresso,
  obterProgressoTrilha,
  obterDadosUsuario,
} from "../controllers/progressoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progresso
 *   description: Rotas relacionadas ao progresso do usuário em fases e trilhas
 */

/**
 * @swagger
 * /api/progresso/salvar:
 *   post:
 *     summary: Salva o resultado de uma fase completada
 *     tags: [Progresso]
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
 *               - pontuacao
 *               - totalPerguntas
 *             properties:
 *               faseId:
 *                 type: string
 *               pontuacao:
 *                 type: number
 *               totalPerguntas:
 *                 type: number
 *     responses:
 *       201:
 *         description: Resultado salvo com sucesso
 *       400:
 *         description: Dados inválidos ou fase já completada
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/salvar", verificarToken, salvarResultado);

/**
 * @swagger
 * /api/progresso/salvar-resposta:
 *   post:
 *     summary: Salva uma resposta individual de uma pergunta
 *     description: Salva a resposta de uma pergunta específica durante o progresso de uma fase
 *     tags: [Progresso]
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
 *               - resposta
 *               - acertou
 *             properties:
 *               faseId:
 *                 type: string
 *                 description: ID da fase
 *                 example: "671f23a8bc12ab3456f90e12"
 *               perguntaId:
 *                 type: string
 *                 description: ID da pergunta
 *                 example: "671f23a8bc12ab3456f90e13"
 *               resposta:
 *                 type: string
 *                 description: Resposta fornecida pelo usuário
 *                 example: "Resposta A"
 *               acertou:
 *                 type: boolean
 *                 description: Indica se a resposta está correta
 *                 example: true
 *     responses:
 *       201:
 *         description: Resposta salva com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/salvar-resposta", verificarToken, salvarResposta);

/**
 * @swagger
 * /api/progresso/verificar/{faseId}:
 *   get:
 *     summary: Verifica se o usuário já completou uma fase
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status do progresso retornado
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/verificar/:faseId", verificarToken, verificarProgresso);

/**
 * @swagger
 * /api/progresso/trilha/{trilhaId}:
 *   get:
 *     summary: Obtém o progresso de todas as fases de uma trilha
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Progresso das fases retornado com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/trilha/:trilhaId", verificarToken, obterProgressoTrilha);

/**
 * @swagger
 * /api/progresso/usuario:
 *   get:
 *     summary: Obtém dados do usuário com nível e XP calculados
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/usuario", verificarToken, obterDadosUsuario);

export default router;

