"use client";

import { useState, useEffect } from "react";
import { Lock, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Mock de fases
const fases = [
  { id: 1, nome: "Trilha 1", img: "/fases/fase1.jpg", paga: false },
  { id: 2, nome: "Trilha 2", img: "/fases/fase2.jpg", paga: true },
  { id: 3, nome: "Trilha 3", img: "/fases/fase3.jpg", paga: false },
];

// Lista de matérias
const materias = [
  "Matemática",
  "Português",
  "Ciências",
  "História",
  "Geografia",
  "Inglês",
  "Física",
  "Química",
  "Biologia",
];

// Interface da trilha
interface Trilha {
  id?: number;
  _id?: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
  dataTermino: string;
  materia: string;
  dificuldade: string;
  disponibilidade: string;
  pagamento: string;
  faseSelecionada: number | null;
}

export default function GerenciarTrilha() {
  // Estados principais
  const [erros, setErros] = useState<{ [key: string]: string }>({});
  const [trilhas, setTrilhas] = useState<Trilha[]>([]);
  const [trilha, setTrilha] = useState<Trilha>({
    titulo: "",
    descricao: "",
    dataCriacao: "",
    dataTermino: "",
    materia: "",
    dificuldade: "Facil",
    disponibilidade: "Privado",
    pagamento: "Gratuita",
    faseSelecionada: null,
  });
  const [modoEdicao, setModoEdicao] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const router = useRouter();

  // ================== Funções CRUD ==================
  // ================== Funções CRUD ==================

  useEffect(() => {
    const fetchTrilhas = async () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch(`${API_URL}/api/trilhas`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();
          setTrilhas(data);
        } catch (error) {
          console.error("Erro ao carregar trilhas:", error);
        }
      }
    };

    fetchTrilhas();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTrilha((prev) => ({ ...prev, [name]: value }));
  };

  const handleFaseClick = (id: number) => {
    setTrilha((prev) => ({ ...prev, faseSelecionada: id }));
  };

  const validarTrilha = () => {
    const newErros: { [key: string]: string } = {};
    if (!trilha.titulo.trim()) newErros.titulo = "Título é obrigatório";
    if (!trilha.descricao.trim())
      newErros.descricao = "Descrição é obrigatória";
    if (!trilha.materia) newErros.materia = "Matéria é obrigatória";
    if (trilha.faseSelecionada === null)
      newErros.faseSelecionada = "Selecione uma fase";

    setErros(newErros);
    return Object.keys(newErros).length === 0;
  };

  const salvarTrilha = async () => {
    if (!validarTrilha()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado. Faça login novamente.");
      return;
    }

    const url = modoEdicao
      ? `${API_URL}/api/trilhas/${trilha.id}`
      : `${API_URL}/api/trilhas`;
    const method = modoEdicao ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token incluído aqui
        },
        body: JSON.stringify(trilha),
      });

      if (!response.ok) {
        const errData = await response.json();
        console.error("Erro ao salvar trilha:", errData);
        alert("Erro ao salvar trilha. Verifique o login ou os dados.");
        return;
      }

      const novaTrilha = await response.json();

      if (modoEdicao) {
        setTrilhas((prev) =>
          prev.map((t) => (t.id === novaTrilha.id ? novaTrilha : t))
        );
      } else {
        setTrilhas((prev) => [...prev, novaTrilha]);
      }

      resetForm();
      setMostrarFormulario(false);
    } catch (err) {
      console.error("Erro de rede ao salvar trilha:", err);
    }
  };

  const editarTrilha = (t: Trilha) => {
    setTrilha({
      ...t,
      id: t.id ?? (t as any)._id, // garante que id receba o valor de _id caso exista
    });
    setModoEdicao(true);
    setMostrarFormulario(true);
  };

  const deletarTrilha = async (id?: string) => {
    if (!id) return;
    const confirm = window.confirm("Deseja realmente deletar esta trilha?");
    if (!confirm) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Usuário não autenticado!");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/trilhas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setTrilhas((prev) =>
          prev.filter((t) => t.id?.toString() !== id && (t as any)._id !== id)
        );
      } else {
        const erro = await response.json();
        console.error("Erro ao deletar trilha:", erro);
        alert(erro.message || "Erro ao deletar trilha");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setTrilha({
      titulo: "",
      descricao: "",
      dataCriacao: "",
      dataTermino: "",
      materia: "",
      dificuldade: "Facil",
      disponibilidade: "Privado",
      pagamento: "Gratuita",
      faseSelecionada: null,
    });
    setErros({});
    setModoEdicao(false);
  };

  // ================== JSX ==================
  return (
    <div className="flex flex-col items-center p-4 mx-auto w-full max-w-6xl">
      {/* ================= Botão Criar Trilha ================= */}
      <button
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mb-6 self-start"
        onClick={() => {
          resetForm();
          setMostrarFormulario(true);
        }}
      >
        Criar Trilha
      </button>

      {/* ================= Lista de Trilhas ================= */}
      <div className="w-full mb-8">
        <h2 className="text-2xl font-bold mb-4">Minhas Trilhas</h2>
        {trilhas.length === 0 && <p>Nenhuma trilha criada ainda.</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trilhas.map((t) => (
            <div
              key={t.id ?? (t as any)._id} // usa id ou _id do MongoDB
              className="bg-white rounded shadow-md p-4 flex flex-col gap-2"
            >
              <h3 className="font-semibold text-lg">{t.titulo}</h3>
              <p className="text-sm">{t.descricao}</p>
              <p className="text-xs text-gray-500">
                {t.materia} - {t.dificuldade} -{" "}
                {t.pagamento === "Paga" ? "Pago" : "Gratuito"}
              </p>
              <div className="flex justify-between mt-2">
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  onClick={() => editarTrilha(t)}
                >
                  Editar
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/pages/gerenciarFases?trilhaId=${t._id}&titulo=${t.titulo}`
                    )
                  }
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold px-4 py-2 rounded"
                >
                  Gerenciar Fases
                </button>

                <button
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  onClick={() => deletarTrilha(t.id ?? (t as any)._id)}
                >
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= Formulário de criação/edição ================= */}
      {mostrarFormulario && (
        <div className="bg-white p-6 rounded shadow-md w-full max-w-3xl mb-8">
          <h1 className="text-3xl font-bold mb-6">
            {modoEdicao ? "Editar" : "Criar nova"}{" "}
            <span className="text-pink-500">trilha</span>
          </h1>

          <div className="space-y-4">
            {/* Título */}
            <div>
              <label className="block font-semibold mb-1">Nome da trilha</label>
              <input
                type="text"
                name="titulo"
                value={trilha.titulo}
                onChange={handleChange}
                placeholder="Título"
                className="w-full border rounded px-3 py-2"
              />
              {erros.titulo && (
                <p className="text-red-500 text-sm mt-1">{erros.titulo}</p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <label className="block font-semibold mb-1">Descrição</label>
              <textarea
                name="descricao"
                value={trilha.descricao}
                onChange={handleChange}
                placeholder="Descrição"
                className="w-full border rounded px-3 py-2 h-28 resize-none"
              />
              {erros.descricao && (
                <p className="text-red-500 text-sm mt-1">{erros.descricao}</p>
              )}
            </div>

            {/* Datas */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">
                  Data de início
                </label>
                <input
                  type="date"
                  name="dataCriacao"
                  value={trilha.dataCriacao}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">
                  Data de término (opcional)
                </label>
                <input
                  type="date"
                  name="dataTermino"
                  value={trilha.dataTermino}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            {/* Matéria e dificuldade */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block font-semibold mb-1">Matéria</label>
                <select
                  name="materia"
                  value={trilha.materia}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="" disabled>
                    Selecione uma matéria
                  </option>
                  {materias.map((m, i) => (
                    <option key={i} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {erros.materia && (
                  <p className="text-red-500 text-sm mt-1">{erros.materia}</p>
                )}
              </div>
              <div className="flex-1">
                <label className="block font-semibold mb-1">Dificuldade</label>
                <select
                  name="dificuldade"
                  value={trilha.dificuldade}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="Facil">Fácil</option>
                  <option value="Medio">Médio</option>
                  <option value="Dificil">Difícil</option>
                </select>
              </div>
            </div>

            {/* Disponibilidade e pagamento */}
            <div className="flex flex-col sm:flex-row gap-20 justify-content-center">
              <div>
                <p className="font-semibold mb-1">Disponibilidade</p>
                <label className="mr-4">
                  <input
                    type="radio"
                    name="disponibilidade"
                    value="Privado"
                    checked={trilha.disponibilidade === "Privado"}
                    onChange={handleChange}
                    className="mr-1"
                  />{" "}
                  Privado
                </label>
                <label>
                  <input
                    type="radio"
                    name="disponibilidade"
                    value="Aberto"
                    checked={trilha.disponibilidade === "Aberto"}
                    onChange={handleChange}
                    className="mr-1"
                  />{" "}
                  Aberto
                </label>
              </div>
              <div>
                <p className="font-semibold mb-1">Paga ou gratuita</p>
                <label className="mr-4">
                  <input
                    type="radio"
                    name="pagamento"
                    value="Paga"
                    checked={trilha.pagamento === "Paga"}
                    onChange={handleChange}
                    className="mr-1"
                  />{" "}
                  Paga
                </label>
                <label>
                  <input
                    type="radio"
                    name="pagamento"
                    value="Gratuita"
                    checked={trilha.pagamento === "Gratuita"}
                    onChange={handleChange}
                    className="mr-1"
                  />{" "}
                  Gratuita
                </label>
              </div>
            </div>

            {/* Carrossel de fases */}
            <div>
              <p className="font-semibold mb-2">Fases da trilha</p>
              {erros.faseSelecionada && (
                <p className="text-red-500 text-sm mb-2">
                  {erros.faseSelecionada}
                </p>
              )}
              <div className="flex overflow-x-auto gap-4 py-2 justify-content-center">
                {fases.map((fase) => {
                  const isSelected = trilha.faseSelecionada === fase.id;
                  return (
                    <div
                      key={fase.id}
                      onClick={() => handleFaseClick(fase.id)}
                      className={`shrink-0 w-40 h-40 border-4 rounded-xl overflow-hidden relative cursor-pointer transition-all duration-200 transform
                        ${
                          isSelected
                            ? "border-blue-600 shadow-lg scale-105"
                            : "border-gray-300 hover:scale-105 hover:shadow-md"
                        }`}
                    >
                      <img
                        src={fase.img}
                        alt={fase.nome}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        {fase.paga ? <Lock size={14} /> : <Unlock size={14} />}
                        <span>{fase.paga ? "Paga" : "Gratuita"}</span>
                      </div>
                      <div className="absolute bottom-0 w-full bg-black/40 text-white text-center py-1 text-sm">
                        {fase.nome}
                      </div>
                      {isSelected && (
                        <span className="absolute bottom-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                          Selecionado
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Botões Salvar / Cancelar */}
            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                onClick={salvarTrilha}
              >
                {modoEdicao ? "Atualizar" : "Salvar"}
              </button>
              <button
                type="button"
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
                onClick={() => {
                  resetForm();
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
