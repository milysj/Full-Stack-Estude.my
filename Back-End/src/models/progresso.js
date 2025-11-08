import mongoose from "mongoose";

const progressoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    faseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fase",
      required: true,
    },
    trilhaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trilha",
      required: true,
    },
    pontuacao: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPerguntas: {
      type: Number,
      required: true,
    },
    porcentagemAcertos: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    xpGanho: {
      type: Number,
      required: true,
      default: 0,
    },
    concluido: {
      type: Boolean,
      default: false,
    },
    respostasUsuario: {
      type: [Number],
      default: [],
    },
    // Rastrear quais perguntas foram respondidas (índices)
    perguntasRespondidas: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true }
);

// Índice único para evitar duplicatas (um usuário só pode completar uma fase uma vez)
progressoSchema.index({ userId: 1, faseId: 1 }, { unique: true });

export default mongoose.model("Progresso", progressoSchema);

