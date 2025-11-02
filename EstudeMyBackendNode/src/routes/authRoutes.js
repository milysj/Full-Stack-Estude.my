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
 * /api/auth/login:
 *   post:
 *     summary: Faz login do usuário
 *     tags: [Autenticação]
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
 *                 example: "joao@email.com"
 *               senha:
 *                 type: string
 *                 example: "123456"
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
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                 perfilCriado:
 *                   type: boolean
 *                   example: false
 *       401:
 *         description: Credenciais inválidas
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastra um novo usuário (Aluno ou Professor)
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - type: object
 *                 required:
 *                   - nome
 *                   - email
 *                   - senha
 *                   - dataNascimento
 *                   - tipoUsuario
 *                 properties:
 *                   nome:
 *                     type: string
 *                     example: "João Victor"
 *                   email:
 *                     type: string
 *                     example: "joao@email.com"
 *                   senha:
 *                     type: string
 *                     example: "123456"
 *                   dataNascimento:
 *                     type: string
 *                     format: date
 *                     example: "2000-08-06"
 *                   tipoUsuario:
 *                     type: string
 *                     enum: [ALUNO]
 *                     example: "ALUNO"
 *               - type: object
 *                 required:
 *                   - nome
 *                   - email
 *                   - senha
 *                   - dataNascimento
 *                   - tipoUsuario
 *                   - registro
 *                   - titulacao
 *                 properties:
 *                   nome:
 *                     type: string
 *                     example: "Maria Professora"
 *                   email:
 *                     type: string
 *                     example: "maria@email.com"
 *                   senha:
 *                     type: string
 *                     example: "123456"
 *                   dataNascimento:
 *                     type: string
 *                     format: date
 *                     example: "1980-05-10"
 *                   tipoUsuario:
 *                     type: string
 *                     enum: [PROFESSOR]
 *                     example: "PROFESSOR"
 *                   registro:
 *                     type: string
 *                     example: "123456"
 *                   titulacao:
 *                     type: string
 *                     example: "Doutor"
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Dados inválidos ou email já cadastrado
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
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/criarPerfil", verificarToken, upload.single("fotoPerfil"), criarPerfil);

export default router;
