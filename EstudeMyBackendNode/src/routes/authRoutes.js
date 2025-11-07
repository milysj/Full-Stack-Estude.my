import express from "express";
import { registerUser, criarPerfil, loginUser } from "../controllers/userController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Cria a pasta /uploads caso não exista
const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Rotas de login, registro e criação de perfil
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Faz login do usuário
 *     description: Endpoint público para autenticação. Retorna um token JWT que deve ser usado nas requisições autenticadas.
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email do usuário
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 description: Senha do usuário
 *                 example: "123456"
 *           example:
 *             email: "joao@email.com"
 *             senha: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT para autenticação nas próximas requisições
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 perfilCriado:
 *                   type: boolean
 *                   description: Indica se o perfil do usuário já foi criado
 *                   example: false
 *       401:
 *         description: Credenciais inválidas (usuário não encontrado ou senha incorreta)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: "Usuário não encontrado"
 *               senhaIncorreta:
 *                 value:
 *                   message: "Senha incorreta"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastra um novo usuário (Aluno ou Professor)
 *     description: |
 *       Endpoint público para registro de novos usuários. Não requer autenticação.
 *       Aceita dois tipos de usuário: ALUNO (sem campos adicionais) ou PROFESSOR (requer registro e titulação).
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: "#/components/schemas/RegisterAluno"
 *               - $ref: "#/components/schemas/RegisterProfessor"
 *           examples:
 *             aluno:
 *               summary: Exemplo de cadastro de aluno
 *               value:
 *                 nome: "João Victor"
 *                 email: "joao1234@email.com"
 *                 senha: "123456"
 *                 dataNascimento: "2000-08-06"
 *                 tipoUsuario: "ALUNO"
 *             professor:
 *               summary: Exemplo de cadastro de professor
 *               value:
 *                 nome: "Maria Professora"
 *                 email: "maria@email.com"
 *                 senha: "123456"
 *                 dataNascimento: "1980-05-10"
 *                 tipoUsuario: "PROFESSOR"
 *                 registro: "123456"
 *                 titulacao: "Doutor"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuário cadastrado com sucesso!"
 *       400:
 *         description: Dados inválidos ou email já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               emailExiste:
 *                 value:
 *                   message: "Email já cadastrado"
 *               dadosInvalidos:
 *                 value:
 *                   message: "Dados inválidos ou email já cadastrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/register", registerUser);

/**
 * @swagger
 * /api/auth/criarPerfil:
 *   post:
 *     summary: Cria um perfil de usuário
 *     tags: [Autenticação]
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64f4c7b9e6f1a5d6b9c3d2f1"
 *                     username:
 *                       type: string
 *                       example: "joaovictor"
 *                     personagem:
 *                       type: string
 *                       example: "guerreiro"
 *                     fotoPerfil:
 *                       type: string
 *                       example: "/uploads/fotoPerfil-1698672000000-123456789.jpg"
 *       400:
 *         description: Dados inválidos
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
 *       409:
 *         description: Perfil já criado. Não é possível criar o perfil novamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil já criado. Você não pode criar o perfil novamente."
 *                 perfilCriado:
 *                   type: boolean
 *                   example: true
 */
router.post("/criarPerfil", verificarToken, upload.single("fotoPerfil"), criarPerfil);

export default router;
