import mongoose from "mongoose";

const licaoSalvaSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trilha: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trilha",
      required: true,
    },
  },
  { timestamps: true }
);

// Índice único para evitar duplicatas (um usuário só pode salvar uma trilha uma vez)
licaoSalvaSchema.index({ usuario: 1, trilha: 1 }, { unique: true });

export default mongoose.model("LicaoSalva", licaoSalvaSchema);

