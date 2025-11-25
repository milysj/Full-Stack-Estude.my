// src/controllers/secaoController.js
import Secao from "../models/secao.js";
import Trilha from "../models/trilha.js";
import mongoose from "mongoose";

/**
 * Lista todas as seções (opcionalmente filtradas por trilhaId)
 */
export const listarSecoes = async (req, res) => {
  try {
    const { trilhaId } = req.query;
    const query = {};

    if (trilhaId) {
      if (!mongoose.Types.ObjectId.isValid(trilhaId)) {
        return res.status(400).json({ message: "ID da trilha inválido" });
      }
      query.trilhaId = trilhaId;
    }

    const secoes = await Secao.find(query)
      .sort({ ordem: 1, createdAt: 1 })
      .populate({
        path: "trilhaId",
        select: "titulo descricao materia",
      });

    res.json(secoes);
  } catch (error) {
    console.error("Erro ao listar seções:", error);
    res.status(500).json({ message: "Erro ao listar seções", error: error.message });
  }
};

/**
 * Busca seções por trilha
 */
export const buscarSecoesPorTrilha = async (req, res) => {
  try {
    const { trilhaId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(trilhaId)) {
      return res.status(400).json({ message: "ID da trilha inválido" });
    }

    // Verifica se a trilha existe
    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    const secoes = await Secao.find({ trilhaId })
      .sort({ ordem: 1, createdAt: 1 });

    res.json(secoes);
  } catch (error) {
    console.error("Erro ao buscar seções por trilha:", error);
    res.status(500).json({ message: "Erro ao buscar seções", error: error.message });
  }
};

/**
 * Busca uma seção por ID
 */
export const buscarSecaoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID da seção inválido" });
    }

    const secao = await Secao.findById(id).populate({
      path: "trilhaId",
      select: "titulo descricao materia",
    });

    if (!secao) {
      return res.status(404).json({ message: "Seção não encontrada" });
    }

    res.json(secao);
  } catch (error) {
    console.error("Erro ao buscar seção:", error);
    res.status(500).json({ message: "Erro ao buscar seção", error: error.message });
  }
};

/**
 * Cria uma nova seção
 */
export const criarSecao = async (req, res) => {
  try {
    const userId = req.user._id;
    const tipoUsuario = req.user.tipoUsuario;
    const { trilhaId, titulo, descricao, ordem } = req.body;

    if (!trilhaId || !titulo || ordem === undefined) {
      return res.status(400).json({ message: "TrilhaId, título e ordem são obrigatórios" });
    }

    if (!mongoose.Types.ObjectId.isValid(trilhaId)) {
      return res.status(400).json({ message: "ID da trilha inválido" });
    }

    // Verifica se a trilha existe
    const trilha = await Trilha.findById(trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha não encontrada" });
    }

    // Apenas o criador da trilha ou um administrador pode criar seções
    if (trilha.usuario.toString() !== userId.toString() && tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Você não tem permissão para criar seções nesta trilha.",
      });
    }

    // Verifica se já existe uma seção com a mesma ordem na mesma trilha
    const secaoExistente = await Secao.findOne({ trilhaId, ordem });
    if (secaoExistente) {
      return res.status(409).json({
        message: "Já existe uma seção com esta ordem nesta trilha",
      });
    }

    const novaSecao = await Secao.create({
      trilhaId,
      titulo,
      descricao: descricao || "",
      ordem,
    });

    res.status(201).json({
      message: "Seção criada com sucesso!",
      secao: novaSecao,
    });
  } catch (error) {
    console.error("Erro ao criar seção:", error);
    res.status(500).json({ message: "Erro ao criar seção", error: error.message });
  }
};

/**
 * Atualiza uma seção
 */
export const atualizarSecao = async (req, res) => {
  try {
    const userId = req.user._id;
    const tipoUsuario = req.user.tipoUsuario;
    const { id } = req.params;
    const { trilhaId, titulo, descricao, ordem } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID da seção inválido" });
    }

    const secao = await Secao.findById(id);
    if (!secao) {
      return res.status(404).json({ message: "Seção não encontrada" });
    }

    // Verifica permissão
    const trilha = await Trilha.findById(secao.trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha associada não encontrada" });
    }

    if (trilha.usuario.toString() !== userId.toString() && tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Você não tem permissão para atualizar esta seção.",
      });
    }

    // Se trilhaId foi fornecido, valida se existe
    if (trilhaId) {
      if (!mongoose.Types.ObjectId.isValid(trilhaId)) {
        return res.status(400).json({ message: "ID da trilha inválido" });
      }
      const novaTrilha = await Trilha.findById(trilhaId);
      if (!novaTrilha) {
        return res.status(404).json({ message: "Trilha não encontrada" });
      }
    }

    // Se ordem foi alterada, verifica conflito
    if (ordem !== undefined && ordem !== secao.ordem) {
      const secaoComOrdem = await Secao.findOne({
        trilhaId: trilhaId || secao.trilhaId,
        ordem,
        _id: { $ne: id },
      });
      if (secaoComOrdem) {
        return res.status(409).json({
          message: "Já existe uma seção com esta ordem nesta trilha",
        });
      }
    }

    // Atualiza apenas os campos fornecidos
    const camposAtualizar = {};
    if (trilhaId) camposAtualizar.trilhaId = trilhaId;
    if (titulo) camposAtualizar.titulo = titulo;
    if (descricao !== undefined) camposAtualizar.descricao = descricao;
    if (ordem !== undefined) camposAtualizar.ordem = ordem;

    const secaoAtualizada = await Secao.findByIdAndUpdate(id, camposAtualizar, {
      new: true,
      runValidators: true,
    });

    res.json({
      message: "Seção atualizada com sucesso!",
      secao: secaoAtualizada,
    });
  } catch (error) {
    console.error("Erro ao atualizar seção:", error);
    res.status(500).json({ message: "Erro ao atualizar seção", error: error.message });
  }
};

/**
 * Deleta uma seção
 */
export const deletarSecao = async (req, res) => {
  try {
    const userId = req.user._id;
    const tipoUsuario = req.user.tipoUsuario;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID da seção inválido" });
    }

    const secao = await Secao.findById(id);
    if (!secao) {
      return res.status(404).json({ message: "Seção não encontrada" });
    }

    // Verifica permissão
    const trilha = await Trilha.findById(secao.trilhaId);
    if (!trilha) {
      return res.status(404).json({ message: "Trilha associada não encontrada" });
    }

    if (trilha.usuario.toString() !== userId.toString() && tipoUsuario !== "ADMINISTRADOR") {
      return res.status(403).json({
        message: "Acesso negado. Você não tem permissão para deletar esta seção.",
      });
    }

    await Secao.findByIdAndDelete(id);

    res.json({ message: "Seção deletada com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar seção:", error);
    res.status(500).json({ message: "Erro ao deletar seção", error: error.message });
  }
};



