import Trilha from "../models/trilha.js";
import mongoose from "mongoose";

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

    // Para administradores, popular dados do usuário; para professores, não precisa
    let trilhasQuery = Trilha.find(query)
      .select("-usuariosIniciaram"); // Remove o campo usuariosIniciaram do retorno
    
    if (tipoUsuario === "ADMINISTRADOR") {
      trilhasQuery = trilhasQuery.populate({
        path: "usuario",
        select: "nome username email tipoUsuario" // Dados do usuário que criou a trilha
      });
    }
    
    const trilhas = await trilhasQuery.sort({ createdAt: -1 });
    
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

// Busca trilhas por termo (título, descrição, matéria)
// ADMINISTRADOR vê todas as trilhas (mesma lógica do gerenciarTrilha)
// Outros usuários veem apenas trilhas públicas
export const buscarTrilhas = async (req, res) => {
  try {
    const { q, materia } = req.query; // Termo de busca e filtro de matéria
    const userId = req.user?._id; // Usuário autenticado (opcional)
    const tipoUsuario = req.user?.tipoUsuario; // Tipo de usuário (opcional)

    const termoBusca = q ? q.trim() : "";
    console.log("Buscando trilhas com termo:", termoBusca || "(vazio)");
    console.log("Filtro de matéria:", materia);
    console.log("Usuário autenticado:", userId, "Tipo:", tipoUsuario);
    
    // Condição de busca por termo (título, descrição, matéria) - só aplica se houver termo
    let condicaoBusca = {};
    if (termoBusca && termoBusca !== "") {
      condicaoBusca = {
        $or: [
          { titulo: { $regex: termoBusca, $options: "i" } },
          { descricao: { $regex: termoBusca, $options: "i" } },
          { materia: { $regex: termoBusca, $options: "i" } },
        ],
      };
    }
    
    // ADMINISTRADOR vê todas as trilhas, sem filtro de disponibilidade (mesma lógica do gerenciarTrilha)
    // ALUNO e PROFESSOR autenticados veem todas as trilhas (mesma lógica da home - novidades e populares)
    // Usuário não autenticado vê apenas trilhas públicas
    let query;
    
    // Construir condições do $and
    const conditions = [];
    
    // Condição de disponibilidade para usuários não autenticados
    if (!userId) {
      conditions.push({ disponibilidade: "Aberto" });
    }
    
    // Condição de busca por termo (se houver)
    if (termoBusca && termoBusca !== "") {
      conditions.push(condicaoBusca);
    }
    
    // Aplicar filtro de matéria se fornecido
    if (materia && materia.trim() !== "" && materia !== "Todas") {
      conditions.push({ materia: { $regex: materia.trim(), $options: "i" } });
    }
    
    // Construir query final
    if (conditions.length > 0) {
      query = conditions.length === 1 ? conditions[0] : { $and: conditions };
    } else {
      // Se não houver condições, retornar todas as trilhas (conforme permissões)
      query = {};
    }
    
    console.log("Query de busca:", JSON.stringify(query, null, 2));
    
    // Para ADMINISTRADOR, popular dados do usuário (mesma lógica do gerenciarTrilha)
    let trilhasQuery = Trilha.find(query)
      .select("-usuariosIniciaram"); // Remove o campo usuariosIniciaram do retorno
    
    if (tipoUsuario === "ADMINISTRADOR") {
      trilhasQuery = trilhasQuery.populate({
        path: "usuario",
        select: "nome username email tipoUsuario", // Dados do usuário que criou a trilha
      });
    } else {
      trilhasQuery = trilhasQuery.populate({
        path: "usuario",
        select: "nome username", // Dados básicos do usuário que criou a trilha
      });
    }
    
    const trilhas = await trilhasQuery.sort({ visualizacoes: -1, createdAt: -1 });

    console.log(`Encontradas ${trilhas.length} trilhas para o termo "${termoBusca}"`);
    
    // Log para debug: mostrar total de trilhas no banco e por disponibilidade
    const totalTrilhas = await Trilha.countDocuments({});
    const trilhasPublicas = await Trilha.countDocuments({ disponibilidade: "Aberto" });
    const trilhasPrivadas = await Trilha.countDocuments({ disponibilidade: "Privado" });
    console.log(`Total de trilhas no banco: ${totalTrilhas} (Públicas: ${trilhasPublicas}, Privadas: ${trilhasPrivadas})`);

    res.json(trilhas);
  } catch (error) {
    console.error("Erro ao buscar trilhas:", error);
    res.status(500).json({ message: "Erro ao buscar trilhas", error: error.message });
  }
};

// Busca uma trilha por ID
export const buscarTrilhaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const tipoUsuario = req.user?.tipoUsuario;

    console.log(`[buscarTrilhaPorId] Buscando trilha com ID: ${id}`);

    if (!id) {
      return res.status(400).json({ message: "ID da trilha é obrigatório" });
    }

    // Validar formato do ID do MongoDB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[buscarTrilhaPorId] ID inválido: ${id}`);
      return res.status(400).json({ message: "ID da trilha inválido" });
    }

    // Popular dados do usuário criador baseado no tipo de usuário
    let trilhaQuery = Trilha.findById(id).select("-usuariosIniciaram");

    if (tipoUsuario === "ADMINISTRADOR") {
      trilhaQuery = trilhaQuery.populate({
        path: "usuario",
        select: "nome username email tipoUsuario",
      });
    } else {
      trilhaQuery = trilhaQuery.populate({
        path: "usuario",
        select: "nome username",
      });
    }

    const trilha = await trilhaQuery;

    if (!trilha) {
      console.log(`[buscarTrilhaPorId] Trilha não encontrada no banco: ${id}`);
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    console.log(`[buscarTrilhaPorId] Trilha encontrada: ${trilha._id}`);

    // Converter para objeto para poder remover campos
    const trilhaResponse = trilha.toObject();
    delete trilhaResponse.usuariosIniciaram;

    res.json(trilhaResponse);
  } catch (error) {
    console.error("Erro ao buscar trilha:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "ID da trilha inválido" });
    }
    res.status(500).json({ message: "Erro ao buscar trilha", error: error.message });
  }
};

// Incrementa visualizações de uma trilha
export const visualizarTrilha = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "ID da trilha é obrigatório" });
    }

    const trilha = await Trilha.findById(id);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    // Incrementa visualizações
    trilha.visualizacoes = (trilha.visualizacoes || 0) + 1;
    await trilha.save();

    res.json({
      message: "Visualização registrada",
      visualizacoes: trilha.visualizacoes,
    });
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
    res.status(500).json({ message: "Erro ao registrar visualização" });
  }
};