"use client";
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { BookText, ArrowUp, Bookmark, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  buscarFasesPorTrilha,
  buscarFasePorId,
} from "@/app/services/faseService";

interface Fase {
  _id: string;
  titulo: string;
  descricao: string;
  ordem: number;
  perguntas?: any[];
}

interface TrilhasProps {
  trilhaId?: string;
}

function TooltipDescricao({
  fase,
  onStart,
  isLocked,
  isCompletada,
  mensagemBloqueio,
}: {
  fase: Fase;
  onStart: () => void;
  isLocked: boolean;
  isCompletada?: boolean;
  mensagemBloqueio?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: [0.8, 1.05, 1], y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 10 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
      className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-64 bg-blue-500 rounded-2xl shadow-2xl text-white p-4 z-50"
    >
      <p className="font-bold text-lg">DESCRIÇÃO</p>
      <p className="text-sm opacity-90 mb-2">{fase.titulo}</p>
      <p className="text-xs opacity-75 mb-3">
        {fase.descricao || "Sem descrição"}
      </p>
      {isCompletada && (
        <p className="text-xs opacity-90 mb-2 text-green-200 font-semibold">
          ✓ Fase concluída!
        </p>
      )}
      {isLocked && mensagemBloqueio && (
        <p className="text-xs opacity-90 mb-2 text-yellow-200 italic">
          {mensagemBloqueio}
        </p>
      )}
      <button
        onClick={!isLocked ? onStart : undefined}
        disabled={isLocked}
        className={`w-full py-2 rounded-xl shadow-md font-bold transition-all 
          ${
            isLocked
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : isCompletada
              ? "bg-green-400 text-white hover:scale-105 active:scale-95"
              : "bg-white text-blue-500 hover:scale-105 active:scale-95"
          }`}
      >
        {isLocked 
          ? "BLOQUEADO" 
          : isCompletada 
          ? "REVISAR FASE ✓" 
          : "COMEÇAR"}
      </button>
    </motion.div>
  );
}

