// src/models/Fase.js
import mongoose from "mongoose";

const perguntaSchema = new mongoose.Schema({
  enunciado: { type: String, required: true },
  alternativas: [{ type: String, required: true }],
  respostaCorreta: { type: String, required: true },
});

const faseSchema = new mongoose.Schema(
  {
    trilhaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trilha",
      required: true,
    },
    titulo: { type: String, required: true },
    descricao: { type: String },
    conteudo: { type: String, default: "" }, // Conteúdo da aula/explicação
    ordem: { type: Number, required: true },
    perguntas: [perguntaSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Fase", faseSchema);
