import express from "express";
import { registerUser, criarPerfil, loginUser, obterTermos, verificarAutenticacao } from "../controllers/userController.js";
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
 *                 summary: Usuário não encontrado
 *                 value:
 *                   message: "Usuário não encontrado"
 *               senhaIncorreta:
 *                 summary: Senha incorreta
 *                 value:
 *                   message: "Senha incorreta"
 *               senhaInvalida:
 *                 summary: Senha inválida
 *                 value:
 *                   message: "Senha inválida"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               usuarioNaoEncontrado:
 *                 value:
 *                   message: "Usuário não encontrado"
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
 *       Requisitos: 
 *       - O usuário deve ter no mínimo 14 anos de idade.
 *       - É obrigatório aceitar os termos de uso e política de privacidade (aceiteTermos: true).
 *       - O tipo ADMINISTRADOR não pode ser criado via API, apenas manualmente no banco de dados.
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
 *                 senha: "senha123"
 *                 dataNascimento: "2000-08-06"
 *                 tipoUsuario: "ALUNO"
 *                 aceiteTermos: true
 *             professor:
 *               summary: Exemplo de cadastro de professor
 *               value:
 *                 nome: "Maria Professora"
 *                 email: "maria@email.com"
 *                 senha: "senha123"
 *                 dataNascimento: "1980-05-10"
 *                 tipoUsuario: "PROFESSOR"
 *                 registro: "123456"
 *                 titulacao: "Doutor"
 *                 aceiteTermos: true
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
 *         description: Dados inválidos, email já cadastrado ou idade insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               emailExiste:
 *                 value:
 *                   message: "Email já cadastrado"
 *               idadeInsuficiente:
 *                 value:
 *                   message: "É necessário ter no mínimo 14 anos para criar uma conta"
 *               dataInvalida:
 *                 value:
 *                   message: "Data de nascimento inválida"
 *               dataFutura:
 *                 value:
 *                   message: "Data de nascimento não pode ser no futuro"
 *               termoNaoAceito:
 *                 value:
 *                   message: "É necessário aceitar os termos de uso e política de privacidade para criar uma conta"
 *               senhaInvalida:
 *                 value:
 *                   message: "A senha deve ter no mínimo 8 caracteres"
 *               dadosInvalidos:
 *                 value:
 *                   message: "Dados inválidos ou email já cadastrado"
 *       403:
 *         description: Tentativa de criar usuário como ADMINISTRADOR
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               administradorNegado:
 *                 summary: Tentativa de criar administrador
 *                 value:
 *                   message: "Não é possível criar usuário administrador via API. Contate o suporte."
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
 * /api/auth/termos:
 *   get:
 *     summary: Obtém os termos de uso e política de privacidade
 *     description: Endpoint público que retorna os termos de uso e política de privacidade da plataforma. Não requer autenticação.
 *     tags: [Autenticação]
 *     security: []
 *     responses:
 *       200:
 *         description: Termos de uso e política de privacidade retornados com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 termosUso:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                       example: "Termos de Uso"
 *                     versao:
 *                       type: string
 *                       example: "1.0"
 *                     dataAtualizacao:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     conteudo:
 *                       type: string
 *                       description: "Conteúdo completo dos termos de uso"
 *                 politicaPrivacidade:
 *                   type: object
 *                   properties:
 *                     titulo:
 *                       type: string
 *                       example: "Política de Privacidade"
 *                     versao:
 *                       type: string
 *                       example: "1.0"
 *                     dataAtualizacao:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-01"
 *                     conteudo:
 *                       type: string
 *                       description: "Conteúdo completo da política de privacidade"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/termos", obterTermos);

/**
 * @swagger
 * /api/auth/criarPerfil:
 *   post:
 *     summary: Cria um perfil de usuário
 *     description: |
 *       Endpoint para criar o perfil do usuário. Aceita apenas fotos pré-definidas.
 *       Fotos permitidas: /img/guerreiro.png, /img/mago.png, /img/samurai.png
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
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
 *                 description: Personagem escolhido (Guerreiro, Mago ou Samurai)
 *                 enum: [Guerreiro, Mago, Samurai]
 *                 example: "Mago"
 *               fotoPerfil:
 *                 type: string
 *                 description: URL da foto de perfil pré-definida
 *                 enum: ["/img/guerreiro.png", "/img/mago.png", "/img/samurai.png"]
 *                 example: "/img/mago.png"
 *           example:
 *             username: "joaovictor"
 *             personagem: "Mago"
 *             fotoPerfil: "/img/mago.png"
 *     responses:
 *       200:
 *         description: Perfil criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Perfil criado com sucesso!"
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
 *                       example: "Mago"
 *                     fotoPerfil:
 *                       type: string
 *                       example: "/img/mago.png"
 *       400:
 *         description: Dados inválidos ou foto de perfil não permitida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               camposObrigatorios:
 *                 value:
 *                   message: "Personagem, username e foto são obrigatórios!"
 *               fotoInvalida:
 *                 value:
 *                   message: "Foto de perfil inválida. Escolha uma das fotos pré-definidas."
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Conflito - Perfil já criado ou username já em uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               perfilJaCriado:
 *                 value:
 *                   message: "Perfil já criado. Você não pode criar o perfil novamente."
 *                   perfilCriado: true
 *               usernameDuplicado:
 *                 value:
 *                   message: "Username já está em uso. Por favor, escolha outro username."
 */
router.post("/criarPerfil", verificarToken, criarPerfil);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verifica se o token de autenticação é válido (alias)
 *     description: Endpoint alternativo para /api/users/verify. Retorna apenas o status de autenticação.
 *     tags: [Autenticação]
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

export default router;
