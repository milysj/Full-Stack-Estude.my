import express from "express";
import {
  criarFase,
  listarFases,
  buscarFasePorId,
  buscarFasesPorTrilha,
  atualizarFase,
  deletarFase,
} from "../controllers/faseController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Fases
 *   description: Rotas relacionadas à criação, listagem e exclusão de fases
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
 * /api/fases:
 *   get:
 *     summary: Lista todas as fases (opcionalmente filtradas por trilhaId)
 *     description: Retorna todas as fases, opcionalmente filtradas por trilhaId. As fases são ordenadas por ordem e data de criação.
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trilhaId
 *         in: query
 *         required: false
 *         description: ID da trilha para filtrar fases
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Lista de fases retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Fase"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/", verificarToken, listarFases);

/**
 * @swagger
 * /api/fases:
 *   post:
 *     summary: Cria uma nova fase vinculada a uma trilha
 *     description: Cria uma nova fase associada a uma trilha existente. A trilha deve existir e o campo ordem é obrigatório.
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trilhaId
 *               - titulo
 *               - ordem
 *             properties:
 *               trilhaId:
 *                 type: string
 *                 description: ID da trilha à qual a fase pertence
 *                 example: "671f23a8bc12ab3456f90e12"
 *               titulo:
 *                 type: string
 *                 description: Título da fase
 *                 example: "Fase 1: Introdução"
 *               descricao:
 *                 type: string
 *                 description: Descrição da fase
 *                 example: "Introdução aos conceitos básicos"
 *               conteudo:
 *                 type: string
 *                 description: Conteúdo textual da fase (opcional)
 *                 example: "Nesta fase você aprenderá..."
 *               ordem:
 *                 type: number
 *                 description: Ordem da fase na trilha
 *                 example: 1
 *               perguntas:
 *                 type: array
 *                 description: Array de perguntas da fase (opcional)
 *                 items:
 *                   type: object
 *                   properties:
 *                     enunciado:
 *                       type: string
 *                       example: "Qual é a capital do Brasil?"
 *                     alternativas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Brasília", "São Paulo", "Rio de Janeiro", "Belo Horizonte"]
 *                     respostaCorreta:
 *                       type: number
 *                       description: Índice da alternativa correta (0-based)
 *                       example: 0
 *     responses:
 *       201:
 *         description: Fase criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Fase"
 *       400:
 *         description: Dados inválidos (trilhaId ou ordem ausentes)
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
 *       404:
 *         description: Trilha não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/", verificarToken, criarFase);

/**
 * @swagger
 * /api/fases/trilha/{trilhaId}:
 *   get:
 *     summary: Busca todas as fases de uma trilha específica
 *     description: Retorna todas as fases de uma trilha, ordenadas por ordem. Verifica se a trilha existe antes de retornar as fases.
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: trilhaId
 *         in: path
 *         required: true
 *         description: ID da trilha
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Lista de fases da trilha retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Fase"
 *       404:
 *         description: Trilha não encontrada
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
router.get("/trilha/:trilhaId", verificarToken, buscarFasesPorTrilha);

/**
 * @swagger
 * /api/fases/{id}:
 *   get:
 *     summary: Busca uma fase pelo ID
 *     description: Retorna os dados completos de uma fase específica, incluindo informações da trilha associada
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da fase
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Fase retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Fase"
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
 *   put:
 *     summary: Atualiza uma fase pelo ID
 *     description: Atualiza os dados de uma fase existente. Se trilhaId for fornecido, valida se a trilha existe.
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da fase a ser atualizada
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               trilhaId:
 *                 type: string
 *                 description: ID da trilha (opcional, valida se fornecido)
 *               titulo:
 *                 type: string
 *                 description: Título da fase
 *               descricao:
 *                 type: string
 *                 description: Descrição da fase
 *               conteudo:
 *                 type: string
 *                 description: Conteúdo textual da fase
 *               ordem:
 *                 type: number
 *                 description: Ordem da fase
 *               perguntas:
 *                 type: array
 *                 description: Array de perguntas
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Fase atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Fase"
 *       404:
 *         description: Fase ou trilha não encontrada
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
 *   delete:
 *     summary: Deleta uma fase pelo ID
 *     description: Remove permanentemente uma fase do sistema
 *     tags: [Fases]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da fase a ser deletada
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Fase deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Fase deletada com sucesso"
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
router.get("/:id", verificarToken, buscarFasePorId);
router.put("/:id", verificarToken, atualizarFase);
router.delete("/:id", verificarToken, deletarFase);

export default router;
