import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

import swaggerDocs from "./swagger.js";

swaggerDocs(app);

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Conectar ao banco de dados e iniciar servidor
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

startServer();
