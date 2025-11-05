import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  salvarTrilha,
  removerTrilhaSalva,
  listarTrilhasSalvas,
  verificarSeSalva,
} from "../controllers/licaoSalvaController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Lições Salvas
 *   description: Rotas para salvar e gerenciar trilhas favoritas do usuário
 */

/**
 * @swagger
 * /api/licoes-salvas:
 *   post:
 *     summary: Salva uma trilha como favorita
 *     tags: [Lições Salvas]
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
 *             properties:
 *               trilhaId:
 *                 type: string
 *                 description: ID da trilha a ser salva
 *                 example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       201:
 *         description: Trilha salva com sucesso
 *       400:
 *         description: Trilha já está salva ou dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post("/", verificarToken, salvarTrilha);

/**
 * @swagger
 * /api/licoes-salvas/{trilhaId}:
 *   delete:
 *     summary: Remove uma trilha das favoritas
 *     tags: [Lições Salvas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser removida
 *     responses:
 *       200:
 *         description: Trilha removida com sucesso
 *       404:
 *         description: Trilha não encontrada nas favoritas
 *       401:
 *         description: Token ausente ou inválido
 */
router.delete("/:trilhaId", verificarToken, removerTrilhaSalva);

/**
 * @swagger
 * /api/licoes-salvas:
 *   get:
 *     summary: Lista todas as trilhas salvas pelo usuário
 *     tags: [Lições Salvas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trilhas salvas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   trilhaId:
 *                     type: string
 *                   trilha:
 *                     type: object
 *                     description: Dados completos da trilha
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/", verificarToken, listarTrilhasSalvas);

/**
 * @swagger
 * /api/licoes-salvas/verificar/{trilhaId}:
 *   get:
 *     summary: Verifica se uma trilha está salva pelo usuário
 *     tags: [Lições Salvas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: trilhaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da trilha a ser verificada
 *     responses:
 *       200:
 *         description: Status da trilha verificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salva:
 *                   type: boolean
 *                   description: Indica se a trilha está salva
 *       401:
 *         description: Token ausente ou inválido
 */
router.get("/verificar/:trilhaId", verificarToken, verificarSeSalva);

export default router;

