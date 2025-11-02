"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { buscarFasePorId } from "@/app/services/faseService";

interface Fase {
  _id: string;
  titulo: string;
  descricao: string;
  conteudo?: string;
}

export default function ConteudoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const faseIdParam = searchParams.get("faseId");
  
  const [fase, setFase] = useState<Fase | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  useLayoutEffect(() => {
    document.title = "Conteúdo - Estude.My";
  }, []);

  useEffect(() => {
    const carregarConteudo = async () => {
      try {
        if (!faseIdParam) {
          setErro("Nenhuma fase selecionada.");
          setLoading(false);
          return;
        }

        const faseData = (await buscarFasePorId(faseIdParam)) as Fase;
        setFase(faseData);

        // Se não há conteúdo, redirecionar direto para as perguntas
        if (!faseData.conteudo || !faseData.conteudo.trim()) {
          router.push(`/pages/curso?faseId=${faseIdParam}`);
          return;
        }
      } catch (error) {
        console.error("Erro ao carregar conteúdo:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao carregar o conteúdo da fase.";
        setErro(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    carregarConteudo();
  }, [faseIdParam, router]);

  const handleContinuar = () => {
    if (faseIdParam) {
      router.push(`/pages/curso?faseId=${faseIdParam}`);
    }
  };

  const handlePular = () => {
    if (faseIdParam) {
      router.push(`/pages/curso?faseId=${faseIdParam}`);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Carregando conteúdo...</div>
      </main>
    );
  }

  if (erro || !fase) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <section className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {erro || "Fase não encontrada"}
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

  // Se não há conteúdo, não deveria chegar aqui (já redirecionou), mas por segurança:
  if (!fase.conteudo || !fase.conteudo.trim()) {
    handleContinuar();
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <section className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg border border-gray-200 mx-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {fase.titulo || "Conteúdo da Aula"}
          </h1>
          {fase.descricao && (
            <p className="text-sm text-gray-600 mb-4">{fase.descricao}</p>
          )}
        </div>

        {/* Conteúdo da aula */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Aula</h2>
          <div
            className="prose max-w-none text-gray-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto"
            style={{ minHeight: "200px" }}
          >
            {fase.conteudo}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={handlePular}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Pular
          </button>
          <button
            onClick={handleContinuar}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Continuar para Perguntas
          </button>
        </div>
      </section>
    </main>
  );
}

