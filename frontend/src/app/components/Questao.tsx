"use client";

import { useState, useEffect } from "react";
import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buscarFasePorId } from "@/app/services/faseService";

interface PerguntaAPI {
  enunciado: string;
  alternativas: string[];
  respostaCorreta: string | number; // Pode ser string (índice) ou number
}

interface PerguntaFormatada {
  id: number;
  texto: string;
  alternativas: string[];
  resposta: number;
}

interface Fase {
  _id: string;
  titulo: string;
  descricao: string;
  conteudo?: string; // Conteúdo da aula/explicação
  perguntas: PerguntaAPI[];
  trilhaId?:
    | string
    | {
        _id: string;
        titulo?: string;
        materia?: string;
      };
}

export default function Quiz() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const faseIdParam = searchParams.get("faseId");

  // Estados para controlar o quiz
  const [fase, setFase] = useState<Fase | null>(null);
  const [perguntas, setPerguntas] = useState<PerguntaFormatada[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostaSelecionada, setRespostaSelecionada] = useState<number | null>(
    null
  );
  const [finalizado, setFinalizado] = useState(false);
  const [pontuacao, setPontuacao] = useState(0);
  const [faseCompletada, setFaseCompletada] = useState(false);
  const [progressoAnterior, setProgressoAnterior] = useState<{
    pontuacao: number;
    respostasUsuario?: number[];
    xpGanho?: number;
  } | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [xpGanho, setXpGanho] = useState(0);
  const [respostasUsuario, setRespostasUsuario] = useState<number[]>([]); // Respostas do usuário quando fase completada (para visualização)
  const [respostasDuranteQuiz, setRespostasDuranteQuiz] = useState<number[]>(
    []
  ); // Respostas durante o quiz ativo
  const [mostrarConteudo, setMostrarConteudo] = useState(false); // Controlar modal de conteúdo
  const [perguntasRespondidas, setPerguntasRespondidas] = useState<number[]>(
    []
  ); // Índices das perguntas já respondidas
  const [progressoDataCache, setProgressoDataCache] = useState<{
    completado?: boolean;
    respostasSalvas?: number[];
    perguntasRespondidas?: number[];
    progresso?: {
      pontuacao?: number;
      respostasUsuario?: number[];
      xpGanho?: number;
    };
  } | null>(null); // Cache do progresso para usar após carregar perguntas

  // Carregar fase e perguntas
  useEffect(() => {
    const carregarFase = async () => {
      try {
        // Priorizar faseId da URL, depois do localStorage (para compatibilidade)
        let faseId = faseIdParam;
        if (!faseId && typeof window !== "undefined") {
          faseId = localStorage.getItem("faseAtual");
          // Se encontrou no localStorage mas não está na URL, limpar do localStorage
          // e usar a URL na próxima vez
          if (faseId) {
            localStorage.removeItem("faseAtual");
          }
        }

        if (!faseId) {
          setErro(
            "Nenhuma fase selecionada. Por favor, selecione uma fase da trilha."
          );
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const faseData = (await buscarFasePorId(faseId)) as Fase;
        setFase(faseData);

        // Verificar se a fase já foi completada
        if (token) {
          try {
            const progressoRes = await fetch(
              `${API_URL}/api/progresso/verificar/${faseId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (progressoRes.ok) {
              const progressoData = await progressoRes.json();
              setProgressoDataCache(progressoData); // Cache para usar depois

              // Carregar pontuação do banco se disponível (mesmo que não esteja completado)
              if (
                progressoData.progresso &&
                progressoData.progresso.pontuacao !== undefined
              ) {
                console.log(
                  "[CarregarFase] Pontuação do banco:",
                  progressoData.progresso.pontuacao
                );
                setPontuacao(progressoData.progresso.pontuacao);
              }

              // Carregar respostas salvas (mesmo que não esteja completado)
              if (
                progressoData.respostasSalvas &&
                Array.isArray(progressoData.respostasSalvas)
              ) {
                const respostasSalvas = progressoData.respostasSalvas;
                console.log("Respostas salvas carregadas:", respostasSalvas);

                // Inicializar respostasDuranteQuiz com as respostas salvas
                const respostasIniciais = new Array(
                  faseData.perguntas?.length || 0
                ).fill(-1);
                const perguntasRespondidasArr: number[] = [];

                // Processar respostas salvas - pode vir como array com valores -1 ou undefined
                // IMPORTANTE: O array pode ter gaps, então precisamos iterar pelo length real
                for (
                  let index = 0;
                  index < respostasSalvas.length &&
                  index < respostasIniciais.length;
                  index++
                ) {
                  const resposta = respostasSalvas[index];
                  // Só processar respostas válidas (>= 0)
                  if (
                    resposta !== undefined &&
                    resposta !== null &&
                    resposta >= 0
                  ) {
                    respostasIniciais[index] = resposta;
                    if (!perguntasRespondidasArr.includes(index)) {
                      perguntasRespondidasArr.push(index);
                    }
                  }
                }

                console.log("[CarregarFase] Respostas salvas processadas:", {
                  respostasSalvasRaw: respostasSalvas,
                  respostasSalvasLength: respostasSalvas.length,
                  respostasIniciais,
                  perguntasRespondidasArr,
                  totalPerguntas: faseData.perguntas?.length || 0,
                });

                console.log(
                  "[CarregarFase] ANTES de setRespostasDuranteQuiz:",
                  {
                    respostasIniciais,
                    respostasDuranteQuizEstadoAtual: respostasDuranteQuiz,
                  }
                );

                setRespostasDuranteQuiz(respostasIniciais);

                // Usar perguntasRespondidas do backend se disponível, senão usar o array local
                const perguntasRespBackend =
                  progressoData.perguntasRespondidas || perguntasRespondidasArr;
                setPerguntasRespondidas(perguntasRespBackend);

                console.log(
                  "[CarregarFase] DEPOIS de setRespostasDuranteQuiz:",
                  {
                    respostasIniciaisDefinidas: respostasIniciais,
                    perguntasRespBackend,
                  }
                );

                // Nota: A pontuação será calculada depois que as perguntas forem formatadas
                // para poder comparar as respostas salvas com as respostas corretas
              }

              if (progressoData.completado) {
                const progresso = progressoData.progresso;
                setFaseCompletada(true);
                setProgressoAnterior(progresso);
                setPontuacao(progresso.pontuacao);

                // Carregar respostas do usuário
                if (
                  progresso.respostasUsuario &&
                  Array.isArray(progresso.respostasUsuario)
                ) {
                  console.log(
                    "Respostas do usuário carregadas:",
                    progresso.respostasUsuario
                  );
                  setRespostasUsuario(progresso.respostasUsuario);
                } else {
                  console.warn(
                    "Nenhuma resposta do usuário encontrada no progresso"
                  );
                  setRespostasUsuario([]);
                }
              }
            }
          } catch (error) {
            console.error("Erro ao verificar progresso:", error);
          }
        }

        // Registrar que o usuário iniciou a trilha
        if (faseData.trilhaId) {
          const trilhaId =
            typeof faseData.trilhaId === "string"
              ? faseData.trilhaId
              : (faseData.trilhaId as { _id?: string })._id ||
                faseData.trilhaId;

          if (trilhaId) {
            const token = localStorage.getItem("token");
            if (token) {
              const API_URL =
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
              try {
                await fetch(`${API_URL}/api/trilhas/iniciar/${trilhaId}`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });
              } catch (error) {
                // Não bloquear se falhar, apenas logar
                console.error("Erro ao registrar início da trilha:", error);
              }
            }
          }
        }

        // Converter perguntas da API para o formato do quiz
        if (faseData.perguntas && faseData.perguntas.length > 0) {
          // NÃO resetar respostasDuranteQuiz aqui se já tiver sido carregado com respostas salvas
          // O array já foi populado anteriormente com as respostas salvas, então apenas garantir o tamanho
          // Se o array estiver vazio ou com tamanho diferente, ajustar mantendo as respostas existentes
          setRespostasDuranteQuiz((prev) => {
            if (prev.length === 0) {
              // Se está vazio, inicializar com -1
              return new Array(faseData.perguntas.length).fill(-1);
            } else if (prev.length !== faseData.perguntas.length) {
              // Se o tamanho for diferente, ajustar mantendo as respostas existentes
              const respostasAjustadas = [...prev];
              while (respostasAjustadas.length < faseData.perguntas.length) {
                respostasAjustadas.push(-1);
              }
              respostasAjustadas.length = faseData.perguntas.length;
              return respostasAjustadas;
            }
            // Se já tem o tamanho correto, manter como está (com as respostas salvas)
            return prev;
          });

          const perguntasFormatadas: PerguntaFormatada[] =
            faseData.perguntas.map((p, index) => {
              // Converter respostaCorreta para número (se for string, pega o índice)
              let respostaIndex = 0;
              if (typeof p.respostaCorreta === "number") {
                respostaIndex = p.respostaCorreta;
              } else if (typeof p.respostaCorreta === "string") {
                // Se for string, pode ser o índice ou o texto da alternativa
                const parsed = parseInt(p.respostaCorreta);
                if (!isNaN(parsed)) {
                  respostaIndex = parsed;
                } else {
                  // Se não for um número, busca o índice da alternativa
                  const idx = p.alternativas?.findIndex(
                    (alt: string) => alt === p.respostaCorreta
                  );
                  respostaIndex = idx >= 0 ? idx : 0;
                }
              }

              return {
                id: index + 1,
                texto: p.enunciado,
                alternativas: p.alternativas || [],
                resposta: respostaIndex,
              };
            });
          setPerguntas(perguntasFormatadas);

          // Encontrar a primeira pergunta não respondida para continuar de lá
          // Isso deve ser feito DEPOIS que as perguntas foram carregadas
          if (progressoDataCache) {
            const perguntasRespAtual =
              progressoDataCache.perguntasRespondidas ||
              perguntasRespondidas ||
              [];
            const totalPerguntas = perguntasFormatadas.length;
            let primeiraPerguntaNaoRespondida = 0;

            for (let i = 0; i < totalPerguntas; i++) {
              if (!perguntasRespAtual.includes(i)) {
                primeiraPerguntaNaoRespondida = i;
                break;
              }
            }

            // Se todas foram respondidas, ir para a última
            if (perguntasRespAtual.length === totalPerguntas) {
              primeiraPerguntaNaoRespondida = totalPerguntas - 1;
            }

            // Definir índice inicial como a primeira pergunta não respondida
            setIndiceAtual(primeiraPerguntaNaoRespondida);

            // Calcular pontuação baseada nas respostas já salvas
            // Priorizar pontuação calculada localmente (mais precisa) sobre a do banco
            let pontuacaoCalculada = 0;
            if (respostasDuranteQuiz.length > 0) {
              perguntasFormatadas.forEach((pergunta, index) => {
                if (
                  perguntasRespAtual.includes(index) &&
                  respostasDuranteQuiz.length > index &&
                  respostasDuranteQuiz[index] >= 0
                ) {
                  if (respostasDuranteQuiz[index] === pergunta.resposta) {
                    pontuacaoCalculada++;
                  }
                }
              });

              // Usar pontuação calculada se for válida, senão usar a do banco (se disponível)
              const pontuacaoBanco = progressoDataCache?.progresso?.pontuacao;

              console.log("[Calcular Pontuação] Comparação:", {
                pontuacaoCalculada,
                pontuacaoBanco,
                respostasDuranteQuiz,
                perguntasFormatadasRespostas: perguntasFormatadas.map(
                  (p) => p.resposta
                ),
              });

              // Usar a pontuação calculada (mais precisa) ou a do banco como fallback
              setPontuacao(
                pontuacaoCalculada > 0
                  ? pontuacaoCalculada
                  : pontuacaoBanco || 0
              );
            } else if (progressoDataCache?.progresso?.pontuacao !== undefined) {
              // Se não há respostas para calcular, usar a pontuação do banco
              setPontuacao(progressoDataCache.progresso.pontuacao);
            }
          }
        } else {
          setErro("Esta fase não possui perguntas cadastradas ainda.");
        }
      } catch (error) {
        console.error("Erro ao carregar fase:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao carregar as perguntas da fase.";
        setErro(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    carregarFase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faseIdParam]);

  // Efeito para carregar resposta quando o índice atual ou respostasDuranteQuiz mudarem
  useEffect(() => {
    if (
      perguntas.length > 0 &&
      indiceAtual >= 0 &&
      indiceAtual < perguntas.length
    ) {
      if (faseCompletada && respostasUsuario.length > indiceAtual) {
        // Se fase completada, usar respostasUsuario
        const respostaSalva = respostasUsuario[indiceAtual];
        setRespostaSelecionada(respostaSalva >= 0 ? respostaSalva : null);
      } else if (
        perguntasRespondidas.includes(indiceAtual) &&
        respostasDuranteQuiz.length > indiceAtual
      ) {
        // Se a pergunta atual já foi respondida, carregar a resposta salva
        const respostaSalva = respostasDuranteQuiz[indiceAtual];

        console.log(
          `[useEffect] Carregando resposta salva para pergunta ${indiceAtual}:`,
          respostaSalva,
          "de respostasDuranteQuiz:",
          respostasDuranteQuiz,
          "respostasDuranteQuiz.length:",
          respostasDuranteQuiz.length,
          "perguntasRespondidas:",
          perguntasRespondidas
        );

        // Só atualizar se a resposta for válida (>= 0) e diferente da atual
        if (respostaSalva >= 0) {
          if (respostaSalva !== respostaSelecionada) {
            setRespostaSelecionada(respostaSalva);
          }
        } else {
          // Se a resposta salva for inválida, limpar seleção
          setRespostaSelecionada(null);
        }
      } else if (!perguntasRespondidas.includes(indiceAtual)) {
        // Se a pergunta não foi respondida, limpar seleção
        setRespostaSelecionada(null);
      }
    }
  }, [
    indiceAtual,
    respostasDuranteQuiz,
    perguntasRespondidas,
    faseCompletada,
    respostasUsuario,
    perguntas.length,
  ]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-lg text-gray-600">Carregando perguntas...</div>
      </main>
    );
  }

  if (erro || perguntas.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <section className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {erro || "Nenhuma pergunta encontrada"}
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar
          </button>
        </section>
      </main>
    );
  }

  const perguntaAtual = perguntas[indiceAtual];

  async function selecionarResposta(indice: number): Promise<void> {
    // Não permitir responder se já foi completada ou se a pergunta já foi respondida
    if (faseCompletada || perguntasRespondidas.includes(indiceAtual)) return;

    if (respostaSelecionada === null) {
      // só permite uma escolha
      setRespostaSelecionada(indice);

      // Marcar pergunta como respondida
      setPerguntasRespondidas([...perguntasRespondidas, indiceAtual]);

      // Atualizar resposta no array e recalcular pontuação total
      // Isso garante que a pontuação seja sempre correta, incluindo respostas já salvas
      setRespostasDuranteQuiz((respostasAtuais) => {
        const novasRespostas = [...respostasAtuais];
        novasRespostas[indiceAtual] = indice;

        // Recalcular pontuação completa baseada em todas as respostas
        let pontuacaoNova = 0;
        if (perguntas.length > 0) {
          perguntas.forEach((pergunta, index) => {
            const respostaAtual = novasRespostas[index];
            if (respostaAtual >= 0 && respostaAtual === pergunta.resposta) {
              pontuacaoNova++;
            }
          });
        }

        console.log("[Atualizar Pontuação] Nova pontuação calculada:", {
          pontuacaoNova,
          indiceAtual,
          respostaSelecionada: indice,
          todasRespostas: novasRespostas,
        });

        setPontuacao(pontuacaoNova);
        return novasRespostas;
      });

      // Salvar resposta imediatamente no backend
      const token = localStorage.getItem("token");
      if (token && fase?._id) {
        try {
          const API_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
          await fetch(`${API_URL}/api/progresso/salvar-resposta`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              faseId: fase._id,
              perguntaIndex: indiceAtual,
              resposta: indice,
            }),
          });
          console.log("Resposta salva automaticamente");
        } catch (error) {
          console.error("Erro ao salvar resposta:", error);
        }
      }
    }
  }

  // Obter resposta do usuário para a pergunta atual (se fase completada)
  const respostaUsuarioAtual =
    faseCompletada && respostasUsuario.length > indiceAtual
      ? respostasUsuario[indiceAtual]
      : null;

  // Avança para a próxima pergunta ou finaliza o quiz
  const proximaPergunta = async () => {
    if (indiceAtual + 1 < perguntas.length) {
      const proximoIndice = indiceAtual + 1;
      setIndiceAtual(proximoIndice);

      // Se fase completada, carregar resposta do usuário para próxima pergunta
      if (faseCompletada && respostasUsuario.length > proximoIndice) {
        const respostaSalva = respostasUsuario[proximoIndice];
        setRespostaSelecionada(respostaSalva >= 0 ? respostaSalva : null);
      } else if (perguntasRespondidas.includes(proximoIndice)) {
        // Se a próxima pergunta já foi respondida, carregar a resposta salva
        const respostaSalva = respostasDuranteQuiz[proximoIndice];
        setRespostaSelecionada(respostaSalva >= 0 ? respostaSalva : null);
      } else {
        setRespostaSelecionada(null); // reseta seleção
      }
    } else {
      // Finalizar quiz e salvar resultado
      setFinalizado(true);

      // Salvar resultado no backend
      if (!faseCompletada && fase?._id) {
        await salvarResultado();
      }
    }
  };

  // Botão para voltar pergunta anterior (apenas visualização)
  const perguntaAnterior = () => {
    if (indiceAtual > 0) {
      const indiceAnterior = indiceAtual - 1;
      setIndiceAtual(indiceAnterior);

      // Se fase completada, carregar resposta do usuário
      if (faseCompletada && respostasUsuario.length > indiceAnterior) {
        const respostaSalva = respostasUsuario[indiceAnterior];
        setRespostaSelecionada(respostaSalva >= 0 ? respostaSalva : null);
      } else if (perguntasRespondidas.includes(indiceAnterior)) {
        // Se a pergunta anterior já foi respondida, carregar a resposta salva
        const respostaSalva = respostasDuranteQuiz[indiceAnterior];
        setRespostaSelecionada(respostaSalva >= 0 ? respostaSalva : null);
      } else {
        setRespostaSelecionada(null);
      }
    }
  };

  // Salvar resultado do quiz
  const salvarResultado = async () => {
    if (!fase?._id) return;

    setSalvando(true);
    const token = localStorage.getItem("token");
    if (!token) {
      setSalvando(false);
      return;
    }

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const porcentagemAcertos = Math.round(
        (pontuacao / perguntas.length) * 100
      );
      const xpCalculado = Math.round((porcentagemAcertos / 100) * 500);

      // Usar as respostas rastreadas durante o quiz
      // Se a última pergunta foi respondida mas não está no array, adicionar
      const todasRespostas = [...respostasDuranteQuiz];
      if (
        indiceAtual === perguntas.length - 1 &&
        respostaSelecionada !== null
      ) {
        todasRespostas[indiceAtual] = respostaSelecionada;
      }

      const response = await fetch(`${API_URL}/api/progresso/salvar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          faseId: fase._id,
          pontuacao,
          totalPerguntas: perguntas.length,
          respostasUsuario: todasRespostas,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setXpGanho(data.xpGanho || xpCalculado);
        setFaseCompletada(true);
      } else {
        const errorData = await response.json();
        console.error("Erro ao salvar resultado:", errorData);
      }
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
    } finally {
      setSalvando(false);
    }
  };

  // Converte índice da alternativa para letra (A, B, C, D...)
  interface LetraFn {
    (i: number): string;
  }
  const letra: LetraFn = (i) => String.fromCharCode(65 + i);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center ">
      {/* Modal de conteúdo */}
      {mostrarConteudo && fase?.conteudo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Cabeçalho do modal */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {fase.titulo || "Conteúdo da Aula"}
              </h2>
              <button
                onClick={() => setMostrarConteudo(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Fechar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {fase.conteudo}
              </div>
            </div>

            {/* Rodapé */}
            <div className="bg-gray-50 p-4 flex justify-end border-t">
              <button
                onClick={() => setMostrarConteudo(false)}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz não finalizado */}
      {!finalizado ? (
        <section className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          {/* Cabeçalho: título, número da pergunta e barra de progresso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                {fase?.titulo || "Quiz"}
              </h1>
              <div className="flex items-center gap-3">
                {/* Botão para ver conteúdo, caso a fase tenha */}
                {fase?.conteudo && fase.conteudo.trim().length > 0 && (
                  <button
                    onClick={() => setMostrarConteudo(true)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium text-sm flex items-center gap-2"
                    title="Ver conteúdo da aula"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                    Ver Conteúdo
                  </button>
                )}
                <span className="text-sm text-gray-500">
                  {indiceAtual + 1} de {perguntas.length}
                </span>
              </div>
            </div>
            {faseCompletada && (
              <div className="mb-2 p-2 bg-yellow-100 border border-yellow-400 rounded text-yellow-800 text-sm">
                ⚠️ Esta fase já foi completada. Modo visualização somente.
              </div>
            )}
            {fase?.descricao && (
              <p className="text-sm text-gray-600 mb-2">{fase.descricao}</p>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((indiceAtual + 1) / perguntas.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Texto da pergunta */}
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            {perguntaAtual.texto}
          </h2>

          {/* Alternativas */}
          <div className="flex flex-col gap-3 mb-8">
            {perguntaAtual.alternativas.map((alt, i) => {
              const isCorreta = i === perguntaAtual.resposta;

              // Obter resposta do usuário: se fase completada usa respostasUsuario, senão usa respostasDuranteQuiz
              let respostaUsuarioNaPerguntaAtual: number | null = null;

              if (faseCompletada) {
                respostaUsuarioNaPerguntaAtual =
                  respostasUsuario.length > indiceAtual
                    ? respostasUsuario[indiceAtual]
                    : null;
              } else if (
                perguntasRespondidas.includes(indiceAtual) &&
                respostasDuranteQuiz.length > indiceAtual
              ) {
                // IMPORTANTE: Se já foi respondida, SEMPRE usar a resposta salva de respostasDuranteQuiz
                const respostaSalva = respostasDuranteQuiz[indiceAtual];
                respostaUsuarioNaPerguntaAtual =
                  respostaSalva >= 0 ? respostaSalva : null;

                // Debug log
                if (i === 0) {
                  console.log(`[Render Alternativa] Pergunta ${indiceAtual}:`, {
                    respostaSalva,
                    respostaUsuarioNaPerguntaAtual,
                    respostasDuranteQuizArray: respostasDuranteQuiz,
                    respostasDuranteQuizLength: respostasDuranteQuiz.length,
                    respostasDuranteQuizIndiceAtual:
                      respostasDuranteQuiz[indiceAtual],
                  });
                }
              } else if (respostaSelecionada !== null) {
                // Se ainda não foi respondida mas há uma seleção temporária
                respostaUsuarioNaPerguntaAtual = respostaSelecionada;
              } else {
                respostaUsuarioNaPerguntaAtual = null;
              }

              // Debug log apenas para a primeira alternativa da primeira pergunta respondida
              if (
                i === 0 &&
                perguntasRespondidas.includes(indiceAtual) &&
                !faseCompletada
              ) {
                console.log(
                  `[Render] Pergunta ${indiceAtual}, Alternativa ${i}:`,
                  {
                    isCorreta,
                    respostaUsuarioNaPerguntaAtual,
                    respostasDuranteQuiz: respostasDuranteQuiz[indiceAtual],
                    perguntasRespondidasIncludes:
                      perguntasRespondidas.includes(indiceAtual),
                    respostaSelecionada,
                    faseCompletada,
                  }
                );
              }

              // Verificar se esta alternativa foi selecionada pelo usuário
              const isSelecionada = faseCompletada
                ? respostaUsuarioAtual === i
                : perguntasRespondidas.includes(indiceAtual)
                ? respostaUsuarioNaPerguntaAtual !== null &&
                  respostaUsuarioNaPerguntaAtual === i
                : i === respostaSelecionada;

              // Verificar se esta alternativa foi respondida pelo usuário (fase completada)
              const foiRespondidaPeloUsuario =
                faseCompletada && respostaUsuarioAtual === i;

              // Verificar se esta alternativa foi respondida pelo usuário (fase parcial)
              const foiRespondidaPeloUsuarioParcial =
                !faseCompletada &&
                perguntasRespondidas.includes(indiceAtual) &&
                respostaUsuarioNaPerguntaAtual !== null &&
                respostaUsuarioNaPerguntaAtual !== undefined &&
                respostaUsuarioNaPerguntaAtual === i;

              // Define cores conforme seleção e acerto
              let cor = "bg-gray-50 text-gray-800 border-gray-200";

              if (faseCompletada) {
                // Modo visualização: mostrar respostas
                if (isCorreta && foiRespondidaPeloUsuario) {
                  cor = "bg-green-500 text-white border-green-500 shadow-lg";
                } else if (foiRespondidaPeloUsuario && !isCorreta) {
                  cor = "bg-red-500 text-white border-red-500 shadow-lg";
                } else if (isCorreta) {
                  cor =
                    "bg-green-300 text-green-900 border-green-400 shadow-md";
                } else {
                  cor = "bg-gray-100 text-gray-500 border-gray-200";
                }
              } else if (perguntasRespondidas.includes(indiceAtual)) {
                // Modo parcial: pergunta já foi respondida, mostrar resposta do usuário E resposta correta
                // Debug para entender a lógica
                if (i === 0) {
                  console.log(
                    `[Render Cor] Pergunta ${indiceAtual}, Alternativa ${i}:`,
                    {
                      foiRespondidaPeloUsuarioParcial,
                      isCorreta,
                      respostaUsuarioNaPerguntaAtual,
                      respostaSelecionada,
                      respostasDuranteQuizIndiceAtual:
                        respostasDuranteQuiz[indiceAtual],
                      perguntasRespondidasIncludes:
                        perguntasRespondidas.includes(indiceAtual),
                    }
                  );
                }

                if (foiRespondidaPeloUsuarioParcial && isCorreta) {
                  // Usuário acertou - mostrar em verde destacado
                  cor = "bg-green-500 text-white border-green-500 shadow-lg";
                } else if (foiRespondidaPeloUsuarioParcial && !isCorreta) {
                  // Usuário errou - mostrar a resposta errada do usuário em vermelho
                  cor = "bg-red-500 text-white border-red-500 shadow-lg";
                } else if (isCorreta && !foiRespondidaPeloUsuarioParcial) {
                  // Resposta correta (mas usuário não selecionou) - mostrar em verde claro
                  cor =
                    "bg-green-300 text-green-900 border-green-400 shadow-md";
                } else {
                  // Outras alternativas não selecionadas
                  cor = "bg-gray-100 text-gray-500 border-gray-200";
                }
              } else if (respostaSelecionada !== null) {
                // Modo normal: quiz ativo, acabou de selecionar
                if (isSelecionada && isCorreta) {
                  cor = "bg-green-500 text-white border-green-500 shadow-lg";
                } else if (isSelecionada && !isCorreta) {
                  cor = "bg-red-500 text-white border-red-500 shadow-lg";
                } else if (isCorreta) {
                  cor = "bg-green-500 text-white border-green-500 shadow-lg";
                } else {
                  cor = "bg-gray-100 text-gray-500 border-gray-200";
                }
              } else {
                cor =
                  "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100";
              }

              return (
                <button
                  key={i}
                  onClick={() => selecionarResposta(i)}
                  disabled={
                    respostaSelecionada !== null ||
                    faseCompletada ||
                    perguntasRespondidas.includes(indiceAtual)
                  }
                  className={`w-full px-6 py-4 rounded-lg border-2 transition-all duration-200 font-medium text-left ${cor} ${
                    faseCompletada || perguntasRespondidas.includes(indiceAtual)
                      ? "cursor-default"
                      : respostaSelecionada === null
                      ? "cursor-pointer hover:shadow-md transform hover:-translate-y-0.5 active:scale-95"
                      : "cursor-not-allowed"
                  } disabled:opacity-100`}
                >
                  <div className="flex flex-col">
                    <span>
                      <span className="font-bold">{letra(i)}:</span> {alt}
                    </span>

                    {/* Indicadores visuais para fase completada ou pergunta já respondida */}
                    {(faseCompletada ||
                      perguntasRespondidas.includes(indiceAtual)) && (
                      <div className="mt-2 text-xs font-semibold">
                        {isCorreta &&
                          (foiRespondidaPeloUsuario ||
                            foiRespondidaPeloUsuarioParcial) && (
                            <span
                              className={
                                faseCompletada
                                  ? "text-green-100"
                                  : "text-green-700"
                              }
                            >
                              ✓ Resposta correta (você acertou)
                            </span>
                          )}
                        {isCorreta &&
                          !(
                            foiRespondidaPeloUsuario ||
                            foiRespondidaPeloUsuarioParcial
                          ) && (
                            <span
                              className={
                                faseCompletada
                                  ? "text-green-900"
                                  : "text-green-800"
                              }
                            >
                              ✓ Resposta correta
                            </span>
                          )}
                        {!isCorreta &&
                          (foiRespondidaPeloUsuario ||
                            foiRespondidaPeloUsuarioParcial) && (
                            <span
                              className={
                                faseCompletada ? "text-red-100" : "text-red-700"
                              }
                            >
                              ✗ Sua resposta (incorreta)
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Rodapé com pontuação e botões de navegação */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Pontuação: {pontuacao}/{perguntas.length}
            </div>
            <div className="flex gap-2">
              {faseCompletada && indiceAtual > 0 && (
                <button
                  onClick={perguntaAnterior}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={proximaPergunta}
                disabled={
                  (!faseCompletada &&
                    !perguntasRespondidas.includes(indiceAtual) &&
                    respostaSelecionada === null) ||
                  salvando
                }
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {salvando
                  ? "Salvando..."
                  : indiceAtual + 1 === perguntas.length
                  ? faseCompletada
                    ? "Ver Resultado"
                    : "Finalizar"
                  : "Próxima"}
              </button>
            </div>
          </div>
        </section>
      ) : (
        // Quiz finalizado
        <section className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              {faseCompletada && progressoAnterior
                ? "Resultado Anterior"
                : "Quiz Finalizado! 🎉"}
            </h2>
            {faseCompletada && progressoAnterior && (
              <p className="text-sm text-yellow-600 mb-2">
                ⚠️ Esta fase já foi completada anteriormente
              </p>
            )}
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {pontuacao}/{perguntas.length}
            </div>
            <p className="text-gray-600 text-lg mb-2">
              {pontuacao === perguntas.length
                ? "Perfeito! Você acertou todas!"
                : pontuacao >= perguntas.length * 0.7
                ? "Muito bem! Ótimo desempenho!"
                : pontuacao >= perguntas.length * 0.5
                ? "Bom trabalho! Continue praticando!"
                : "Continue estudando e tente novamente!"}
            </p>
            {xpGanho > 0 && (
              <p className="text-lg font-semibold text-green-600 mb-2">
                ✨ +{xpGanho} XP ganhos!
              </p>
            )}
            {progressoAnterior && (
              <p className="text-sm text-gray-500">
                XP ganho anteriormente: {progressoAnterior.xpGanho || 0}
              </p>
            )}
          </div>
          {/* Barra de progresso final */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(pontuacao / perguntas.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {Math.round((pontuacao / perguntas.length) * 100)}% de acertos
            </p>
          </div>
          {/* Botão para voltar à trilha */}
          <button
            onClick={() => {
              // Limpar faseAtual do localStorage
              if (typeof window !== "undefined") {
                localStorage.removeItem("faseAtual");
                // Tentar voltar para a trilha usando o trilhaId da fase
                if (
                  fase?.trilhaId &&
                  typeof fase.trilhaId === "object" &&
                  "_id" in fase.trilhaId
                ) {
                  router.push(
                    `/pages/trilha?trilhaId=${
                      (fase.trilhaId as { _id: string })._id
                    }`
                  );
                } else if (
                  fase?.trilhaId &&
                  typeof fase.trilhaId === "string"
                ) {
                  router.push(`/pages/trilha?trilhaId=${fase.trilhaId}`);
                } else {
                  router.back();
                }
              } else {
                router.back();
              }
            }}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Voltar para trilha
          </button>
        </section>
      )}
    </main>
  );
}
