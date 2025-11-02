import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./config/db.js";

import swaggerDocs from "./swagger.js";


swaggerDocs(app);


const PORT = process.env.PORT || 5000;

connectDB();


app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
