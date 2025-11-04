"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Edit2,
  Trash2,
  Plus,
  Save,
  X,
  FileText,
  ArrowLeft,
} from "lucide-react";
import {
  buscarFasesPorTrilha,
  criarFase,
  atualizarFase,
  deletarFase,
} from "@/app/services/faseService";

interface Fase {
  _id?: string;
  titulo: string;
  descricao: string;
  ordem: number;
  perguntas?: any[];
  trilhaId?: any;
}

export default function GerenciarFasesConteudo() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const titulo = searchParams.get("titulo");
  const trilhaId = searchParams.get("trilhaId");

  const [fases, setFases] = useState<Fase[]>([]);
  const [novaFase, setNovaFase] = useState({
    titulo: "",
    descricao: "",
    ordem: 1,
  });
  const [faseEditando, setFaseEditando] = useState<string | null>(null);
  const [faseEditada, setFaseEditada] = useState<Fase | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>("");

  useLayoutEffect(() => {
    document.title = "Gerenciar Fases - Estude.My";
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    if (!trilhaId) return;

    const carregarFases = async () => {
      if (!trilhaId || !isMounted) return;

      setLoading(true);
      setErro("");
      try {
        // Como buscarFasesPorTrilha não aceita signal diretamente, vamos fazer fetch manualmente
        const token = localStorage.getItem("token");
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        const response = await fetch(
          `${API_URL}/api/fases/trilha/${trilhaId}`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            signal: abortController.signal,
          }
        );

        if (!isMounted) return;

        if (!response.ok) {
          throw new Error(
            `Erro ao buscar fases da trilha: ${response.statusText}`
          );
        }

        const data = await response.json();

        if (isMounted) {
          setFases(data || []);
        }
      } catch (error: any) {
        if (error instanceof Error && error.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro ao carregar fases:", error);
        setErro(error.message || "Erro ao carregar fases");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarFases();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [trilhaId]);

  const handleCriarFase = async () => {
    if (!trilhaId) {
      setErro("Nenhuma trilha selecionada!");
      return;
    }

    if (!novaFase.titulo.trim()) {
      setErro("O título da fase é obrigatório!");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const faseData = {
        trilhaId,
        titulo: novaFase.titulo,
        descricao: novaFase.descricao || "",
        ordem: novaFase.ordem || fases.length + 1,
        perguntas: [],
      };

      const faseCriada = await criarFase(faseData);
      setFases([...fases, faseCriada]);
      setNovaFase({ titulo: "", descricao: "", ordem: fases.length + 2 });
    } catch (error: any) {
      console.error("Erro ao criar fase:", error);
      setErro(error.message || "Erro ao criar fase");
    } finally {
      setLoading(false);
    }
  };

  const handleIniciarEdicao = (fase: Fase) => {
    setFaseEditando(fase._id!);
    setFaseEditada({ ...fase });
  };

  const handleCancelarEdicao = () => {
    setFaseEditando(null);
    setFaseEditada(null);
  };

  const handleSalvarEdicao = async () => {
    if (!faseEditada || !faseEditada._id) return;

    if (!faseEditada.titulo.trim()) {
      setErro("O título da fase é obrigatório!");
      return;
    }

    setLoading(true);
    setErro("");
    try {
      const faseAtualizada = await atualizarFase(faseEditada._id, {
        titulo: faseEditada.titulo,
        descricao: faseEditada.descricao || "",
        ordem: faseEditada.ordem,
        perguntas: faseEditada.perguntas || [],
      });

      setFases(
        fases.map((f) => (f._id === faseAtualizada._id ? faseAtualizada : f))
      );
      setFaseEditando(null);
      setFaseEditada(null);
    } catch (error: any) {
      console.error("Erro ao atualizar fase:", error);
      setErro(error.message || "Erro ao atualizar fase");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletarFase = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta fase?")) return;

    setLoading(true);
    setErro("");
    try {
      await deletarFase(id);
      setFases(fases.filter((f) => f._id !== id));
    } catch (error: any) {
      console.error("Erro ao deletar fase:", error);
      setErro(error.message || "Erro ao deletar fase");
    } finally {
      setLoading(false);
    }
  };

  if (!trilhaId) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <p className="text-red-500">Erro: Nenhuma trilha selecionada!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-lg overflow-x-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <Button
            variant="outline"
            onClick={() => router.push("/pages/gerenciarTrilha")}
            className="flex items-center gap-2 w-full sm:w-auto shrink-0"
            disabled={loading}
          >
            <ArrowLeft size={16} />
            <span className="whitespace-nowrap">Voltar</span>
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold mb-2 break-words">
            Gerenciar Fases da Trilha
          </h1>
          {titulo && (
            <p className="text-sm sm:text-base text-gray-600 break-words">
              {titulo}
            </p>
          )}
        </div>
      </div>

      {erro && (
        <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
          {erro}
        </div>
      )}

      {/* Botões de ação */}
      <div className="mb-6 flex gap-2 sm:gap-3">
        <Button
          onClick={() => router.push(`/pages/criarFase?trilhaId=${trilhaId}`)}
          className="flex items-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <FileText size={16} />
          <span className="whitespace-nowrap">Criar Fase com Perguntas</span>
        </Button>
      </div>

      {/* Formulário para criar nova fase (rápida) */}
      <div className="mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="break-words">Criar Fase Rápida (sem perguntas)</span>
        </h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título da fase *"
            value={novaFase.titulo}
            onChange={(e) =>
              setNovaFase({ ...novaFase, titulo: e.target.value })
            }
            className="border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            disabled={loading}
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={novaFase.descricao}
            onChange={(e) =>
              setNovaFase({ ...novaFase, descricao: e.target.value })
            }
            className="border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 w-full resize-none"
            rows={3}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 whitespace-nowrap">
              Ordem:
            </label>
            <input
              type="number"
              min="1"
              value={novaFase.ordem}
              onChange={(e) =>
                setNovaFase({
                  ...novaFase,
                  ordem: parseInt(e.target.value) || 1,
                })
              }
              className="border rounded p-2 w-20 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleCriarFase}
            disabled={loading || !novaFase.titulo.trim()}
            className="w-full text-sm sm:text-base"
          >
            {loading ? "Criando..." : "Criar Fase"}
          </Button>
        </div>
      </div>

      {/* Lista de fases */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-semibold mb-4">
          Fases ({fases.length})
        </h2>
        {loading && fases.length === 0 ? (
          <p className="text-gray-500">Carregando fases...</p>
        ) : fases.length === 0 ? (
          <p className="text-gray-500">Nenhuma fase cadastrada ainda.</p>
        ) : (
          fases.map((fase) => (
            <div
              key={fase._id}
              className="border p-3 sm:p-4 rounded-lg bg-white hover:shadow-md transition-shadow w-full overflow-hidden"
            >
              {faseEditando === fase._id ? (
                // Modo de edição
                <div className="space-y-3">
                  <input
                    type="text"
                    value={faseEditada?.titulo || ""}
                    onChange={(e) =>
                      setFaseEditada({
                        ...faseEditada!,
                        titulo: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 text-sm sm:text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                  />
                  <textarea
                    value={faseEditada?.descricao || ""}
                    onChange={(e) =>
                      setFaseEditada({
                        ...faseEditada!,
                        descricao: e.target.value,
                      })
                    }
                    className="w-full border rounded p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">
                      Ordem:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={faseEditada?.ordem || 1}
                      onChange={(e) =>
                        setFaseEditada({
                          ...faseEditada!,
                          ordem: parseInt(e.target.value) || 1,
                        })
                      }
                      className="border rounded p-2 w-20 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={handleSalvarEdicao}
                      disabled={loading}
                      size="sm"
                      className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                    >
                      <Save size={16} className="mr-2" />
                      Salvar
                    </Button>
                    <Button
                      onClick={handleCancelarEdicao}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="flex-1 w-full sm:w-auto text-sm sm:text-base"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs sm:text-sm font-semibold text-gray-500 whitespace-nowrap">
                        Ordem: {fase.ordem}
                      </span>
                    </div>
                    <h2 className="font-bold text-base sm:text-lg mb-1 break-words">
                      {fase.titulo}
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 break-words">
                      {fase.descricao || "Sem descrição"}
                    </p>
                    {fase.perguntas && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        {fase.perguntas.length} pergunta(s)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto sm:ml-4 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(
                          `/pages/criarFase?faseId=${fase._id}&trilhaId=${trilhaId}`
                        )
                      }
                      disabled={loading}
                      title="Editar fase e perguntas"
                      className="flex-1 sm:flex-none"
                    >
                      <FileText size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIniciarEdicao(fase)}
                      disabled={loading}
                      title="Editar informações básicas"
                      className="flex-1 sm:flex-none"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletarFase(fase._id!)}
                      disabled={loading}
                      className="flex-1 sm:flex-none"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
