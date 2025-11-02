import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import trilhaRoutes from "./routes/trilhaRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import perfilRoutes from "./routes/perfilRoutes.js";
import faseRoutes from "./routes/faseRoutes.js";
import progressoRoutes from "./routes/progressoRoutes.js";
import rankingRoutes from "./routes/rankingRoutes.js";
import licaoSalvaRoutes from "./routes/licaoSalvaRoutes.js";

import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/trilhas", trilhaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/home", homeRoutes);
app.use("/api", perfilRoutes);
app.use("/api/fases", faseRoutes);
app.use("/api/progresso", progressoRoutes);
app.use("/api/ranking", rankingRoutes);
app.use("/api/licoes-salvas", licaoSalvaRoutes);

// Middleware de erros
app.use(errorHandler);

export default app;


