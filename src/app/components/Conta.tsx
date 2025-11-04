"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserData {
  nome: string;
  email: string;
  tipoUsuario: string;
  dataNascimento: string;
}

// ===============================
// Componente: MinhaConta
// ===============================
export default function MinhaConta() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mostrarAlterarSenha, setMostrarAlterarSenha] = useState(false);
  const [mostrarExcluirConta, setMostrarExcluirConta] = useState(false);
  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [senhaExcluir, setSenhaExcluir] = useState("");
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const buscarDados = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !isMounted) {
          if (!token) router.push("/pages/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!isMounted) return;

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/pages/login");
            return;
          }
          throw new Error("Erro ao buscar dados");
        }

        const data = await res.json();
        
        if (isMounted) {
          setUserData(data);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
        if (!isMounted) return;
        console.error("Erro ao buscar dados:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    buscarDados();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [router]);

  const handleSair = () => {
    // Remover todos os dados do localStorage relacionados à autenticação
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userData");
    // Redirecionar para login
    router.push("/pages/login");
    // Forçar reload para limpar completamente o estado
    setTimeout(() => {
      window.location.href = "/pages/login";
    }, 100);
  };

  const handleAlterarSenha = async () => {
    if (!senhaForm.senhaAtual || !senhaForm.novaSenha) {
      alert("Por favor, preencha todos os campos");
      return;
    }

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      alert("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/pages/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/mudar-senha`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senhaAtual: senhaForm.senhaAtual,
          novaSenha: senhaForm.novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao alterar senha");
        return;
      }

      alert("Senha alterada com sucesso!");
      setMostrarAlterarSenha(false);
      setSenhaForm({ senhaAtual: "", novaSenha: "", confirmarSenha: "" });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      alert("Erro ao alterar senha");
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluirConta = async () => {
    if (!senhaExcluir) {
      alert("Por favor, digite sua senha para confirmar a exclusão");
      return;
    }

    if (
      !confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita!"
      )
    ) {
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/pages/login");
        return;
      }

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          senha: senhaExcluir,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Erro ao excluir conta");
        return;
      }

      alert("Conta excluída com sucesso!");
      localStorage.removeItem("token");
      router.push("/pages/login");
    } catch (error) {
      console.error("Erro ao excluir conta:", error);
      alert("Erro ao excluir conta");
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 m-auto">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
          <p className="text-center text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center p-4 m-auto">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
          <p className="text-center text-red-600">Erro ao carregar dados</p>
        </div>
      </div>
    );
  }

  const formatarData = (data: string) => {
    if (!data) return "Não informado";
    try {
      const date = new Date(data);
      return date.toLocaleDateString("pt-BR");
    } catch {
      return data;
    }
  };

  return (
    <div className="flex items-center justify-center p-4 m-auto">
      {/* ===============================
          Card principal da conta
          =============================== */}
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
        {/* ===============================
            Cabeçalho com título e botão Sair
            =============================== */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold">Minha Conta</h2>
          <button
            onClick={handleSair}
            className="bg-red-500 text-white px-4 py-1 mt-2 rounded hover:bg-red-600"
          >
            Sair
          </button>
        </div>

        {/* ===============================
            Informações Pessoais
            =============================== */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg border-b pb-1 mb-2">
            Informações da Conta
          </h3>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Nome:</span>
            <span>{userData.nome}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">E-mail:</span>
            <span>{userData.email}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span className="font-medium">Tipo:</span>
            <span>{userData.tipoUsuario}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="font-medium">Data de Nascimento:</span>
            <span>{formatarData(userData.dataNascimento)}</span>
          </div>

          {/* Botões de ação */}
        </div>

        {/* ===============================
            Configurações
            =============================== */}
        <div>
          <h3 className="font-semibold text-lg border-b pb-1 mb-2">
            Configurações
          </h3>
          <button
            onClick={() => router.push("/pages/dadosPessoais")}
            className="bg-blue-600 text-white w-full py-2 rounded mb-2 hover:bg-blue-700"
          >
            Editar Dados Pessoais
          </button>

          {!mostrarAlterarSenha && !mostrarExcluirConta && (
            <>
              <button
                onClick={() => setMostrarAlterarSenha(true)}
                className="bg-sky-400 text-white w-full py-2 rounded mb-2 hover:bg-sky-500"
              >
                Alterar Senha
              </button>
              <button
                onClick={() => setMostrarExcluirConta(true)}
                className="bg-red-500 text-white w-full py-2 rounded hover:bg-red-600"
              >
                Excluir Conta
              </button>
            </>
          )}

          {mostrarAlterarSenha && (
            <div className="mb-4 p-4 border rounded">
              <h4 className="font-semibold mb-3">Alterar Senha</h4>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Senha atual"
                  value={senhaForm.senhaAtual}
                  onChange={(e) =>
                    setSenhaForm({ ...senhaForm, senhaAtual: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Nova senha"
                  value={senhaForm.novaSenha}
                  onChange={(e) =>
                    setSenhaForm({ ...senhaForm, novaSenha: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Confirmar nova senha"
                  value={senhaForm.confirmarSenha}
                  onChange={(e) =>
                    setSenhaForm({
                      ...senhaForm,
                      confirmarSenha: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAlterarSenha}
                    disabled={salvando}
                    className="bg-sky-400 text-white px-4 py-2 rounded hover:bg-sky-500 flex-1 disabled:bg-gray-400"
                  >
                    {salvando ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarAlterarSenha(false);
                      setSenhaForm({
                        senhaAtual: "",
                        novaSenha: "",
                        confirmarSenha: "",
                      });
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {mostrarExcluirConta && (
            <div className="mb-4 p-4 border rounded border-red-300 bg-red-50">
              <h4 className="font-semibold mb-3 text-red-800">Excluir Conta</h4>
              <p className="text-sm text-red-700 mb-3">
                Esta ação não pode ser desfeita. Todos os seus dados serão
                permanentemente excluídos.
              </p>
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Digite sua senha para confirmar"
                  value={senhaExcluir}
                  onChange={(e) => setSenhaExcluir(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleExcluirConta}
                    disabled={salvando}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 flex-1 disabled:bg-gray-400"
                  >
                    {salvando ? "Excluindo..." : "Confirmar Exclusão"}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarExcluirConta(false);
                      setSenhaExcluir("");
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
