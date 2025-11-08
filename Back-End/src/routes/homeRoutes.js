import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { getHomeData } from "../controllers/homeController.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Home
 *   description: Rotas relacionadas à tela inicial do usuário
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
 * /api/home:
 *   get:
 *     summary: Obtém os dados da tela inicial do usuário
 *     description: Retorna as trilhas organizadas em seções (novidades, populares e continue) junto com dados do usuário autenticado
 *     tags: [Home]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados da home retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     nome:
 *                       type: string
 *                     materiaFavorita:
 *                       type: string
 *                     personagem:
 *                       type: string
 *                     fotoPerfil:
 *                       type: string
 *                 trilhas:
 *                   type: object
 *                   properties:
 *                     novidades:
 *                       type: array
 *                       description: Últimas 10 trilhas criadas
 *                       items:
 *                         $ref: "#/components/schemas/Trilha"
 *                     populares:
 *                       type: array
 *                       description: 10 trilhas mais acessadas
 *                       items:
 *                         $ref: "#/components/schemas/Trilha"
 *                     continue:
 *                       type: array
 *                       description: Trilhas iniciadas pelo usuário (máximo 10)
 *                       items:
 *                         $ref: "#/components/schemas/Trilha"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", verificarToken, getHomeData);

export default router;
