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
 *                 novidades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "671f23a8bc12ab3456f90e12"
 *                       titulo:
 *                         type: string
 *                         example: "Nova Trilha"
 *                       descricao:
 *                         type: string
 *                         example: "Descrição da trilha"
 *                 populares:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "671f23a8bc12ab3456f90e34"
 *                       titulo:
 *                         type: string
 *                         example: "Trilha Popular"
 *                       descricao:
 *                         type: string
 *                         example: "Descrição da trilha popular"
 *                 continue:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "671f23a8bc12ab3456f90e56"
 *                       titulo:
 *                         type: string
 *                         example: "Trilha em andamento"
 *                       progresso:
 *                         type: number
 *                         example: 45
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, getHomeData);

export default router;
