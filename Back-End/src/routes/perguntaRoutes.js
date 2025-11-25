import express from "express";
import {
  listarPerguntasPorFase,
  criarPergunta,
  atualizarPergunta,
  deletarPergunta,
} from "../controllers/perguntaController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Perguntas
 *   description: Rotas relacionadas ao gerenciamento de perguntas das fases
 */

/**
 * @swagger
 * /api/perguntas/fase/{faseId}:
 *   get:
 *     summary: Lista perguntas de uma fase
 *     description: Retorna todas as perguntas de uma fase específica
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da fase
 *     responses:
 *       200:
 *         description: Lista de perguntas
 *       404:
 *         description: Fase não encontrada
 */
router.get("/fase/:faseId", verificarToken, listarPerguntasPorFase);

/**
 * @swagger
 * /api/perguntas:
 *   post:
 *     summary: Cria uma nova pergunta em uma fase
 *     description: Adiciona uma nova pergunta a uma fase existente. Apenas o criador da trilha ou administradores podem criar perguntas.
 *     tags: [Perguntas]
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
 *               - enunciado
 *               - alternativas
 *               - respostaCorreta
 *             properties:
 *               faseId:
 *                 type: string
 *                 description: ID da fase
 *               enunciado:
 *                 type: string
 *                 description: Texto da pergunta
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array de alternativas
 *               respostaCorreta:
 *                 type: number
 *                 description: Índice da alternativa correta (0-based)
 *     responses:
 *       201:
 *         description: Pergunta criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Acesso negado
 *       404:
 *         description: Fase não encontrada
 */
router.post("/", verificarToken, criarPergunta);

/**
 * @swagger
 * /api/perguntas/{faseId}/{perguntaIndex}:
 *   put:
 *     summary: Atualiza uma pergunta existente
 *     description: Atualiza uma pergunta de uma fase. Apenas o criador da trilha ou administradores podem atualizar.
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: perguntaIndex
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enunciado:
 *                 type: string
 *               alternativas:
 *                 type: array
 *                 items:
 *                   type: string
 *               respostaCorreta:
 *                 type: number
 *     responses:
 *       200:
 *         description: Pergunta atualizada com sucesso
 *       404:
 *         description: Pergunta não encontrada
 */
router.put("/:faseId/:perguntaIndex", verificarToken, atualizarPergunta);

/**
 * @swagger
 * /api/perguntas/{faseId}/{perguntaIndex}:
 *   delete:
 *     summary: Deleta uma pergunta
 *     description: Remove uma pergunta de uma fase. Apenas o criador da trilha ou administradores podem deletar.
 *     tags: [Perguntas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: faseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: perguntaIndex
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Pergunta deletada com sucesso
 *       404:
 *         description: Pergunta não encontrada
 */
router.delete("/:faseId/:perguntaIndex", verificarToken, deletarPergunta);

export default router;

