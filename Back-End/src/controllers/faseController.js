import Fase from "../models/fase.js";
import Trilha from "../models/trilha.js";

// Criar fase
export const criarFase = async (req, res) => {
  try {
    const { trilhaId, titulo, descricao, conteudo, ordem, perguntas } = req.body;

    // Validação: trilhaId é obrigatório
    if (!trilhaId) {
      return res.status(400).json({ message: "trilhaId é obrigatório" });
    }

    // Verificar se a trilha existe
    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    // Validação: ordem é obrigatória
    if (ordem === undefined || ordem === null) {
      return res.status(400).json({ message: "ordem é obrigatória" });
    }

    const novaFase = await Fase.create({
      trilhaId,
      titulo,
      descricao,
      conteudo: conteudo || "",
      ordem,
      perguntas: perguntas || [],
    });

    // Popular a referência da trilha ao retornar
    const fasePopulada = await Fase.findById(novaFase._id).populate("trilhaId", "titulo descricao materia");
    
    res.status(201).json(fasePopulada);
  } catch (error) {
    console.error("Erro ao criar fase:", error);
    res.status(500).json({ message: "Erro ao criar fase", error: error.message });
  }
};

// Listar fases (com filtro opcional por trilhaId)
export const listarFases = async (req, res) => {
  try {
    const { trilhaId } = req.query;
    
    let query = {};
    if (trilhaId) {
      query.trilhaId = trilhaId;
    }

    const fases = await Fase.find(query)
      .populate("trilhaId", "titulo descricao materia")
      .sort({ ordem: 1, createdAt: -1 });
    
    res.json(fases);
  } catch (error) {
    console.error("Erro ao buscar fases:", error);
    res.status(500).json({ message: "Erro ao buscar fases", error: error.message });
  }
};

// Buscar fase por ID
export const buscarFasePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const fase = await Fase.findById(id).populate("trilhaId", "titulo descricao materia");
    
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }
    
    res.json(fase);
  } catch (error) {
    console.error("Erro ao buscar fase:", error);
    res.status(500).json({ message: "Erro ao buscar fase", error: error.message });
  }
};

// Buscar fases por trilhaId
export const buscarFasesPorTrilha = async (req, res) => {
  try {
    const { trilhaId } = req.params;
    
    // Verificar se a trilha existe
    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    const fases = await Fase.find({ trilhaId })
      .populate("trilhaId", "titulo descricao materia")
      .sort({ ordem: 1 });

    res.json(fases);
  } catch (error) {
    console.error("Erro ao buscar fases da trilha:", error);
    res.status(500).json({ message: "Erro ao buscar fases da trilha", error: error.message });
  }
};

// Atualizar fase (administradores podem atualizar qualquer fase)
export const atualizarFase = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;
    const { id } = req.params;
    const { trilhaId, titulo, descricao, conteudo, ordem, perguntas } = req.body;

    // Buscar a fase atual para verificar permissões
    const faseAtual = await Fase.findById(id);
    if (!faseAtual) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Se não for administrador, verificar se a fase pertence a uma trilha do professor
    if (tipoUsuario !== "ADMINISTRADOR") {
      const trilha = await Trilha.findById(faseAtual.trilhaId);
      if (!trilha || trilha.usuario.toString() !== userId.toString()) {
        return res.status(403).json({ 
          message: "Acesso negado. Você só pode editar fases das suas próprias trilhas." 
        });
      }
    }

    // Se trilhaId for fornecido, validar se existe
    if (trilhaId) {
      const trilha = await Trilha.findById(trilhaId);
      if (!trilha) {
        return res.status(404).json({ message: "Trilha não encontrada" });
      }
      
      // Se não for administrador, verificar se a nova trilha também pertence ao professor
      if (tipoUsuario !== "ADMINISTRADOR" && trilha.usuario.toString() !== userId.toString()) {
        return res.status(403).json({ 
          message: "Acesso negado. Você só pode mover fases para suas próprias trilhas." 
        });
      }
    }

    const faseAtualizada = await Fase.findByIdAndUpdate(
      id,
      { trilhaId, titulo, descricao, conteudo, ordem, perguntas },
      { new: true, runValidators: true }
    ).populate("trilhaId", "titulo descricao materia");

    if (!faseAtualizada) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    res.json(faseAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar fase:", error);
    res.status(500).json({ message: "Erro ao atualizar fase", error: error.message });
  }
};

// Deletar fase (administradores podem deletar qualquer fase)
export const deletarFase = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;
    const { id } = req.params;

    // Buscar a fase para verificar permissões
    const fase = await Fase.findById(id);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Se não for administrador, verificar se a fase pertence a uma trilha do professor
    if (tipoUsuario !== "ADMINISTRADOR") {
      const trilha = await Trilha.findById(fase.trilhaId);
      if (!trilha || trilha.usuario.toString() !== userId.toString()) {
        return res.status(403).json({ 
          message: "Acesso negado. Você só pode deletar fases das suas próprias trilhas." 
        });
      }
    }

    const deletada = await Fase.findByIdAndDelete(id);
    
    if (!deletada) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }
    
    res.json({ message: "Fase deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar fase:", error);
    res.status(500).json({ message: "Erro ao deletar fase", error: error.message });
  }
};
