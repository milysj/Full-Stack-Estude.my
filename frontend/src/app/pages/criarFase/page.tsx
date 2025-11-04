"use client";

import { useState, useEffect, useLayoutEffect, Suspense } from "react";
import { ArrowLeft, Plus, Save, X } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  buscarFasePorId,
  atualizarFase,
  criarFase,
} from "@/app/services/faseService";
import { Button } from "@/components/ui/button";

interface Pergunta {
  id: number;
  enunciado: string;
  alternativas: string[];
  respostaCorreta: number;
}

function CriarFaseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const faseId = searchParams.get("faseId");
  const trilhaId = searchParams.get("trilhaId");

  const [trilha, setTrilha] = useState<{ _id: string; titulo?: string } | null>(
    null
  );
  const [fase, setFase] = useState<{
    _id: string;
    titulo?: string;
    descricao?: string;
    conteudo?: string;
    ordem?: number;
    perguntas?: Pergunta[];
  } | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [tituloFase, setTituloFase] = useState("");
  const [descricaoFase, setDescricaoFase] = useState("");
  const [conteudoFase, setConteudoFase] = useState("");
  const [ordemFase, setOrdemFase] = useState(1);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useLayoutEffect(() => {
    document.title = faseId
      ? "Editar Fase - Estude.My"
      : "Criar Fase - Estude.My";
  }, [faseId]);

  // Carregar dados da trilha e fase
  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Se não tiver trilhaId nos params, tentar do localStorage
        const trilhaIdFinal =
          trilhaId ||
          (() => {
            const dados = localStorage.getItem("trilha");
            if (dados) {
              const trilhaObj = JSON.parse(dados);
              return trilhaObj._id;
            }
            return null;
          })();

        // Não buscamos a trilha pois o endpoint GET /api/trilhas/:id não existe
        // Apenas armazenamos o ID para uso posterior
        if (trilhaIdFinal) {
          setTrilha({ _id: trilhaIdFinal });
        }

        // Se tiver faseId, carregar fase existente
        if (faseId) {
          const faseData = (await buscarFasePorId(faseId)) as {
            _id: string;
            titulo?: string;
            descricao?: string;
            conteudo?: string;
            ordem?: number;
            perguntas?: Pergunta[];
          };
          setFase(faseData);
          setTituloFase(faseData.titulo || "");
          setDescricaoFase(faseData.descricao || "");
          setConteudoFase(faseData.conteudo || "");
          setOrdemFase(faseData.ordem || 1);
          // Garantir que todas as perguntas tenham um id único
          const perguntasComId = (faseData.perguntas || []).map(
            (
              pergunta: Partial<Pergunta> & { _id?: string | number },
              index: number
            ) => ({
              id:
                (pergunta.id as number) ||
                (typeof pergunta._id === "number"
                  ? pergunta._id
                  : Date.now() + index),
              enunciado: pergunta.enunciado || "",
              alternativas: pergunta.alternativas || ["", "", "", ""],
              respostaCorreta: pergunta.respostaCorreta ?? 0,
            })
          );
          setPerguntas(perguntasComId);
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar dados:", error);
        setErro(
          error instanceof Error ? error.message : "Erro ao carregar dados"
        );
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, [faseId, trilhaId]);

  const handleAddPergunta = () => {
    setPerguntas((prev) => [
      ...prev,
      {
        id: Date.now(),
        enunciado: "",
        alternativas: ["", "", "", ""],
        respostaCorreta: 0,
      },
    ]);
  };

  const handleRemovePergunta = (perguntaId: number) => {
    setPerguntas((prev) => prev.filter((p) => p.id !== perguntaId));
  };

  const handleChangePergunta = (
    perguntaId: number,
    campo: string,
    valor: string | number,
    altIndex?: number
  ) => {
    setPerguntas((prev) =>
      prev.map((p) =>
        p.id === perguntaId
          ? {
              ...p,
              [campo]:
                campo === "alternativas" && typeof altIndex === "number"
                  ? p.alternativas.map((alt, i) =>
                      i === altIndex ? (valor as string) : alt
                    )
                  : valor,
            }
          : p
      )
    );
  };

  const validarPerguntas = () => {
    for (const pergunta of perguntas) {
      if (!pergunta.enunciado.trim()) {
        return "Todas as perguntas devem ter um enunciado!";
      }
      if (pergunta.alternativas.some((alt) => !alt.trim())) {
        return "Todas as alternativas devem ser preenchidas!";
      }
    }
    return null;
  };

  const salvarFase = async () => {
    const trilhaIdFinal = trilhaId || trilha?._id;

    if (!trilhaIdFinal) {
      setErro("Nenhuma trilha selecionada!");
      return;
    }

    if (!tituloFase.trim()) {
      setErro("O título da fase é obrigatório!");
      return;
    }

    const erroValidacao = validarPerguntas();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const faseData = {
        trilhaId: trilhaIdFinal,
        titulo: tituloFase,
        descricao: descricaoFase,
        conteudo: conteudoFase,
        ordem: ordemFase,
        perguntas: perguntas.map((p) => ({
          enunciado: p.enunciado,
          alternativas: p.alternativas,
          respostaCorreta: p.respostaCorreta,
        })),
      };

      if (faseId && fase) {
        // Atualizar fase existente
        await atualizarFase(faseId, faseData);
        alert("Fase atualizada com sucesso!");
      } else {
        // Criar nova fase
        await criarFase(faseData);
        alert("Fase criada com sucesso!");
      }

      // Redirecionar para gerenciar fases
      router.push(
        `/pages/gerenciarFases?trilhaId=${trilhaIdFinal}&titulo=${
          trilha?.titulo || ""
        }`
      );
    } catch (error: unknown) {
      console.error("Erro ao salvar fase:", error);
      setErro(error instanceof Error ? error.message : "Erro ao salvar fase");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return <p className="p-6">Carregando dados...</p>;

  // Não bloquear se não tiver trilha, apenas avisar
  if (!trilha && !trilhaId && !faseId) {
    return (
      <p className="p-6 text-red-500">Erro: Nenhuma trilha selecionada!</p>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">
            {faseId ? "Editar Fase" : "Criar Nova Fase"}
          </h1>
        </div>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2 w-full sm:w-auto shrink-0"
          disabled={loading || salvando}
        >
          <ArrowLeft size={16} />
          <span className="whitespace-nowrap">Voltar</span>
        </Button>
      </div>
      {(trilha || trilhaId) && (
        <p className="text-sm sm:text-base text-gray-600 mb-6 break-words">
          Trilha: {trilha?.titulo || `ID: ${trilhaId}`}
        </p>
      )}

      {erro && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
          {erro}
        </div>
      )}

      {/* Informações da Fase */}
      <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Informações da Fase
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Fase *
            </label>
            <input
              type="text"
              placeholder="Ex: Fase 1 - Introdução"
              value={tituloFase}
              onChange={(e) => setTituloFase(e.target.value)}
              className="w-full border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={salvando}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              placeholder="Descrição da fase (opcional)"
              value={descricaoFase}
              onChange={(e) => setDescricaoFase(e.target.value)}
              className="w-full border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              disabled={salvando}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conteúdo da Aula/Explicação
            </label>
            <textarea
              placeholder="Adicione uma breve aula ou explicação sobre a matéria (opcional). Este conteúdo será exibido antes das perguntas."
              value={conteudoFase}
              onChange={(e) => setConteudoFase(e.target.value)}
              className="w-full border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={6}
              disabled={salvando}
            />
            <p className="text-xs text-gray-500 mt-1">
              Os alunos poderão ler este conteúdo antes das perguntas ou pular
              direto para o quiz.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem
            </label>
            <input
              type="number"
              min="1"
              value={ordemFase}
              onChange={(e) => setOrdemFase(parseInt(e.target.value) || 1)}
              className="w-32 border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={salvando}
            />
          </div>
        </div>
      </div>

      {/* Perguntas */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
          <h2 className="text-base sm:text-lg font-semibold">Perguntas</h2>
          <button
            className="flex items-center gap-2 bg-blue-500 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
            onClick={handleAddPergunta}
            disabled={salvando}
          >
            <Plus size={16} />{" "}
            <span className="whitespace-nowrap">Adicionar Pergunta</span>
          </button>
        </div>

        {perguntas.length === 0 && (
          <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">
            Nenhuma pergunta criada ainda. Clique em Adicionar Pergunta para
            começar.
          </p>
        )}

        {perguntas.map((p) => (
          <div
            key={p.id}
            className="mb-4 p-3 sm:p-4 border rounded bg-gray-50 w-full overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <h3 className="font-semibold text-sm sm:text-base text-gray-700 break-words">
                Pergunta {perguntas.indexOf(p) + 1}
              </h3>
              <button
                onClick={() => handleRemovePergunta(p.id)}
                className="text-red-600 hover:text-red-800 shrink-0"
                disabled={salvando}
                aria-label="Remover pergunta"
              >
                <X size={18} />
              </button>
            </div>
            <input
              type="text"
              placeholder="Enunciado da pergunta"
              value={p.enunciado}
              onChange={(e) =>
                handleChangePergunta(p.id, "enunciado", e.target.value)
              }
              className="w-full border rounded p-2 mb-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={salvando}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternativas (selecione a correta):
              </label>
              {p.alternativas.map((alt, i) => (
                <div
                  key={`${p.id}-alt-${i}`}
                  className="flex items-center gap-2"
                >
                  <input
                    type="radio"
                    name={`correta-${p.id}`}
                    checked={p.respostaCorreta === i}
                    onChange={() =>
                      handleChangePergunta(p.id, "respostaCorreta", i)
                    }
                    className="cursor-pointer"
                    disabled={salvando}
                  />
                  <input
                    type="text"
                    placeholder={`Alternativa ${i + 1}`}
                    value={alt}
                    onChange={(e) =>
                      handleChangePergunta(
                        p.id,
                        "alternativas",
                        e.target.value,
                        i
                      )
                    }
                    className="flex-1 border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
                    disabled={salvando}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão Salvar */}
      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
        <button
          className="px-4 sm:px-6 py-2 border rounded hover:bg-gray-100 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
          onClick={() => router.back()}
          disabled={salvando}
        >
          <X size={16} />
          Voltar
        </button>
        <button
          className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
          onClick={salvarFase}
          disabled={salvando || !tituloFase.trim()}
        >
          <Save size={16} />{" "}
          {salvando ? "Salvando..." : faseId ? "Atualizar Fase" : "Criar Fase"}
        </button>
      </div>
    </div>
  );
}

export default function CriarFase() {
  return (
    <Suspense fallback={<p className="p-6">Carregando dados...</p>}>
      <CriarFaseContent />
    </Suspense>
  );
}
