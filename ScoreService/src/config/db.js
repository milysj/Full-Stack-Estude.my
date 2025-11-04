import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI não definida nas variáveis de ambiente");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ [SCORE] MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 [SCORE] Database: ${conn.connection.name}`);
    
    // Tratamento de eventos de conexão
    mongoose.connection.on("error", (err) => {
      console.error(`❌ [SCORE] Erro na conexão MongoDB: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ [SCORE] MongoDB desconectado");
    });

    return conn;
  } catch (error) {
    console.error(`❌ [SCORE] Erro ao conectar ao MongoDB: ${error.message}`);
    throw error;
  }
};

