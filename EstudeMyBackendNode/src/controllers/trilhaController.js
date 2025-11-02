import Trilha from "../models/trilha.js";

// Cria uma nova trilha
export const criarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });

    // dataCriacao é obrigatória no schema
    const dataCriacao = new Date().toISOString().split("T")[0];

    const trilha = new Trilha({
      ...req.body,
      usuario: userId,
      dataCriacao,
      usuariosIniciaram: [],
      visualizacoes: 0,
    });

    await trilha.save();
    res.status(201).json(trilha);
  } catch (error) {
    console.error("Erro ao criar trilha:", error);
    res.status(500).json({ message: "Erro ao criar trilha" });
  }
};

// Lista todas as trilhas do usuário autenticado
export const listarTrilhas = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });

    const trilhas = await Trilha.find({ usuario: userId }).sort({ createdAt: -1 });
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao listar trilhas:", error);
    res.status(500).json({ message: "Erro ao listar trilhas" });
  }
};

// Atualiza uma trilha existente
export const atualizarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const trilha = await Trilha.findOneAndUpdate(
      { _id: id, usuario: userId },
      req.body,
      { new: true }
    );

    if (!trilha) return res.status(404).json({ message: "Trilha não encontrada" });

    res.json(trilha);
  } catch (error) {
    console.error("Erro ao atualizar trilha:", error);
    res.status(500).json({ message: "Erro ao atualizar trilha" });
  }
};

// Deleta uma trilha
export const deletarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const trilha = await Trilha.findOneAndDelete({ _id: id, usuario: userId });
    if (!trilha) return res.status(404).json({ message: "Trilha não encontrada" });

    res.json({ message: "Trilha excluída com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar trilha:", error);
    res.status(500).json({ message: "Erro ao deletar trilha" });
  }
};

// Retorna as trilhas que o usuário ainda não iniciou
export const trilhasNovidades = async (req, res) => {
  try {
    const userId = req.user._id;
    const trilhas = await Trilha.find({ usuariosIniciaram: { $ne: userId } })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao buscar novidades:", error);
    res.status(500).json({ message: "Erro ao buscar novidades" });
  }
};

// Retorna as trilhas mais populares (por visualizações)
export const trilhasPopulares = async (req, res) => {
  try {
    const trilhas = await Trilha.find()
      .sort({ visualizacoes: -1 })
      .limit(10);
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao buscar trilhas populares:", error);
    res.status(500).json({ message: "Erro ao buscar populares" });
  }
};

// Retorna as trilhas que o usuário já iniciou
export const trilhasContinue = async (req, res) => {
  try {
    const userId = req.user._id;
    const trilhas = await Trilha.find({ usuariosIniciaram: userId })
      .sort({ updatedAt: -1 })
      .limit(10);
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao buscar trilhas em andamento:", error);
    res.status(500).json({ message: "Erro ao buscar trilhas iniciadas" });
  }
};

// Registra que o usuário iniciou uma trilha
export const iniciarTrilha = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trilhaId } = req.params;

    if (!trilhaId) {
      return res.status(400).json({ message: "trilhaId é obrigatório" });
    }

    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    // Verificar se o usuário já está no array (evitar duplicatas)
    if (!trilha.usuariosIniciaram) {
      trilha.usuariosIniciaram = [];
    }

    if (!trilha.usuariosIniciaram.includes(userId)) {
      trilha.usuariosIniciaram.push(userId);
      await trilha.save();
    }

    res.json({ message: "Trilha iniciada com sucesso", trilha });
  } catch (error) {
    console.error("Erro ao iniciar trilha:", error);
    res.status(500).json({ message: "Erro ao iniciar trilha" });
  }
};