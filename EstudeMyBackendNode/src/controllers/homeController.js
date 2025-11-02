import Trilha from "../models/trilha.js";

export const getHomeData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Novidades – últimas 10 trilhas
    const novidades = await Trilha.find().sort({ dataCriacao: -1 }).limit(10);

    // Populares – mais acessadas
    const populares = await Trilha.find().sort({ acessos: -1 }).limit(10);

    // Continue – trilhas iniciadas pelo usuário
    const continueTrilhas = await Trilha.find({ usuariosIniciaram: userId }).limit(10);

    res.json({
      usuario: {
        nome: req.user.nome,
        materiaFavorita: req.user.materiaFavorita,
        personagem: req.user.personagem,
        fotoPerfil: req.user.fotoPerfil,
      },
      trilhas: {
        novidades,
        populares,
        continue: continueTrilhas,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Erro ao carregar home", error: err.message });
  }
};
