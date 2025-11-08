import mongoose from "mongoose";

const resetTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 3600000), // Expira em 1 hora
      index: { expireAfterSeconds: 0 },
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ResetToken", resetTokenSchema);

