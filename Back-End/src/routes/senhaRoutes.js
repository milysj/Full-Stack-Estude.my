import express from "express";
import { solicitarRecuperacaoSenha } from "../controllers/userController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Senha
 *   description: Rotas relacionadas à recuperação de senha (compatibilidade)
 */

/**
 * @swagger
 * /api/senha:
 *   post:
 *     summary: Solicita recuperação de senha (endpoint alternativo)
 *     description: Endpoint alternativo para compatibilidade com componentes antigos. Redireciona para /api/users/solicitar-recuperacao
 *     tags: [Senha]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email enviado (resposta genérica por segurança)
 *       400:
 *         description: Email é obrigatório
 */
router.post("/", solicitarRecuperacaoSenha);

export default router;

