import express from "express";
import { listarUsuarios } from "../controllers/userController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Rotas relacionadas aos usuários
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista usuários (apenas dados públicos)
 *     description: Retorna lista de usuários com apenas dados públicos (username, nome, fotoPerfil, personagem, tipoUsuario). Útil para verificar se um username já existe.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   nome:
 *                     type: string
 *                   fotoPerfil:
 *                     type: string
 *                   personagem:
 *                     type: string
 *                   tipoUsuario:
 *                     type: string
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, listarUsuarios);

export default router;

