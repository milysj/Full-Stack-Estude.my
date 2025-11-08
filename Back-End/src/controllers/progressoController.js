import Progresso from "../models/progresso.js";
import User from "../models/user.js";
import Fase from "../models/fase.js";

// URL do microsserviço SCORE
const SCORE_SERVICE_URL = process.env.SCORE_SERVICE_URL || "http://localhost:5001";

/**
 * Função helper para calcular XP (mantida para compatibilidade)
 * A lógica real está no microsserviço SCORE
 */
const calcularXP = (porcentagemAcertos) => {
  return Math.round((porcentagemAcertos / 100) * 500);
};

/**
 * Função helper para chamar o microsserviço SCORE
 * Retorna null se o serviço não estiver disponível (não lança erro)
 */
const chamarScoreService = async (endpoint, method = "GET", body = null, token = null) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 segundos

    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    };

    if (token) {
      // Se o token já contém "Bearer ", usar diretamente, senão adicionar
      if (token.startsWith("Bearer ")) {
        options.headers.Authorization = token;
      } else {
        options.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${SCORE_SERVICE_URL}${endpoint}`, options);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SCORE Service] Erro HTTP ${response.status} em ${endpoint}:`, errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Não lançar erro, apenas logar e retornar null
    if (error.name === "AbortError" || error.code === "ECONNREFUSED" || error.message.includes("fetch failed")) {
      console.warn(`[SCORE Service] Microsserviço não disponível (${SCORE_SERVICE_URL}). Sistema continuará funcionando sem atualização de XP.`);
    } else {
      console.error(`[SCORE Service] Erro ao chamar ${endpoint}:`, error.message);
    }
    return null;
  }
};

// Salvar resultado de uma fase completada
export const salvarResultado = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, pontuacao, totalPerguntas, respostasUsuario } = req.body;

    if (!faseId || pontuacao === undefined || !totalPerguntas) {
      return res.status(400).json({
        message: "faseId, pontuacao e totalPerguntas são obrigatórios",
      });
    }

    // Buscar fase para obter trilhaId
    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    const porcentagemAcertos = totalPerguntas > 0
      ? Math.round((pontuacao / totalPerguntas) * 100)
      : 0;
    
    const xpGanho = calcularXP(porcentagemAcertos);

    // Verificar se já existe progresso parcial
    let progresso = await Progresso.findOne({
      userId,
      faseId,
    });

    if (progresso && !progresso.concluido) {
      // Atualizar progresso existente
      progresso.pontuacao = pontuacao;
      progresso.totalPerguntas = totalPerguntas;
      progresso.porcentagemAcertos = porcentagemAcertos;
      progresso.xpGanho = xpGanho;
      progresso.concluido = true;
      progresso.respostasUsuario = respostasUsuario || progresso.respostasUsuario || [];
      progresso.perguntasRespondidas = Array.from({ length: totalPerguntas }, (_, i) => i);
      await progresso.save();
    } else if (!progresso) {
      // Criar novo registro de progresso
      progresso = await Progresso.create({
        userId,
        faseId,
        trilhaId: fase.trilhaId,
        pontuacao,
        totalPerguntas,
        porcentagemAcertos,
        xpGanho,
        concluido: true,
        respostasUsuario: respostasUsuario || [],
        perguntasRespondidas: Array.from({ length: totalPerguntas }, (_, i) => i),
      });
    } else if (progresso && progresso.concluido) {
      // Já está concluído
      return res.status(400).json({
        message: "Esta fase já foi completada anteriormente",
        progresso: progresso,
      });
    }

    // Chamar microsserviço SCORE para adicionar XP
    const authHeader = req.headers.authorization;
    const scoreData = await chamarScoreService(
      "/api/score/adicionar-xp",
      "POST",
      { xpGanho },
      authHeader
    );

    // Buscar dados atualizados do score do usuário
    let dadosNivel = null;
    if (scoreData && scoreData.score) {
      dadosNivel = {
        nivel: scoreData.score.nivel,
        xpAtual: scoreData.score.xpAtual,
        xpNecessario: scoreData.score.xpNecessario,
        xpAcumulado: scoreData.score.xpAcumulado,
      };
    } else {
      // Se o microsserviço não estiver disponível, usar valores padrão
      dadosNivel = {
        nivel: 1,
        xpAtual: 0,
        xpNecessario: 100,
        xpAcumulado: 0,
      };
    }

    // Buscar dados do usuário para resposta (sem dados sensíveis)
    const usuario = await User.findById(userId).select("-senha -email -dataNascimento");

    res.status(201).json({
      message: "Resultado salvo com sucesso",
      progresso,
      xpGanho,
      nivel: dadosNivel,
      usuario: {
        xpTotal: scoreData?.score?.xpTotal || 0,
        nivel: dadosNivel?.nivel || 1,
      },
    });
  } catch (error) {
    console.error("Erro ao salvar resultado:", error);
    res.status(500).json({ message: "Erro ao salvar resultado", error: error.message });
  }
};

