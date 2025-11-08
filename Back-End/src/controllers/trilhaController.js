import Trilha from "../models/trilha.js";

// Cria uma nova trilha
export const criarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });

    // dataCriacao é obrigatória no schema
    const dataCriacao = new Date().toISOString().split("T")[0];

    // Garantir que a imagem seja sempre definida
    const imagem = req.body.imagem || "/img/fases/vila.jpg";

    const trilha = new Trilha({
      ...req.body,
      usuario: userId,
      dataCriacao,
      imagem, // Garante que a imagem seja salva
      usuariosIniciaram: [],
      visualizacoes: 0,
    });

    await trilha.save();
    
    // Remover usuariosIniciaram do retorno
    const trilhaResponse = trilha.toObject();
    delete trilhaResponse.usuariosIniciaram;
    
    res.status(201).json(trilhaResponse);
  } catch (error) {
    console.error("Erro ao criar trilha:", error);
    res.status(500).json({ message: "Erro ao criar trilha" });
  }
};

// Lista todas as trilhas do usuário autenticado (ou todas se for ADMINISTRADOR)
export const listarTrilhas = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;
    if (!userId) return res.status(401).json({ message: "Usuário não autenticado" });

    // Administradores veem todas as trilhas, professores veem apenas as suas
    const query = tipoUsuario === "ADMINISTRADOR" ? {} : { usuario: userId };

    const trilhas = await Trilha.find(query)
      .select("-usuariosIniciaram") // Remove o campo usuariosIniciaram do retorno (o dono pode ver depois se precisar)
      .sort({ createdAt: -1 });
    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao listar trilhas:", error);
    res.status(500).json({ message: "Erro ao listar trilhas" });
  }
};

// Atualiza uma trilha existente (administradores podem atualizar qualquer trilha)
export const atualizarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;
    const { id } = req.params;

    // Garantir que a imagem seja sempre definida (ou mantém a atual se não fornecida)
    const dadosAtualizacao = { ...req.body };
    if (!dadosAtualizacao.imagem) {
      // Se não fornecer imagem, mantém a existente ou usa padrão
      const trilhaAtual = await Trilha.findById(id);
      dadosAtualizacao.imagem = trilhaAtual?.imagem || "/img/fases/vila.jpg";
    }

    // Administradores podem atualizar qualquer trilha, professores apenas as suas
    const query = tipoUsuario === "ADMINISTRADOR" 
      ? { _id: id }
      : { _id: id, usuario: userId };

    const trilha = await Trilha.findOneAndUpdate(
      query,
      dadosAtualizacao,
      { new: true }
    );

    if (!trilha) return res.status(404).json({ message: "Trilha não encontrada" });

    // Remover usuariosIniciaram do retorno
    const trilhaResponse = trilha.toObject();
    delete trilhaResponse.usuariosIniciaram;

    res.json(trilhaResponse);
  } catch (error) {
    console.error("Erro ao atualizar trilha:", error);
    res.status(500).json({ message: "Erro ao atualizar trilha" });
  }
};

// Deleta uma trilha (administradores podem deletar qualquer trilha)
export const deletarTrilha = async (req, res) => {
  try {
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;
    const { id } = req.params;

    // Administradores podem deletar qualquer trilha, professores apenas as suas
    const query = tipoUsuario === "ADMINISTRADOR"
      ? { _id: id }
      : { _id: id, usuario: userId };

    const trilha = await Trilha.findOneAndDelete(query);
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
      .select("-usuariosIniciaram") // Remove o campo usuariosIniciaram do retorno
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
      .select("-usuariosIniciaram") // Remove o campo usuariosIniciaram do retorno
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
      .select("-usuariosIniciaram") // Remove o campo usuariosIniciaram do retorno
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

    // Remover usuariosIniciaram do retorno
    const trilhaResponse = trilha.toObject();
    delete trilhaResponse.usuariosIniciaram;

    res.json({ message: "Trilha iniciada com sucesso", trilha: trilhaResponse });
  } catch (error) {
    console.error("Erro ao iniciar trilha:", error);
    res.status(500).json({ message: "Erro ao iniciar trilha" });
  }
};