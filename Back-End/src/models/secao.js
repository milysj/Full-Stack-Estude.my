// src/models/secao.js
import mongoose from "mongoose";

const secaoSchema = new mongoose.Schema(
  {
    trilhaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trilha",
      required: true,
    },
    titulo: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
      default: "",
    },
    ordem: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Índice para melhorar performance nas buscas por trilhaId
secaoSchema.index({ trilhaId: 1, ordem: 1 });

export default mongoose.model("Secao", secaoSchema);



