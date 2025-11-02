"use client";

import { useEffect, useState, useLayoutEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "react-bootstrap";

function RecuperarSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [tokenValido, setTokenValido] = useState<boolean | null>(null);
  const [verificando, setVerificando] = useState(true);

  useLayoutEffect(() => {
    document.title = "Recuperar Senha - Estude.My";
  }, []);

  useEffect(() => {
    const verificarToken = async () => {
      if (!token) {
        setTokenValido(false);
        setVerificando(false);
        return;
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(
          `${API_URL}/api/users/verificar-token/${token}`
        );

        if (res.ok) {
          const data = await res.json();
          setTokenValido(data.valid);
        } else {
          setTokenValido(false);
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
        setTokenValido(false);
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token]);

  const handleRedefinir = async () => {
    if (!token) {
      setErro("Token inválido");
      return;
    }

    if (!novaSenha || !confirmarSenha) {
      setErro("Por favor, preencha todos os campos");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }

    setSalvando(true);
    setErro("");
    setSucesso("");

    try {
      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${API_URL}/api/users/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          novaSenha,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErro(data.message || "Erro ao redefinir senha");
        return;
      }

      setSucesso("Senha redefinida com sucesso! Redirecionando para login...");
      setTimeout(() => {
        router.push("/pages/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      setErro("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Verificando token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        style={{
          backgroundImage: `url('/img/background-image-login-register.png')`,
        }}
      >
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="mb-6 text-center">
            <Image
              width={400}
              height={128}
              src="/svg/EstudeMyLogo.svg"
              alt="Logo"
            />
          </div>
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Token inválido ou expirado. Solicite uma nova recuperação de
              senha.
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/pages/login")}
            >
              Voltar para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      style={{
        backgroundImage: `url('/img/background-image-login-register.png')`,
      }}
    >
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <Image
            width={400}
            height={128}
            src="/svg/EstudeMyLogo.svg"
            alt="Logo"
          />
        </div>

        <h2 className="text-2xl font-bold text-center mb-4">Redefinir Senha</h2>

        <div className="space-y-3">
          <div className="flex flex-col">
            <label className="text-sm text-left mb-1">Nova senha:</label>
            <input
              type="password"
              placeholder="Digite sua nova senha"
              className="rounded-lg py-2 px-3 text-sm border border-gray-300 w-full"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm text-left mb-1">
              Confirmar nova senha:
            </label>
            <input
              type="password"
              placeholder="Confirme sua nova senha"
              className="rounded-lg py-2 px-3 text-sm border border-gray-300 w-full"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              required
            />
          </div>

          {erro && <p className="text-red-600 text-sm">{erro}</p>}
          {sucesso && <p className="text-green-600 text-sm">{sucesso}</p>}

          <Button
            type="button"
            variant="primary"
            onClick={handleRedefinir}
            disabled={salvando}
            className="w-full"
          >
            {salvando ? "Redefinindo..." : "Redefinir Senha"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      }
    >
      <RecuperarSenhaContent />
    </Suspense>
  );
}
