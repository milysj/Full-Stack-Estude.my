// src/controllers/userController.js
import User from "../models/user.js";

export const criarPerfil = async (req, res) => {
  try {
    const { username, personagem, fotoPerfil: fotoBody } = req.body;

    let fotoPerfil;

    // Se enviou arquivo via upload
    if (req.file) {
      fotoPerfil = `/uploads/${req.file.filename}`;
    } else if (fotoBody) {
      fotoPerfil = fotoBody;
    }

    if (!username || !personagem || !fotoPerfil) {
      return res.status(400).json({ message: "Personagem, username e foto são obrigatórios!" });
    }

    const usuario = await User.findById(req.user._id);
    usuario.username = username;
    usuario.personagem = personagem;
    usuario.fotoPerfil = fotoPerfil;

    await usuario.save();

    res.json({ message: "Perfil criado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil." });
  }

  const personagensValidos = ["Guerreiro", "Mago", "Samurai"];
if (!personagensValidos.includes(personagem)) {
  return res.status(400).json({ message: "Personagem inválido." });
}
};
