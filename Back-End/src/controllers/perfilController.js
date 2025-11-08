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

    const usernameTrimmed = username.trim();

    // Verifica se o username já existe em outro usuário
    const usuarioComUsername = await User.findOne({ 
      username: usernameTrimmed,
      _id: { $ne: req.user._id } // Exclui o próprio usuário da busca
    });
    
    if (usuarioComUsername) {
      return res.status(409).json({
        message: "Username já está em uso. Por favor, escolha outro username.",
      });
    }

    const usuario = await User.findById(req.user._id);
    usuario.username = usernameTrimmed;
    usuario.personagem = personagem;
    usuario.fotoPerfil = fotoPerfil;

    // Valida se o personagem é válido
    const personagensValidos = ["Guerreiro", "Mago", "Samurai"];
    if (!personagensValidos.includes(personagem)) {
      return res.status(400).json({ message: "Personagem inválido." });
    }

    try {
      await usuario.save();
    } catch (error) {
      // Captura erro de duplicata do MongoDB (caso a verificação acima não tenha pego)
      if (error.code === 11000 && error.keyPattern?.username) {
        return res.status(409).json({
          message: "Username já está em uso. Por favor, escolha outro username.",
        });
      }
      throw error; // Re-lança outros erros
    }

    // Busca o usuário atualizado sem campos sensíveis
    const usuarioRetorno = await User.findById(req.user._id)
      .select("-senha -email -dataNascimento");

    res.json({ 
      message: "Perfil criado com sucesso!",
      usuario: usuarioRetorno 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar perfil." });
  }
};
