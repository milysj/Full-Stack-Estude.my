import express from "express";
import {
  salvarResultado,
  salvarResposta,
  verificarProgresso,
  obterProgressoTrilha,
  obterDadosUsuario,
} from "../controllers/progressoController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Progresso
 *   description: Rotas relacionadas ao progresso do usuário em fases e trilhas
 */

/**
 * @swagger
 * /api/progresso/salvar:
 *   post:
 *     summary: Salva o resultado de uma fase completada
 *     description: Salva o resultado final de uma fase completada pelo usuário, calcula XP ganho e atualiza o nível do usuário através do microsserviço SCORE. Se a fase já foi completada anteriormente, retorna erro.
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faseId
 *               - pontuacao
 *               - totalPerguntas
 *             properties:
 *               faseId:
 *                 type: string
 *                 description: ID da fase completada
 *                 example: "671f23a8bc12ab3456f90e12"
 *               pontuacao:
 *                 type: number
 *                 description: Número de acertos
 *                 example: 8
 *               totalPerguntas:
 *                 type: number
 *                 description: Total de perguntas da fase
 *                 example: 10
 *               respostasUsuario:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Array com as respostas do usuário (opcional)
 *                 example: [0, 1, 2, 0, 1, 2, 0, 1, 2, 0]
 *     responses:
 *       201:
 *         description: Resultado salvo com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resultado salvo com sucesso"
 *                 progresso:
 *                   $ref: "#/components/schemas/Progresso"
 *                 xpGanho:
 *                   type: number
 *                   example: 400
 *                 nivel:
 *                   type: object
 *                   properties:
 *                     nivel:
 *                       type: number
 *                       example: 2
 *                     xpAtual:
 *                       type: number
 *                       example: 200
 *                     xpNecessario:
 *                       type: number
 *                       example: 500
 *                     xpAcumulado:
 *                       type: number
 *                       example: 400
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     xpTotal:
 *                       type: number
 *                       example: 400
 *                     nivel:
 *                       type: number
 *                       example: 2
 *       400:
 *         description: Dados inválidos ou fase já completada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Fase não encontrada
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
router.post("/salvar", verificarToken, salvarResultado);

/**
 * @swagger
 * /api/progresso/salvar-resposta:
 *   post:
 *     summary: Salva uma resposta individual de uma pergunta
 *     description: Salva a resposta de uma pergunta específica durante o progresso de uma fase. Cria ou atualiza o progresso parcial da fase, recalculando a pontuação automaticamente. Permite salvar respostas progressivamente sem completar a fase.
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - faseId
 *               - perguntaIndex
 *               - resposta
 *             properties:
 *               faseId:
 *                 type: string
 *                 description: ID da fase
 *                 example: "671f23a8bc12ab3456f90e12"
 *               perguntaIndex:
 *                 type: number
 *                 description: Índice da pergunta (0-based)
 *                 example: 0
 *               resposta:
 *                 type: number
 *                 description: Índice da alternativa escolhida (0-based)
 *                 example: 1
 *     responses:
 *       200:
 *         description: Resposta salva com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Resposta salva com sucesso"
 *                 progresso:
 *                   $ref: "#/components/schemas/Progresso"
 *       400:
 *         description: Dados inválidos (faseId, perguntaIndex ou resposta ausentes)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Fase não encontrada
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
router.post("/salvar-resposta", verificarToken, salvarResposta);

/**
 * @swagger
 * /api/progresso/verificar/{faseId}:
 *   get:
 *     summary: Verifica se o usuário já completou uma fase
 *     description: Retorna o status de progresso de uma fase específica, incluindo se foi completada e as respostas salvas
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fase a ser verificada
 *         example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Status do progresso retornado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completado:
 *                   type: boolean
 *                   description: Se a fase foi completada
 *                   example: true
 *                 progresso:
 *                   $ref: "#/components/schemas/Progresso"
 *                 respostasSalvas:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Array com as respostas salvas (-1 para não respondidas)
 *                   example: [0, 1, 2, -1, -1, -1, -1, -1, -1, -1]
 *                 perguntasRespondidas:
 *                   type: array
 *                   items:
 *                     type: number
 *                   description: Índices das perguntas já respondidas
 *                   example: [0, 1, 2]
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/verificar/:faseId", verificarToken, verificarProgresso);

/**
 * @swagger
 * /api/progresso/trilha/{trilhaId}:
 *   get:
 *     summary: Obtém o progresso de todas as fases de uma trilha
 *     description: Retorna um mapa indicando quais fases da trilha foram completadas pelo usuário
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha
 *         example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Progresso das fases retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 progresso:
 *                   type: object
 *                   additionalProperties:
 *                     type: boolean
 *                   description: Mapa de faseId -> completado
 *                   example:
 *                     "671f23a8bc12ab3456f90e13": true
 *                     "671f23a8bc12ab3456f90e14": false
 *       400:
 *         description: trilhaId é obrigatório
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
router.get("/trilha/:trilhaId", verificarToken, obterProgressoTrilha);

/**
 * @swagger
 * /api/progresso/usuario:
 *   get:
 *     summary: Obtém dados do usuário com nível e XP calculados
 *     description: Retorna os dados completos do usuário autenticado, incluindo nível, XP atual, XP necessário para próximo nível e XP acumulado. Os dados de XP são obtidos do microsserviço SCORE.
 *     tags: [Progresso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
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
 *                     nome:
 *                       type: string
 *                     email:
 *                       type: string
 *                     username:
 *                       type: string
 *                     personagem:
 *                       type: string
 *                     fotoPerfil:
 *                       type: string
 *                     materiaFavorita:
 *                       type: string
 *                     xpTotal:
 *                       type: number
 *                 nivel:
 *                   type: number
 *                   description: Nível atual do usuário
 *                   example: 3
 *                 xpAtual:
 *                   type: number
 *                   description: XP atual no nível atual
 *                   example: 250
 *                 xpNecessario:
 *                   type: number
 *                   description: XP necessário para o próximo nível
 *                   example: 500
 *                 xpAcumulado:
 *                   type: number
 *                   description: XP total acumulado
 *                   example: 1250
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
router.get("/usuario", verificarToken, obterDadosUsuario);

export default router;

