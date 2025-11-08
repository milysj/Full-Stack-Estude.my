// src/routes/trilhaRoutes.js
import express from "express";
import { verificarToken, verificarProfessor, verificarTokenOpcional } from "../middlewares/authMiddleware.js";
import {
  criarTrilha,
  listarTrilhas,
  atualizarTrilha,
  deletarTrilha,
  trilhasNovidades,
  trilhasPopulares,
  trilhasContinue,
  iniciarTrilha,
  buscarTrilhas,
} from "../controllers/trilhaController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Trilhas
 *   description: Gerenciamento de trilhas criadas por usuários (CRUD + seções da Home)
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
 * /api/trilhas:
 *   post:
 *     summary: Cria uma nova trilha
 *     description: Cria uma nova trilha associada ao usuário autenticado. A imagem padrão será aplicada se não fornecida. Apenas PROFESSORES e ADMINISTRADORES podem criar trilhas.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descricao
 *               - materia
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Título da trilha
 *                 example: "Matemática Básica"
 *               descricao:
 *                 type: string
 *                 description: Descrição da trilha
 *                 example: "Trilha introdutória sobre fundamentos da matemática."
 *               materia:
 *                 type: string
 *                 description: Matéria da trilha
 *                 example: "Matemática"
 *               dificuldade:
 *                 type: string
 *                 enum: [Facil, Medio, Dificil]
 *                 description: Nível de dificuldade
 *                 example: "Facil"
 *               disponibilidade:
 *                 type: string
 *                 enum: [Aberto, Privado]
 *                 description: Disponibilidade da trilha
 *                 example: "Aberto"
 *               pagamento:
 *                 type: string
 *                 enum: [Gratuita, Paga]
 *                 description: Tipo de pagamento
 *                 example: "Gratuita"
 *               imagem:
 *                 type: string
 *                 description: "URL da imagem da trilha (opcional, padrão /img/fases/vila.jpg)"
 *                 example: "/img/fases/vila.jpg"
 *               faseSelecionada:
 *                 type: number
 *                 description: Número de fases selecionadas
 *                 example: 1
 *     responses:
 *       201:
 *         description: Trilha criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Trilha"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               dadosInvalidos:
 *                 value:
 *                   message: "Dados inválidos"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   success: false
 *                   message: "Acesso negado. Token não fornecido."
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   success: false
 *                   message: "Token expirado. Faça login novamente."
 *               tokenInvalido:
 *                 summary: Token inválido
 *                 value:
 *                   success: false
 *                   message: "Token inválido."
 *       403:
 *         description: Acesso negado - Apenas professores e administradores podem criar trilhas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               acessoNegado:
 *                 summary: Usuário não tem permissão
 *                 value:
 *                   success: false
 *                   message: "Acesso negado. Apenas professores e administradores podem realizar esta ação."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               erroServidor:
 *                 value:
 *                   message: "Erro ao criar trilha"
 */
router.post("/", verificarToken, verificarProfessor, criarTrilha);

/**
 * @swagger
 * /api/trilhas:
 *   get:
 *     summary: Lista todas as trilhas do usuário autenticado
 *     description: Retorna todas as trilhas criadas pelo usuário autenticado, ordenadas por data de criação (mais recentes primeiro). PROFESSORES veem apenas suas trilhas. ADMINISTRADORES veem todas as trilhas.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Trilha"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/", verificarToken, verificarProfessor, listarTrilhas);

/**
 * @swagger
 * /api/trilhas/{id}:
 *   put:
 *     summary: Atualiza uma trilha existente
 *     description: Atualiza uma trilha existente. PROFESSORES podem atualizar apenas suas próprias trilhas. ADMINISTRADORES podem atualizar qualquer trilha.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               materia:
 *                 type: string
 *               dificuldade:
 *                 type: string
 *               disponibilidade:
 *                 type: string
 *               pagamento:
 *                 type: string
 *               faseSelecionada:
 *                 type: number
 *     responses:
 *       200:
 *         description: Trilha atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Trilha não encontrada
 */
