// src/routes/userRoutes.js
import express from "express";
import {
  criarPerfil,
  loginUser,
  buscarMeusDados,
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
 * /usuarios/criarPerfil:
 *   post:
 *     summary: Cria um novo perfil de usuário
 *     description: Cria um perfil para o usuário autenticado. É necessário enviar um token JWT no header e o arquivo da foto de perfil.
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "joaovictor"
 *               personagem:
 *                 type: string
 *                 example: "guerreiro"
 *               fotoPerfil:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Perfil criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/criarPerfil", verificarToken, upload.single("fotoPerfil"), criarPerfil);

/**
 * @swagger
 * /usuarios/login:
 *   post:
 *     summary: Faz login do usuário
 *     tags: [Usuários]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso e token gerado
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /usuarios/me:
 *   get:
 *     summary: Busca dados do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/me", verificarToken, buscarMeusDados);

/**
 * @swagger
 * /usuarios/dados-pessoais:
 *   put:
 *     summary: Atualiza dados pessoais do usuário
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
 *               telefone:
 *                 type: string
 *               endereco:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Dados atualizados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 */
router.put("/dados-pessoais", verificarToken, atualizarDadosPessoais);

/**
 * @swagger
 * /usuarios/mudar-senha:
 *   put:
 *     summary: Altera a senha do usuário autenticado
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
 *               novaSenha:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       401:
 *         description: Senha atual incorreta ou token inválido
 */
router.put("/mudar-senha", verificarToken, mudarSenha);

/**
 * @swagger
 * /usuarios/solicitar-recuperacao:
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
 * /usuarios/verificar-token/{token}:
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
 * /usuarios/redefinir-senha:
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
 * /usuarios/me:
 *   delete:
 *     summary: Exclui a conta do usuário autenticado
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
 *     responses:
 *       200:
 *         description: Conta excluída com sucesso
 *       401:
 *         description: Senha incorreta ou token inválido
 */
router.delete("/me", verificarToken, excluirConta);

export default router;
