import express from "express";
import { verificarToken } from "../middlewares/authMiddleware.js";
import {
  salvarTrilha,
  removerTrilhaSalva,
  listarTrilhasSalvas,
  verificarSeSalva,
} from "../controllers/licaoSalvaController.js";

const router = express.Router();

// Todas as rotas requerem autenticação
router.post("/", verificarToken, salvarTrilha);
router.delete("/:trilhaId", verificarToken, removerTrilhaSalva);
router.get("/", verificarToken, listarTrilhasSalvas);
router.get("/verificar/:trilhaId", verificarToken, verificarSeSalva);

export default router;