router.put("/:id", verificarToken, verificarProfessor, atualizarTrilha);

/**
 * @swagger
 * /api/trilhas/{id}:
 *   delete:
 *     summary: Deleta uma trilha
 *     description: Deleta uma trilha existente. PROFESSORES podem deletar apenas suas próprias trilhas. ADMINISTRADORES podem deletar qualquer trilha.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser deletada
 *     responses:
 *       200:
 *         description: Trilha deletada com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário não autorizado
 *       404:
 *         description: Trilha não encontrada
 */
router.delete("/:id", verificarToken, verificarProfessor, deletarTrilha);

/**
 * @swagger
 * /api/trilhas/novidades:
 *   get:
 *     summary: Lista as trilhas mais recentes que o usuário ainda não iniciou
 *     description: Retorna as 10 trilhas mais recentes que o usuário autenticado ainda não iniciou, ordenadas por data de criação
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas recentes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Trilha"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/novidades", verificarToken, trilhasNovidades);

/**
 * @swagger
 * /api/trilhas/populares:
 *   get:
 *     summary: Lista as trilhas mais populares (público)
 *     description: Retorna as 10 trilhas mais populares baseadas em visualizações. Endpoint público, não requer autenticação.
 *     tags: [Trilhas]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de trilhas populares retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Trilha"
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/populares", trilhasPopulares);

/**
 * @swagger
 * /api/trilhas/continue:
 *   get:
 *     summary: Lista as trilhas em andamento do usuário
 *     description: Retorna as trilhas que o usuário autenticado já iniciou, ordenadas por data de atualização (mais recentes primeiro). Limite de 10 trilhas.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas em andamento retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Trilha"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/continue", verificarToken, trilhasContinue);

/**
 * @swagger
 * /api/trilhas/iniciar/{trilhaId}:
 *   post:
 *     summary: Registra que o usuário iniciou uma trilha
 *     description: Adiciona o usuário autenticado à lista de usuários que iniciaram a trilha. Se o usuário já estiver na lista, não faz nada.
 *     tags: [Trilhas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser iniciada
 *         example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Trilha iniciada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trilha iniciada com sucesso"
 *                 trilha:
 *                   $ref: "#/components/schemas/Trilha"
 *       400:
 *         description: trilhaId é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               trilhaIdObrigatorio:
 *                 value:
 *                   message: "trilhaId é obrigatório"
 *       404:
 *         description: Trilha não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               trilhaNaoEncontrada:
 *                 value:
 *                   message: "Trilha não encontrada"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             examples:
 *               tokenAusente:
 *                 summary: Token não fornecido
 *                 value:
 *                   success: false
 *                   message: "Acesso negado. Token não fornecido."
 *               tokenExpirado:
 *                 summary: Token expirado
 *                 value:
 *                   success: false
 *                   message: "Token expirado. Faça login novamente."
 *               tokenInvalido:
 *                 summary: Token inválido
 *                 value:
 *                   success: false
 *                   message: "Token inválido."
 */
router.post("/iniciar/:trilhaId", verificarToken, iniciarTrilha);

/**
 * @swagger
 * /api/trilhas/buscar:
 *   get:
 *     summary: Busca trilhas públicas por termo
 *     description: Busca trilhas públicas (disponibilidade: "Aberto") que correspondam ao termo de busca. A busca é feita em título, descrição e matéria (case-insensitive). Endpoint público, não requer autenticação.
 *     tags: [Trilhas]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Termo de busca
 *         example: "matemática"
 *     responses:
 *       200:
 *         description: Lista de trilhas encontradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Trilha"
 *       400:
 *         description: Termo de busca é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               termoObrigatorio:
 *                 value:
 *                   message: "Termo de busca é obrigatório"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/buscar", verificarTokenOpcional, buscarTrilhas);

export default router;
