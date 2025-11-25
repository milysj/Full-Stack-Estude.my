import express from "express";
import { criarFeedback, listarFeedbacks } from "../controllers/feedbackController.js";
import { verificarToken, verificarTokenOpcional } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Rotas relacionadas ao feedback dos usuários
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Envia um feedback
 *     description: Cria um novo feedback. Permite feedback anônimo (sem autenticação) ou autenticado.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - avaliacao
 *             properties:
 *               tipo:
 *                 type: string
 *                 enum: [bug, suggestion, doubt, praise, other]
 *                 description: Tipo de feedback
 *                 example: "suggestion"
 *               avaliacao:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Avaliação de 1 a 5 estrelas
 *                 example: 5
 *               sugestao:
 *                 type: string
 *                 description: Texto do feedback/sugestão
 *                 example: "Gostaria de ver mais trilhas de matemática"
 *     responses:
 *       201:
 *         description: Feedback enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback enviado com sucesso!"
 *                 feedback:
 *                   type: object
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post("/", verificarTokenOpcional, criarFeedback);

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Lista todos os feedbacks (apenas administradores)
 *     description: Retorna todos os feedbacks enviados. Apenas administradores podem acessar.
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de feedbacks
 *       403:
 *         description: Acesso negado
 */
router.get("/", verificarToken, listarFeedbacks);

export default router;