export default function Trilhas({ trilhaId }: TrilhasProps) {
  const [fases, setFases] = useState<Fase[]>([]);
  const [trilha, setTrilha] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const [characterPos, setCharacterPos] = useState({ x: 0, y: 0 });
  const [characterFacingRight, setCharacterFacingRight] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [trilhaSalva, setTrilhaSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [progressoFases, setProgressoFases] = useState<Map<string, boolean>>(new Map());

  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tracksRef = useRef<HTMLDivElement | null>(null);
  const characterRef = useRef<HTMLDivElement | null>(null);

  const controls = useAnimation();

  // Carregar fases da trilha
  useEffect(() => {
    if (!trilhaId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const abortController = new AbortController();

    const carregarDados = async () => {
      try {
        // Buscar informações da trilha
        const token = localStorage.getItem("token");
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Verificar se a trilha está salva ANTES de carregar outros dados
        if (token && trilhaId && isMounted) {
          try {
            const salvaRes = await fetch(
              `${API_URL}/api/licoes-salvas/verificar/${trilhaId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortController.signal,
              }
            );
            if (!isMounted) return;
            
            if (salvaRes.ok) {
              const { salva } = await salvaRes.json();
              if (isMounted) {
                setTrilhaSalva(!!salva);
              }
            } else {
              if (isMounted) {
                setTrilhaSalva(false);
              }
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            if (!isMounted) return;
            console.error("Erro ao verificar se trilha está salva:", error);
            if (isMounted) {
              setTrilhaSalva(false);
            }
          }
        }

        if (!isMounted) return;

        const trilhaRes = await fetch(`${API_URL}/api/trilhas/${trilhaId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: abortController.signal,
        });

        if (!isMounted) return;

        if (trilhaRes.ok) {
          const trilhaData = await trilhaRes.json();
          if (isMounted) {
            setTrilha(trilhaData);
          }
        }

        // Buscar fases
        const fasesData = await buscarFasesPorTrilha(trilhaId);
        const fasesOrdenadas = fasesData.sort(
          (a: Fase, b: Fase) => a.ordem - b.ordem
        );
        setFases(fasesOrdenadas);

        // Buscar progresso de todas as fases de uma vez (otimizado)
        if (token && fasesOrdenadas.length > 0 && isMounted) {
          try {
            const progressoRes = await fetch(
              `${API_URL}/api/progresso/trilha/${trilhaId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: abortController.signal,
              }
            );
            
            if (!isMounted) return;
            
            if (progressoRes.ok) {
              const progressoData = await progressoRes.json();
              const progressoMap = new Map<string, boolean>();
              
              // Converter o objeto de progresso em Map
              if (progressoData.progresso) {
                Object.entries(progressoData.progresso).forEach(([faseId, completado]) => {
                  progressoMap.set(faseId, completado === true);
                });
              }
              
              if (isMounted) {
                setProgressoFases(progressoMap);
              }
            } else {
              // Se falhar, criar Map vazio
              if (isMounted) {
                setProgressoFases(new Map());
              }
            }
          } catch (error) {
            if (error instanceof Error && error.name === "AbortError") return;
            if (!isMounted) return;
            console.error("Erro ao buscar progresso da trilha:", error);
            if (isMounted) {
              setProgressoFases(new Map());
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar fases:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarDados();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [trilhaId]);

  // Função para mover o personagem
  const moveCharacter = async (index: number) => {
    if (fases.length === 0) return;

    const btn = buttonRefs.current[index];
    const container = tracksRef.current;
    if (!btn || !container) return;

    const btnRect = btn.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const charRect = characterRef.current?.getBoundingClientRect();

    const charW = charRect?.width ?? 40;
    const charH = charRect?.height ?? 40;

    const isLeft = index % 2 === 0;
    const margin = 6;

    // Virar personagem para o lado correto
    setCharacterFacingRight(!isLeft);

    const btnLeftRel = btnRect.left - containerRect.left;
    const btnRightRel = btnRect.right - containerRect.left;
    const btnTopRel = btnRect.top - containerRect.top;

    const x = isLeft ? btnLeftRel - charW - margin : btnRightRel + margin;
    const y = btnTopRel + btnRect.height / 2 - charH / 2;

    // animação de pulo antes de mover
    await controls.start({
      y: characterPos.y - 20,
      transition: { duration: 0.15 },
    });
    await controls.start({
      x,
      y,
      transition: { type: "spring", stiffness: 200, damping: 20 },
    });
    setCharacterPos({ x, y });
  };

  // Posição inicial: mover para a primeira fase quando fases carregarem
  useLayoutEffect(() => {
    if (fases.length > 0) {
      // Mover imediatamente para a primeira fase enquanto espera o progresso
      moveCharacter(0);
    }
  }, [fases.length]);

  // Atualizar posição quando o progresso for carregado
  useEffect(() => {
    if (fases.length === 0) return;

    // Usar requestAnimationFrame para garantir que o DOM está atualizado
    const rafId = requestAnimationFrame(() => {
      // Aguardar um pouco para garantir que os botões estão renderizados
      setTimeout(async () => {
        // Se tem progresso carregado, calcular baseado nele
        if (progressoFases.size > 0) {
          // Encontrar a última fase concluída em sequência
          let ultimaFaseConcluidaIndex = -1;
          
          for (let i = 0; i < fases.length; i++) {
            const faseCompletada = progressoFases.get(fases[i]._id);
            if (faseCompletada) {
              ultimaFaseConcluidaIndex = i;
            } else {
              // Se encontrou uma fase não concluída, para aqui
              break;
            }
          }
          
          // Mover para a próxima fase disponível (última concluída + 1)
          const faseAtualIndex = ultimaFaseConcluidaIndex + 1;
          
          // Se todas as fases foram concluídas, ficar na última
          const indexFinal = faseAtualIndex >= fases.length ? fases.length - 1 : faseAtualIndex;
          
          await moveCharacter(indexFinal);
        }
        // Se não tem progresso, já está na primeira fase (movido pelo useLayoutEffect)
      }, 50); // Delay reduzido para resposta mais rápida
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [progressoFases.size, fases.length]);

  // Mostrar botão voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Atualizar progresso quando a página ganha foco (usuário volta após completar fase)
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const handleFocus = async () => {
      if (!trilhaId || fases.length === 0 || !isMounted) return;
      
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      try {
        const progressoRes = await fetch(
          `${API_URL}/api/progresso/trilha/${trilhaId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: abortController.signal,
          }
        );

        if (!isMounted) return;

        if (progressoRes.ok) {
          const progressoData = await progressoRes.json();
          const progressoMap = new Map<string, boolean>();
          
          // Converter o objeto de progresso em Map
          if (progressoData.progresso) {
            Object.entries(progressoData.progresso).forEach(([faseId, completado]) => {
              progressoMap.set(faseId, completado === true);
            });
          }
          
          if (isMounted) {
            setProgressoFases(progressoMap);
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao atualizar progresso:", error);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      isMounted = false;
      abortController.abort();
      window.removeEventListener("focus", handleFocus);
    };
  }, [trilhaId, fases]);

  const handleButtonClick = (index: number) => {
    setTooltipIndex(index);
    moveCharacter(index);
  };

  const handleStart = async (faseId: string) => {
    try {
      const token = localStorage.getItem("token");
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      // Primeiro verificar se a fase já foi completada
      let faseCompletada = false;
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
            faseCompletada = progressoData.completado || false;
          }
        } catch (error) {
          console.error("Erro ao verificar progresso:", error);
        }
      }

      // Se a fase já foi completada, ir direto para as perguntas
      if (faseCompletada) {
        console.log("Fase já completada, redirecionando direto para perguntas");
        window.location.href = `/pages/curso?faseId=${faseId}`;
        return;
      }

      // Se não foi completada, verificar se tem conteúdo
      const faseData = (await buscarFasePorId(faseId)) as { conteudo?: string };
      console.log("Dados da fase carregados:", faseData);
      console.log("Conteúdo da fase:", faseData.conteudo);

      // Verificar se tem conteúdo (pode ser string vazia, null, undefined, ou string com espaços)
      const temConteudo =
        faseData.conteudo &&
        typeof faseData.conteudo === "string" &&
        faseData.conteudo.trim().length > 0;

      console.log("Tem conteúdo?", temConteudo);

      if (temConteudo) {
        // Se tem conteúdo, ir para página de conteúdo primeiro
        console.log("Redirecionando para página de conteúdo");
        window.location.href = `/pages/conteudo?faseId=${faseId}`;
      } else {
        // Se não tem conteúdo, ir direto para as perguntas
        console.log("Redirecionando direto para perguntas");
        window.location.href = `/pages/curso?faseId=${faseId}`;
      }
    } catch (error) {
      console.error("Erro ao verificar conteúdo da fase:", error);
      // Em caso de erro, redirecionar direto para as perguntas
      window.location.href = `/pages/curso?faseId=${faseId}`;
    }
  };

  const handleSalvarTrilha = async () => {
    // Usar trilhaId da prop ou do estado trilha
    const idParaSalvar = trilhaId || trilha?._id;

    if (!idParaSalvar) {
      console.error("trilhaId não encontrado:", {
        trilhaId,
        trilha,
        trilhaIdDaProp: trilhaId,
        trilhaIdDoEstado: trilha?._id,
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }

    setSalvando(true);
    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      if (trilhaSalva) {
        // Remover da lista de salvas
        console.log("Removendo trilha das salvas:", idParaSalvar);
        const res = await fetch(
          `${API_URL}/api/licoes-salvas/${idParaSalvar}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.ok) {
          setTrilhaSalva(false);
        } else {
          const errorData = await res
            .json()
            .catch(() => ({ message: "Erro desconhecido" }));
          console.error("Erro ao remover trilha:", errorData);
        }
      } else {
        // Salvar
        console.log("Salvando trilha:", idParaSalvar);
        const res = await fetch(`${API_URL}/api/licoes-salvas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ trilhaId: idParaSalvar }),
        });

        console.log("Resposta do servidor:", res.status, res.statusText);
        const data = await res
          .json()
          .catch(() => ({ message: "Erro ao processar resposta" }));
        console.log("Dados da resposta:", data);

        if (res.ok) {
          setTrilhaSalva(true);
        } else if (res.status === 400 && data.message === "Trilha já está salva") {
          // Se já está salva, atualizar o estado para true
          console.log("Trilha já estava salva, atualizando estado...");
          setTrilhaSalva(true);
        } else {
          console.error("Erro ao salvar trilha - resposta não OK:", data);
        }
      }
    } catch (error: unknown) {
      console.error("Erro ao salvar/remover trilha:", error);
    } finally {
      setSalvando(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Se não houver trilhaId, mostrar mensagem
  if (!trilhaId) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-10">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-lg text-gray-600 mb-4">
            Nenhuma trilha selecionada.
          </p>
          <p className="text-sm text-gray-500">
            Selecione uma trilha para ver suas fases.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center pt-10">
        <div className="text-lg text-gray-600">Carregando fases...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center pt-10">
      {/* Cabeçalho */}
      <div className="bg-blue-500 rounded-t-xl px-6 py-4 mb-12 shadow-md text-white w-[90%] max-w-3xl flex justify-between items-center">
        <div>
          <p className="text-sm font-bold opacity-80">
            {trilha?.materia || "Trilha"}
          </p>
          <h2 className="text-xl font-bold">
            {trilha?.titulo || "Trilha de Estudos"}
          </h2>
        </div>
         <div className="flex items-center gap-2">
           {(trilhaId || trilha?._id) && (
             <button
               onClick={handleSalvarTrilha}
               disabled={salvando || !(trilhaId || trilha?._id)}
               className={`flex items-center gap-2 border-2 rounded-xl px-3 py-1 font-bold transform active:translate-y-1 shadow-[0_6px_0px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0px_rgba(0,0,0,0.3)] transition-all duration-150 ${
                 trilhaSalva
                   ? "bg-yellow-500 border-yellow-500 text-gray-900 hover:bg-yellow-600"
                   : "bg-transparent border-white text-white hover:bg-white/10"
               }`}
               title={trilhaSalva ? "Remover das salvas" : "Salvar trilha"}
             >
               {trilhaSalva ? (
                 <BookmarkCheck className="w-4 h-4" />
               ) : (
                 <Bookmark className="w-4 h-4" />
               )}
               {salvando ? "..." : trilhaSalva ? "SALVA" : "SALVAR"}
             </button>
           )}
          <button className="flex items-center gap-2 border-2 border-white rounded-xl px-3 py-1 text-white font-bold transform active:translate-y-1 shadow-[0_6px_0px_rgba(0,0,0,0.2)] active:shadow-[0_2px_0px_rgba(0,0,0,0.3)] transition-all duration-150">
            <BookText className="w-4 h-4 " />
            GUIA
          </button>
        </div>
      </div>

      {/* Trilhas */}
      {fases.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-lg text-gray-600">
            Nenhuma fase cadastrada nesta trilha ainda.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            As fases aparecerão aqui quando forem criadas.
          </p>
        </div>
      ) : (
        <div
          ref={tracksRef}
          className="relative w-full max-w-3xl flex flex-col items-center gap-12 px-6"
        >
          {/* Personagem */}
          <motion.div
            ref={characterRef}
            animate={controls}
            initial={characterPos}
            className="absolute z-50 text-4xl pointer-events-none"
            style={{
              left: 0,
              top: 0,
              transform: characterFacingRight ? "scaleX(1)" : "scaleX(-1)",
            }}
          >
            🧑‍🚀
          </motion.div>

          {/* Overlay */}
          <AnimatePresence>
            {tooltipIndex !== null && (
              <motion.div
                key="overlay"
                className="fixed inset-0 bg-black/30 z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTooltipIndex(null)}
              />
            )}
          </AnimatePresence>

          {fases.map((fase, index) => {
            // Lógica de bloqueio progressivo:
            // - A primeira fase (index 0) sempre está desbloqueada
            // - Uma fase só é desbloqueada se a fase anterior estiver concluída
            const faseAnterior = index > 0 ? fases[index - 1] : null;
            const faseAnteriorCompletada = faseAnterior 
              ? progressoFases.get(faseAnterior._id) || false
              : true; // Se não há fase anterior, considera como concluída (desbloqueia a primeira)
            
            const isLocked = index > 0 && !faseAnteriorCompletada;
            const isCompletada = progressoFases.get(fase._id) || false;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={fase._id}
                className={`w-full flex items-center ${
                  isLeft ? "justify-start pl-56" : "justify-end pr-56"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <button
                    ref={(el) => {
                      buttonRefs.current[index] = el;
                    }}
                    onClick={() => handleButtonClick(index)}
                    className={`w-20 h-20 shadow-[0_6px_0px_rgba(0,0,0,0.2)] flex items-center justify-center text-2xl font-bold rounded-circle
                      transform active:translate-y-1 active:shadow-[0_2px_0px_rgba(0,0,0,0.3)]
                      transition-all duration-150 ${
                        isLocked
                          ? "bg-blue-500 text-gray-400 opacity-50 cursor-pointer"
                          : isCompletada
                          ? "bg-green-500 text-yellow-300 hover:scale-105 ring-2 ring-green-300"
                          : "bg-blue-500 text-yellow-300 hover:scale-105"
                      }`}
                    title={isCompletada ? "Fase concluída ✓" : isLocked ? "Fase bloqueada" : "Fase disponível"}
                  >
                    {isCompletada ? "✓" : "★"}
                  </button>

                  {tooltipIndex === index && (
                    <TooltipDescricao
                      fase={fase}
                      onStart={() => handleStart(fase._id)}
                      isLocked={isLocked}
                      isCompletada={isCompletada}
                      mensagemBloqueio={
                        isLocked && faseAnterior
                          ? `Complete a fase anterior "${faseAnterior.titulo}" para desbloquear`
                          : undefined
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão voltar ao topo */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
