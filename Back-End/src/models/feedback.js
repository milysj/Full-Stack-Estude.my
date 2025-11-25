import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Permite feedback anônimo
    },
    tipo: {
      type: String,
      enum: ["bug", "suggestion", "doubt", "praise", "other"],
      required: true,
    },
    avaliacao: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    sugestao: {
      type: String,
      default: "",
    },
    data: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);

