// src/routes/trilhaRoutes.js
import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  criarTrilha,
  listarTrilhas,
  atualizarTrilha,
  deletarTrilha,
  trilhasNovidades,
  trilhasPopulares,
  trilhasContinue,
  iniciarTrilha,
} from "../controllers/trilhaController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trilhas
 *   description: Gerenciamento de trilhas criadas por usuários (CRUD + seções da Home)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/trilhas:
 *   post:
 *     summary: Cria uma nova trilha
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - materia
 *               - faseSelecionada
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "Matemática"
 *               descricao:
 *                 type: string
 *                 example: "Trilha introdutória sobre fundamentos da matemática."
 *               materia:
 *                 type: string
 *                 example: "Matemática"
 *               dificuldade:
 *                 type: string
 *                 example: "Facil"
 *               disponibilidade:
 *                 type: string
 *                 example: "Privado"
 *               pagamento:
 *                 type: string
 *                 example: "Gratuita"
 *               faseSelecionada:
 *                 type: number
 *                 example: 1
 *     responses:
 *       201:
 *         description: Trilha criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/", verificarToken, criarTrilha);

/**
 * @swagger
 * /api/trilhas:
 *   get:
 *     summary: Lista todas as trilhas do usuário autenticado
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   titulo:
 *                     type: string
 *                   descricao:
 *                     type: string
 *                   materia:
 *                     type: string
 *                   usuario:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, listarTrilhas);

/**
 * @swagger
 * /api/trilhas/{id}:
 *   put:
 *     summary: Atualiza uma trilha existente (somente pelo dono)
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               materia:
 *                 type: string
 *               dificuldade:
 *                 type: string
 *               disponibilidade:
 *                 type: string
 *               pagamento:
 *                 type: string
 *               faseSelecionada:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trilha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Trilha não encontrada
 */
router.put("/:id", verificarToken, atualizarTrilha);

/**
 * @swagger
 * /api/trilhas/{id}:
 *   delete:
 *     summary: Deleta uma trilha (somente pelo dono)
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser deletada
 *     responses:
 *       200:
 *         description: Trilha deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Trilha não encontrada
 */
router.delete("/:id", verificarToken, deletarTrilha);

/**
 * @swagger
 * /api/trilhas/novidades:
 *   get:
 *     summary: Lista as trilhas mais recentes
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas recentes retornada com sucesso
 */
router.get("/novidades", verificarToken, trilhasNovidades);

/**
 * @swagger
 * /api/trilhas/populares:
 *   get:
 *     summary: Lista as trilhas populares (público)
 *     tags: [Trilhas]
 *     responses:
 *       200:
 *         description: Lista de trilhas populares retornada com sucesso
 */
router.get("/populares", trilhasPopulares);

/**
 * @swagger
 * /api/trilhas/continue:
 *   get:
 *     summary: Lista as trilhas em andamento do usuário
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas em andamento retornada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/continue", verificarToken, trilhasContinue);

/**
 * @swagger
 * /api/trilhas/iniciar/{trilhaId}:
 *   post:
 *     summary: Registra que o usuário iniciou uma trilha
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser iniciada
 *     responses:
 *       200:
 *         description: Trilha iniciada com sucesso
 *       400:
 *         description: trilhaId é obrigatório
 *       404:
 *         description: Trilha não encontrada
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/iniciar/:trilhaId", verificarToken, iniciarTrilha);

export default router;
