import Progresso from "../models/progresso.js";
import User from "../models/user.js";
import Fase from "../models/fase.js";

// Função para calcular XP ganho baseado na porcentagem de acertos
// 100% = 500 XP, 0% = 0 XP (progressão linear)
const calcularXP = (porcentagemAcertos) => {
  return Math.round((porcentagemAcertos / 100) * 500);
};

// Função para calcular nível baseado em XP total
// Nível 1: precisa de 100 XP total (0-100)
// Nível 2: precisa de 210 XP total (100-210)
// Nível 3: precisa de 441 XP total (210-441)
// Fórmula: nível N precisa de XP_total = XP_nível_anterior + (XP_nível_anterior * 0.1) + 100
const calcularNivel = (xpTotal) => {
  if (xpTotal < 0) xpTotal = 0;
  
  let nivel = 1;
  let xpParaProximoNivel = 100; // XP necessário para passar do nível 1 ao 2
  let xpAcumuladoAteNivelAtual = 0; // XP total acumulado até alcançar o nível atual

  // Para alcançar o nível 1: precisa de 0 XP (já está no nível 1)
  // Para alcançar o nível 2: precisa de 100 XP total
  // Para alcançar o nível 3: precisa de 210 XP total (100 + 100*1.1)
  // Para alcançar o nível 4: precisa de 441 XP total (210 + 210*1.1)

  // Calcular qual nível o usuário alcançou
  while (xpTotal >= xpAcumuladoAteNivelAtual + xpParaProximoNivel) {
    xpAcumuladoAteNivelAtual += xpParaProximoNivel;
    xpParaProximoNivel = Math.round(100 + xpParaProximoNivel * 1.1);
    nivel++;
  }

  // xpAtual é o XP que o usuário tem no nível atual
  const xpAtual = xpTotal - xpAcumuladoAteNivelAtual;

  return {
    nivel,
    xpAtual,
    xpNecessario: xpParaProximoNivel,
    xpAcumulado: xpAcumuladoAteNivelAtual,
  };
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

    // Atualizar XP total do usuário
    const usuario = await User.findById(userId);
    if (usuario) {
      usuario.xpTotal = (usuario.xpTotal || 0) + xpGanho;
      await usuario.save();
    }

    // Calcular novo nível do usuário
    const dadosNivel = calcularNivel(usuario.xpTotal);

    res.status(201).json({
      message: "Resultado salvo com sucesso",
      progresso,
      xpGanho,
      nivel: dadosNivel,
      usuario: {
        xpTotal: usuario.xpTotal,
        nivel: dadosNivel.nivel,
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

// Obter dados do usuário com nível calculado
export const obterDadosUsuario = async (req, res) => {
  try {
    const userId = req.user._id;
    const usuario = await User.findById(userId).select("-senha");

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const dadosNivel = calcularNivel(usuario.xpTotal || 0);

    res.json({
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        username: usuario.username,
        personagem: usuario.personagem,
        fotoPerfil: usuario.fotoPerfil,
        materiaFavorita: usuario.materiaFavorita,
        xpTotal: usuario.xpTotal || 0,
      },
      nivel: dadosNivel.nivel,
      xpAtual: dadosNivel.xpAtual,
      xpNecessario: dadosNivel.xpNecessario,
      xpAcumulado: dadosNivel.xpAcumulado,
    });
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    res.status(500).json({ message: "Erro ao obter dados do usuário", error: error.message });
  }
};

// Exportar função de cálculo de nível para uso em outros lugares
export { calcularNivel, calcularXP };

