// src/routes/userRoutes.js
import express from "express";
import {
  criarPerfil,
  loginUser,
  buscarMeusDados,
  verificarAutenticacao,
  atualizarDadosPessoais,
  mudarSenha,
  solicitarRecuperacaoSenha,
  redefinirSenha,
  verificarTokenReset,
  excluirConta,
} from "../controllers/userController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Rotas relacionadas aos usuários e autenticação
 */



/**
 * @swagger
 * /api/users/verify:
 *   get:
 *     summary: Verifica se o token de autenticação é válido
 *     description: Endpoint leve que apenas verifica se o usuário está autenticado, retornando apenas o status de autenticação
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   example: "690228badcd0071298c67b70"
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/verify", verificarToken, verificarAutenticacao);

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Busca dados do usuário autenticado
 *     description: Retorna todos os dados do usuário autenticado, exceto a senha
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Usuario"
 *       404:
 *         description: Usuário não encontrado
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
 */
router.get("/me", verificarToken, buscarMeusDados);

/**
 * @swagger
 * /api/users/dados-pessoais:
 *   put:
 *     summary: Atualiza dados pessoais do usuário
 *     description: Atualiza os dados pessoais do usuário autenticado. Apenas os campos fornecidos serão atualizados.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome completo do usuário
 *                 example: "João Victor Silva"
 *               telefone:
 *                 type: string
 *                 description: Número de telefone
 *                 example: "(11) 99999-9999"
 *               endereco:
 *                 type: string
 *                 description: Endereço completo
 *                 example: "Rua Exemplo, 123 - São Paulo, SP"
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *                 description: Data de nascimento no formato YYYY-MM-DD
 *                 example: "2000-08-06"
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dados pessoais atualizados com sucesso!"
 *                 usuario:
 *                   $ref: "#/components/schemas/Usuario"
 *       404:
 *         description: Usuário não encontrado
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
 */
router.put("/dados-pessoais", verificarToken, atualizarDadosPessoais);

/**
 * @swagger
 * /api/users/mudar-senha:
 *   put:
 *     summary: Altera a senha do usuário autenticado
 *     description: Altera a senha do usuário autenticado. Requer a senha atual para validação. A nova senha deve ter pelo menos 6 caracteres.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senhaAtual
 *               - novaSenha
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 description: Senha atual do usuário
 *                 example: "123456"
 *               novaSenha:
 *                 type: string
 *                 minLength: 6
 *                 description: Nova senha (mínimo 6 caracteres)
 *                 example: "novaSenha123"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Senha alterada com sucesso!"
 *       400:
 *         description: Campos obrigatórios ausentes ou nova senha muito curta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Senha atual incorreta ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.put("/mudar-senha", verificarToken, mudarSenha);

/**
 * @swagger
 * /api/users/solicitar-recuperacao:
 *   post:
 *     summary: Solicita recuperação de senha (envia email com link)
 *     tags: [Usuários]
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
router.post("/solicitar-recuperacao", solicitarRecuperacaoSenha);

/**
 * @swagger
 * /api/users/verificar-token/{token}:
 *   get:
 *     summary: Verifica se token de recuperação é válido
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Token válido ou inválido
 *       400:
 *         description: Token inválido ou expirado
 */
router.get("/verificar-token/:token", verificarTokenReset);

/**
 * @swagger
 * /api/users/redefinir-senha:
 *   post:
 *     summary: Redefine senha usando token recebido por email
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - novaSenha
 *             properties:
 *               token:
 *                 type: string
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Token inválido ou dados inválidos
 */
router.post("/redefinir-senha", redefinirSenha);

/**
 * @swagger
 * /api/users/me:
 *   delete:
 *     summary: Exclui a conta do usuário autenticado
 *     description: Remove permanentemente a conta do usuário autenticado. Requer confirmação com a senha atual.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senha
 *             properties:
 *               senha:
 *                 type: string
 *                 description: Senha atual do usuário para confirmação
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Conta excluída com sucesso!"
 *       400:
 *         description: Senha é obrigatória
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Senha incorreta ou token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.delete("/me", verificarToken, excluirConta);

export default router;
