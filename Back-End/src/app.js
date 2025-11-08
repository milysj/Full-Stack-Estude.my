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

// Configuração CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Lista de origens permitidas
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://estudemy.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean); // Remove valores undefined/null
    
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Temporariamente permitir todas por desenvolvimento
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares globais
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de health check para o Render
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Servidor está funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "API Estude.My está rodando",
    version: "1.0.0",
    endpoints: {
      docs: "/api-docs",
      health: "/health",
    },
  });
});

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


