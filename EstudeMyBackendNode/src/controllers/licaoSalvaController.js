import LicaoSalva from "../models/licaoSalva.js";
import Trilha from "../models/trilha.js";

// Salvar trilha (lição)
export const salvarTrilha = async (req, res) => {
  try {
    console.log("=== Iniciando salvamento de trilha ===");
    console.log("User ID:", req.user?._id);
    console.log("Body:", req.body);
    
    const userId = req.user._id;
    const { trilhaId } = req.body;

    if (!trilhaId) {
      console.error("trilhaId não fornecido");
      return res.status(400).json({ message: "trilhaId é obrigatório" });
    }

    console.log("Buscando trilha:", trilhaId);
    // Verificar se a trilha existe
    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      console.error("Trilha não encontrada:", trilhaId);
      return res.status(404).json({ message: "Trilha não encontrada" });
    }
    console.log("Trilha encontrada:", trilha.titulo);

    // Verificar se já está salva
    console.log("Verificando se já está salva...");
    const jaSalva = await LicaoSalva.findOne({ usuario: userId, trilha: trilhaId });
    if (jaSalva) {
      console.log("Trilha já está salva");
      return res.status(400).json({ message: "Trilha já está salva" });
    }

    // Salvar
    console.log("Criando registro de lição salva...");
    const licaoSalva = await LicaoSalva.create({
      usuario: userId,
      trilha: trilhaId,
    });

    console.log("Lição salva criada com sucesso:", licaoSalva._id);
    res.status(201).json({ message: "Trilha salva com sucesso", licaoSalva });
  } catch (error) {
    console.error("Erro ao salvar trilha:", error);
    console.error("Stack:", error.stack);
    if (error.code === 11000) {
      // Duplicata
      console.error("Erro de duplicata (11000)");
      return res.status(400).json({ message: "Trilha já está salva" });
    }
    res.status(500).json({ message: "Erro ao salvar trilha", error: error.message });
  }
};

// Remover trilha salva
export const removerTrilhaSalva = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trilhaId } = req.params;

    const licaoSalva = await LicaoSalva.findOneAndDelete({
      usuario: userId,
      trilha: trilhaId,
    });

    if (!licaoSalva) {
      return res.status(404).json({ message: "Trilha não estava salva" });
    }

    res.json({ message: "Trilha removida das salvas com sucesso" });
  } catch (error) {
    console.error("Erro ao remover trilha salva:", error);
    res.status(500).json({ message: "Erro ao remover trilha salva", error: error.message });
  }
};

// Listar trilhas salvas do usuário
export const listarTrilhasSalvas = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("Listando trilhas salvas para usuário:", userId);

    const licoesSalvas = await LicaoSalva.find({ usuario: userId })
      .populate({
        path: "trilha",
        select: "titulo descricao materia dificuldade imagem usuario",
        populate: {
          path: "usuario",
          select: "nome username",
        },
      })
      .sort({ createdAt: -1 });

    console.log("Lições salvas encontradas:", licoesSalvas.length);

    // Extrair apenas as trilhas
    const trilhas = licoesSalvas.map((ls) => ls.trilha).filter((t) => t !== null);

    console.log("Trilhas filtradas:", trilhas.length);
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao listar trilhas salvas:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ message: "Erro ao listar trilhas salvas", error: error.message });
  }
};

// Verificar se uma trilha está salva
export const verificarSeSalva = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trilhaId } = req.params;

    const licaoSalva = await LicaoSalva.findOne({
      usuario: userId,
      trilha: trilhaId,
    });

    res.json({ salva: !!licaoSalva });
  } catch (error) {
    console.error("Erro ao verificar se trilha está salva:", error);
    res.status(500).json({ message: "Erro ao verificar", error: error.message });
  }
};