// Salvar resposta individual de uma pergunta
export const salvarResposta = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId, perguntaIndex, resposta } = req.body;

    if (faseId === undefined || perguntaIndex === undefined || resposta === undefined) {
      return res.status(400).json({
        message: "faseId, perguntaIndex e resposta são obrigatórios",
      });
    }

    // Buscar fase para obter trilhaId
    const fase = await Fase.findById(faseId);
    if (!fase) {
      return res.status(404).json({ message: "Fase não encontrada" });
    }

    // Buscar ou criar progresso
    let progresso = await Progresso.findOne({
      userId,
      faseId,
    });

    if (!progresso) {
      // Criar novo progresso parcial
      progresso = await Progresso.create({
        userId,
        faseId,
        trilhaId: fase.trilhaId,
        pontuacao: 0,
        totalPerguntas: fase.perguntas?.length || 0,
        porcentagemAcertos: 0,
        xpGanho: 0,
        concluido: false,
        respostasUsuario: [],
        perguntasRespondidas: [],
      });
    }

    // Atualizar resposta específica
    const respostasArray = [...(progresso.respostasUsuario || [])];
    const perguntasRespondidas = [...(progresso.perguntasRespondidas || [])];

    // Garantir que o array tenha tamanho suficiente
    while (respostasArray.length <= perguntaIndex) {
      respostasArray.push(-1);
    }

    // Só atualizar se a pergunta ainda não foi respondida
    if (!perguntasRespondidas.includes(perguntaIndex)) {
      respostasArray[perguntaIndex] = resposta;
      perguntasRespondidas.push(perguntaIndex);

      progresso.respostasUsuario = respostasArray;
      progresso.perguntasRespondidas = perguntasRespondidas;
      
      // Recalcular pontuação baseada em todas as respostas salvas
      // Buscar a fase para obter as respostas corretas
      const fase = await Fase.findById(faseId);
      if (fase && fase.perguntas && Array.isArray(fase.perguntas)) {
        let pontuacaoAtual = 0;
        
        fase.perguntas.forEach((pergunta, index) => {
          if (index < respostasArray.length && respostasArray[index] >= 0) {
            // Obter resposta correta da pergunta
            let respostaCorreta = 0;
            if (typeof pergunta.respostaCorreta === "number") {
              respostaCorreta = pergunta.respostaCorreta;
            } else if (typeof pergunta.respostaCorreta === "string") {
              const parsed = parseInt(pergunta.respostaCorreta);
              if (!isNaN(parsed)) {
                respostaCorreta = parsed;
              } else {
                // Se for string, busca o índice da alternativa
                const idx = pergunta.alternativas?.findIndex(
                  (alt) => alt === pergunta.respostaCorreta
                );
                respostaCorreta = idx >= 0 ? idx : 0;
              }
            }
            
            // Comparar resposta do usuário com a correta
            if (respostasArray[index] === respostaCorreta) {
              pontuacaoAtual++;
            }
          }
        });
        
        progresso.pontuacao = pontuacaoAtual;
        progresso.totalPerguntas = fase.perguntas.length;
        progresso.porcentagemAcertos = fase.perguntas.length > 0
          ? Math.round((pontuacaoAtual / fase.perguntas.length) * 100)
          : 0;
      }
      
      await progresso.save();
    }

    res.json({
      message: "Resposta salva com sucesso",
      progresso,
    });
  } catch (error) {
    console.error("Erro ao salvar resposta:", error);
    res.status(500).json({ message: "Erro ao salvar resposta", error: error.message });
  }
};

