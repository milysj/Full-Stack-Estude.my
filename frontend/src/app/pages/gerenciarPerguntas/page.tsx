"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Pergunta {
  _id?: string;
  enunciado: string;
  alternativaA: string;
  alternativaB: string;
  alternativaC: string;
  correta: string;
}

export default function GerenciarPerguntas() {
  const { faseId } = useParams();
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [nova, setNova] = useState<Pergunta>({
    enunciado: "",
    alternativaA: "",
    alternativaB: "",
    alternativaC: "",
    correta: "",
  });

  useEffect(() => {
    const carregar = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/perguntas/fase/${faseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPerguntas(data);
    };
    carregar();
  }, [faseId]);

  const criarPergunta = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:5000/api/perguntas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...nova, fase: faseId }),
    });
    const data = await res.json();
    setPerguntas([...perguntas, data]);
    setNova({ enunciado: "", alternativaA: "", alternativaB: "", alternativaC: "", correta: "" });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Gerenciar Perguntas</h1>

      {/* Criar pergunta */}
      <div className="grid gap-2 mb-6">
        <input
          type="text"
          placeholder="Enunciado"
          value={nova.enunciado}
          onChange={(e) => setNova({ ...nova, enunciado: e.target.value })}
          className="border rounded p-2"
        />
        {["A", "B", "C"].map((alt) => (
          <input
            key={alt}
            type="text"
            placeholder={`Alternativa ${alt}`}
            value={nova[`alternativa${alt}` as keyof Pergunta] as string}
            onChange={(e) =>
              setNova({ ...nova, [`alternativa${alt}`]: e.target.value } as Pergunta)
            }
            className="border rounded p-2"
          />
        ))}
        <input
          type="text"
          placeholder="Correta (A, B ou C)"
          value={nova.correta}
          onChange={(e) => setNova({ ...nova, correta: e.target.value.toUpperCase() })}
          className="border rounded p-2"
        />
        <Button onClick={criarPergunta}>Salvar Pergunta</Button>
      </div>

      {/* Lista */}
      {perguntas.map((p) => (
        <div key={p._id} className="border rounded-xl p-4 mb-3 bg-white shadow">
          <h3 className="font-bold">{p.enunciado}</h3>
          <ul className="text-sm mt-2">
            <li>A) {p.alternativaA}</li>
            <li>B) {p.alternativaB}</li>
            <li>C) {p.alternativaC}</li>
            <li>D) {p.alternativaC}</li>
          </ul>
          <p className="text-green-600 mt-2">✅ Resposta correta: {p.correta}</p>
        </div>
      ))}
    </div>
  );
}
