import express from "express";
import cors from "cors";
import scoreRoutes from "./routes/scoreRoutes.js";
import swaggerDocs from "./swagger.js";

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
      "http://localhost:5000", // Backend principal
      "https://estude-my.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean);
    
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

// Rota de health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SCORE",
    message: "Microsserviço SCORE está funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.json({
    message: "Microsserviço SCORE está rodando",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      score: "/api/score",
    },
  });
});

// Rotas
app.use("/api/score", scoreRoutes);

// Swagger Documentation
swaggerDocs(app);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error("[SCORE] Erro:", err);
  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor",
    service: "SCORE",
  });
});

export default app;