// Verificar se usuário já completou uma fase
export const verificarProgresso = async (req, res) => {
  try {
    const userId = req.user._id;
    const { faseId } = req.params;

    const progresso = await Progresso.findOne({
      userId,
      faseId,
    });

    if (!progresso) {
      return res.json({ 
        completado: false, 
        progresso: null, 
        respostasSalvas: [],
        perguntasRespondidas: []
      });
    }

    // Garantir que respostasUsuario seja um array válido e preenchido
    let respostasSalvas = progresso.respostasUsuario || [];
    
    // Se for array esparso ou tiver undefined/null, normalizar para -1
    if (Array.isArray(respostasSalvas)) {
      respostasSalvas = respostasSalvas.map((r) => {
        if (r === undefined || r === null) return -1;
        return typeof r === 'number' ? r : -1;
      });
    } else {
      respostasSalvas = [];
    }

    res.json({
      completado: progresso.concluido || false,
      progresso,
      respostasSalvas: respostasSalvas,
      perguntasRespondidas: progresso.perguntasRespondidas || [],
    });
  } catch (error) {
    console.error("Erro ao verificar progresso:", error);
    res.status(500).json({ message: "Erro ao verificar progresso", error: error.message });
  }
};

// Obter progresso de todas as fases de uma trilha
export const obterProgressoTrilha = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trilhaId } = req.params;

    if (!trilhaId) {
      return res.status(400).json({ message: "trilhaId é obrigatório" });
    }

    // Buscar todos os progressos do usuário para esta trilha
    const progressos = await Progresso.find({
      userId,
      trilhaId,
    }).select("faseId concluido");

    // Criar um mapa de faseId -> completado
    const progressoMap = {};
    progressos.forEach((progresso) => {
      progressoMap[progresso.faseId.toString()] = progresso.concluido || false;
    });

    res.json({
      progresso: progressoMap,
    });
  } catch (error) {
    console.error("Erro ao obter progresso da trilha:", error);
    res.status(500).json({ 
      message: "Erro ao obter progresso da trilha", 
      error: error.message 
    });
  }
};

// Obter dados do usuário com nível calculado
export const obterDadosUsuario = async (req, res) => {
  try {
    const userId = req.user._id;
    const usuario = await User.findById(userId).select("-senha -email -dataNascimento");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Buscar dados de score do microsserviço SCORE
    const authHeader = req.headers.authorization;
    let scoreData = await chamarScoreService("/api/score/usuario", "GET", null, authHeader);

    // Retornar valores padrão se o microsserviço não estiver disponível
    if (!scoreData) {
      scoreData = {
        xpTotal: 0,
        nivel: 1,
        xpAtual: 0,
        xpNecessario: 100,
        xpAcumulado: 0,
      };
    }

    res.json({
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        username: usuario.username,
        personagem: usuario.personagem,
        fotoPerfil: usuario.fotoPerfil,
        materiaFavorita: usuario.materiaFavorita,
        xpTotal: scoreData.xpTotal || 0,
      },
      nivel: scoreData.nivel || 1,
      xpAtual: scoreData.xpAtual || 0,
      xpNecessario: scoreData.xpNecessario || 100,
      xpAcumulado: scoreData.xpAcumulado || 0,
    });
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    res.status(500).json({ message: "Erro ao obter dados do usuário", error: error.message });
  }
};

// Exportar função de cálculo de XP (mantida para compatibilidade)
export { calcularXP };

