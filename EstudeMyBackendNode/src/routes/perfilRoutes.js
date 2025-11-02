import express from "express";
import { criarPerfil } from "../controllers/perfilController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Perfil
 *   description: Rotas relacionadas à criação e gerenciamento de perfis de usuário
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
 * /api/perfil/criarPerfil:
 *   post:
 *     summary: Cria o perfil do usuário autenticado
 *     description: Permite que o usuário autenticado defina seu nome de usuário, personagem e foto de perfil.
 *     tags: [Perfil]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - personagem
 *               - fotoPerfil
 *             properties:
 *               username:
 *                 type: string
 *                 description: Nome de usuário único
 *                 example: "joaovictor"
 *               personagem:
 *                 type: string
 *                 description: Tipo de personagem escolhido pelo usuário
 *                 enum: [guerreiro, mago, samurai]
 *                 example: "guerreiro"
 *               fotoPerfil:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de perfil do usuário
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem:
 *                   type: string
 *                   example: "Perfil criado com sucesso!"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "671f23a8bc12ab3456f90e12"
 *                     username:
 *                       type: string
 *                       example: "joaovictor"
 *                     personagem:
 *                       type: string
 *                       example: "guerreiro"
 *                     fotoPerfil:
 *                       type: string
 *                       example: "/uploads/fotoPerfil-1730158291234-123456789.jpg"
 *       400:
 *         description: Dados inválidos ou já existe um perfil com este username
 *       401:
 *         description: Token ausente ou inválido
 */

router.post("/criarPerfil", verificarToken, upload.single("fotoPerfil"), criarPerfil);

export default router;
