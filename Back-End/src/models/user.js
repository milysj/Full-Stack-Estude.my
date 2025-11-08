import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Email inválido"],
    },
    senha: { type: String, required: true },
    dataNascimento: { type: Date, required: true },

    tipoUsuario: {
      type: String,
      enum: ["ALUNO", "PROFESSOR"],
      required: true,
    },

    // Campos de perfil
    username: { type: String, default: "" },
    personagem: { 
      type: String, 
      enum: ["", "Guerreiro", "Mago", "Samurai"], 
      required: false,   // 👈 torna opcional no cadastro
      default: ""        // 👈 evita erro de enum ao salvar vazio
    },
    fotoPerfil: { type: String, default: "" },

    materiaFavorita: { type: String, default: "" },
    xpTotal: { type: Number, default: 0 },
    trilhasIniciadas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trilha" }],
    trilhasConcluidas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trilha" }],
    
    // Campos opcionais de dados pessoais
    telefone: { type: String, default: "" },
    endereco: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
