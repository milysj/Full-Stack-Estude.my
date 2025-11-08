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
 *     description: Adiciona uma trilha à lista de favoritas do usuário. Verifica se a trilha existe e se já não está salva.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trilha salva com sucesso"
 *                 licaoSalva:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     usuario:
 *                       type: string
 *                     trilha:
 *                       type: string
 *       400:
 *         description: Trilha já está salva ou dados inválidos (trilhaId ausente)
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
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/", verificarToken, salvarTrilha);

/**
 * @swagger
 * /api/licoes-salvas/{trilhaId}:
 *   delete:
 *     summary: Remove uma trilha das favoritas
 *     description: Remove uma trilha da lista de favoritas do usuário autenticado
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
 *         example: "671f23a8bc12ab3456f90e12"
 *     responses:
 *       200:
 *         description: Trilha removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Trilha removida das salvas com sucesso"
 *       404:
 *         description: Trilha não encontrada nas favoritas
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
router.delete("/:trilhaId", verificarToken, removerTrilhaSalva);

/**
 * @swagger
 * /api/licoes-salvas:
 *   get:
 *     summary: Lista todas as trilhas salvas pelo usuário
 *     description: Retorna todas as trilhas que o usuário autenticado salvou como favoritas, ordenadas por data de salvamento (mais recentes primeiro)
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
 *                 $ref: "#/components/schemas/Trilha"
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/", verificarToken, listarTrilhasSalvas);

/**
 * @swagger
 * /api/licoes-salvas/verificar/{trilhaId}:
 *   get:
 *     summary: Verifica se uma trilha está salva pelo usuário
 *     description: Verifica se uma trilha específica está na lista de favoritas do usuário autenticado
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
 *         example: "671f23a8bc12ab3456f90e12"
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
 *                   example: true
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/verificar/:trilhaId", verificarToken, verificarSeSalva);

export default router;

