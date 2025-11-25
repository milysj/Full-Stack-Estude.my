// src/routes/secoesRoutes.js
import express from "express";
import {
  listarSecoes,
  buscarSecoesPorTrilha,
  buscarSecaoPorId,
  criarSecao,
  atualizarSecao,
  deletarSecao,
} from "../controllers/secaoController.js";
import { verificarToken, verificarProfessor } from "../middlewares/authMiddleware.js";

console.log("✅ secoesRoutes.js carregado!");

const router = express.Router();

/**
 * @swagger
 * /api/secoes:
 *   get:
 *     summary: Lista todas as seções (opcionalmente filtradas por trilhaId)
 *     description: Retorna todas as seções, opcionalmente filtradas por trilhaId. As seções são ordenadas por ordem e data de criação.
 *     tags: [Seções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: trilhaId
 *         schema:
 *           type: string
 *         description: ID da trilha para filtrar seções
 *         example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Lista de seções retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Secao"
 *       400:
 *         description: ID da trilha inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/", verificarToken, listarSecoes);

/**
 * @swagger
 * /api/secoes:
 *   post:
 *     summary: Cria uma nova seção vinculada a uma trilha
 *     description: Cria uma nova seção associada a uma trilha existente. A trilha deve existir e o campo ordem é obrigatório. Apenas PROFESSORES e ADMINISTRADORES podem criar seções.
 *     tags: [Seções]
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
 *                 description: ID da trilha à qual a seção pertence
 *                 example: "671f23a8bc12ab3456f90e12"
 *               titulo:
 *                 type: string
 *                 description: Título da seção
 *                 example: "Seção 1: Introdução"
 *               descricao:
 *                 type: string
 *                 description: Descrição da seção (opcional)
 *                 example: "Conceitos básicos"
 *               ordem:
 *                 type: number
 *                 description: Ordem da seção dentro da trilha
 *                 example: 1
 *     responses:
 *       201:
 *         description: Seção criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seção criada com sucesso!"
 *                 secao:
 *                   $ref: "#/components/schemas/Secao"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios ausentes
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
 *       403:
 *         description: Acesso negado - Apenas professores podem criar seções
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Conflito - Já existe uma seção com esta ordem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/", verificarToken, verificarProfessor, criarSecao);

/**
 * @swagger
 * /api/secoes/trilha/{trilhaId}:
 *   get:
 *     summary: Busca todas as seções de uma trilha específica
 *     description: Retorna todas as seções de uma trilha, ordenadas por ordem. Verifica se a trilha existe antes de retornar as seções.
 *     tags: [Seções]
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
 *         description: Lista de seções retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: "#/components/schemas/Secao"
 *       404:
 *         description: Trilha não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       400:
 *         description: ID da trilha inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/trilha/:trilhaId", verificarToken, buscarSecoesPorTrilha);

/**
 * @swagger
 * /api/secoes/{id}:
 *   get:
 *     summary: Busca uma seção pelo ID
 *     description: Retorna os dados completos de uma seção específica
 *     tags: [Seções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da seção
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Seção retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Secao"
 *       404:
 *         description: Seção não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       400:
 *         description: ID inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   put:
 *     summary: Atualiza uma seção pelo ID
 *     description: Atualiza os dados de uma seção existente. PROFESSORES podem atualizar apenas seções de suas próprias trilhas. ADMINISTRADORES podem atualizar qualquer seção.
 *     tags: [Seções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da seção a ser atualizada
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
 *                 description: ID da trilha (opcional)
 *               titulo:
 *                 type: string
 *                 description: Título da seção
 *               descricao:
 *                 type: string
 *                 description: Descrição da seção
 *               ordem:
 *                 type: number
 *                 description: Ordem da seção
 *     responses:
 *       200:
 *         description: Seção atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seção atualizada com sucesso!"
 *                 secao:
 *                   $ref: "#/components/schemas/Secao"
 *       404:
 *         description: Seção ou trilha não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       409:
 *         description: Conflito de ordem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *   delete:
 *     summary: Deleta uma seção pelo ID
 *     description: Remove permanentemente uma seção do sistema. PROFESSORES podem deletar apenas seções de suas próprias trilhas. ADMINISTRADORES podem deletar qualquer seção.
 *     tags: [Seções]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da seção a ser deletada
 *         schema:
 *           type: string
 *           example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Seção deletada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Seção deletada com sucesso"
 *       404:
 *         description: Seção não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/:id", verificarToken, buscarSecaoPorId);
router.put("/:id", verificarToken, verificarProfessor, atualizarSecao);
router.delete("/:id", verificarToken, verificarProfessor, deletarSecao);

export default router;

