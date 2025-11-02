"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus, Save, X, FileText, ArrowLeft } from "lucide-react";
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
  const [novaFase, setNovaFase] = useState({ titulo: "", descricao: "", ordem: 1 });
  const [faseEditando, setFaseEditando] = useState<string | null>(null);
  const [faseEditada, setFaseEditada] = useState<Fase | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string>("");

  useLayoutEffect(() => {
    document.title = "Gerenciar Fases - Estude.My";
  }, []);

  useEffect(() => {
    if (!trilhaId) return;
    carregarFases();
  }, [trilhaId]);

  const carregarFases = async () => {
    if (!trilhaId) return;
    
    setLoading(true);
    setErro("");
    try {
      const data = await buscarFasesPorTrilha(trilhaId);
      setFases(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar fases:", error);
      setErro(error.message || "Erro ao carregar fases");
    } finally {
      setLoading(false);
    }
  };

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

      setFases(fases.map((f) => (f._id === faseAtualizada._id ? faseAtualizada : f)));
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
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">
            Gerenciar Fases da Trilha
          </h1>
          {titulo && (
            <p className="text-gray-600">{titulo}</p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/pages/gerenciarTrilha")}
          className="flex items-center gap-2"
          disabled={loading}
        >
          <ArrowLeft size={16} />
          Voltar
        </Button>
      </div>

      {erro && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {erro}
        </div>
      )}

      {/* Botões de ação */}
      <div className="mb-6 flex gap-3">
        <Button
          onClick={() => router.push(`/pages/criarFase?trilhaId=${trilhaId}`)}
          className="flex items-center gap-2"
        >
          <FileText size={16} />
          Criar Fase com Perguntas
        </Button>
      </div>

      {/* Formulário para criar nova fase (rápida) */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus size={20} />
          Criar Fase Rápida (sem perguntas)
        </h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Título da fase *"
            value={novaFase.titulo}
            onChange={(e) => setNovaFase({ ...novaFase, titulo: e.target.value })}
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={novaFase.descricao}
            onChange={(e) =>
              setNovaFase({ ...novaFase, descricao: e.target.value })
            }
            className="border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Ordem:</label>
            <input
              type="number"
              min="1"
              value={novaFase.ordem}
              onChange={(e) =>
                setNovaFase({ ...novaFase, ordem: parseInt(e.target.value) || 1 })
              }
              className="border rounded p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>
          <Button
            onClick={handleCriarFase}
            disabled={loading || !novaFase.titulo.trim()}
            className="w-full"
          >
            {loading ? "Criando..." : "Criar Fase"}
          </Button>
        </div>
      </div>

      {/* Lista de fases */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mb-4">
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
              className="border p-4 rounded-lg bg-white hover:shadow-md transition-shadow"
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
                    className="w-full border rounded p-2 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    disabled={loading}
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Ordem:</label>
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
                      className="border rounded p-2 w-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSalvarEdicao}
                      disabled={loading}
                      size="sm"
                      className="flex-1"
                    >
                      <Save size={16} className="mr-2" />
                      Salvar
                    </Button>
                    <Button
                      onClick={handleCancelarEdicao}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <X size={16} className="mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                // Modo de visualização
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-500">
                        Ordem: {fase.ordem}
                      </span>
                    </div>
                    <h2 className="font-bold text-lg mb-1">{fase.titulo}</h2>
                    <p className="text-gray-600">{fase.descricao || "Sem descrição"}</p>
                    {fase.perguntas && (
                      <p className="text-sm text-gray-500 mt-2">
                        {fase.perguntas.length} pergunta(s)
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/pages/criarFase?faseId=${fase._id}&trilhaId=${trilhaId}`)}
                      disabled={loading}
                      title="Editar fase e perguntas"
                    >
                      <FileText size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIniciarEdicao(fase)}
                      disabled={loading}
                      title="Editar informações básicas"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletarFase(fase._id!)}
                      disabled={loading}
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
