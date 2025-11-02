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
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "671f23a8bc12ab3456f90e12"
 *                   trilhaId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       titulo:
 *                         type: string
 *                       descricao:
 *                         type: string
 *                   titulo:
 *                     type: string
 *                     example: "Fase 1"
 *                   descricao:
 *                     type: string
 *                     example: "Introdução aos conceitos básicos"
 *                   ordem:
 *                     type: number
 *                     example: 1
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, listarFases);

/**
 * @swagger
 * /api/fases:
 *   post:
 *     summary: Cria uma nova fase vinculada a uma trilha
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
 *                 example: "671f23a8bc12ab3456f90e12"
 *               titulo:
 *                 type: string
 *                 example: "Fase 1"
 *               descricao:
 *                 type: string
 *                 example: "Introdução aos conceitos básicos"
 *               ordem:
 *                 type: number
 *                 example: 1
 *               perguntas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     enunciado:
 *                       type: string
 *                     alternativas:
 *                       type: array
 *                       items:
 *                         type: string
 *                     respostaCorreta:
 *                       type: string
 *     responses:
 *       201:
 *         description: Fase criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Trilha não encontrada
 */
router.post("/", verificarToken, criarFase);

/**
 * @swagger
 * /api/fases/trilha/{trilhaId}:
 *   get:
 *     summary: Busca todas as fases de uma trilha específica
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
 *       404:
 *         description: Trilha não encontrada
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/trilha/:trilhaId", verificarToken, buscarFasesPorTrilha);

/**
 * @swagger
 * /api/fases/{id}:
 *   get:
 *     summary: Busca uma fase pelo ID
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
 *       404:
 *         description: Fase não encontrada
 *       401:
 *         description: Token ausente ou inválido
 *   put:
 *     summary: Atualiza uma fase pelo ID
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
 *               titulo:
 *                 type: string
 *               descricao:
 *                 type: string
 *               ordem:
 *                 type: number
 *               perguntas:
 *                 type: array
 *     responses:
 *       200:
 *         description: Fase atualizada com sucesso
 *       404:
 *         description: Fase não encontrada
 *       401:
 *         description: Token ausente ou inválido
 *   delete:
 *     summary: Deleta uma fase pelo ID
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
 *       404:
 *         description: Fase não encontrada
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/:id", verificarToken, buscarFasePorId);
router.put("/:id", verificarToken, atualizarFase);
router.delete("/:id", verificarToken, deletarFase);

export default router;
