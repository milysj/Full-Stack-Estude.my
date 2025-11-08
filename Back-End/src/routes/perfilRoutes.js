import express from "express";
import { criarPerfil } from "../controllers/perfilController.js";
import { verificarToken } from "../middlewares/authMiddleware.js";


const router = express.Router();


export default router;
