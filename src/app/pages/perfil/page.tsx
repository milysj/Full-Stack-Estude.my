"use client";

import { useEffect, useState, useLayoutEffect } from "react";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import Link from "next/link";
import Image from "next/image";
import ExperienceBar from "@/app/components/ExperienceBar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface UserData {
  usuario: {
    _id: string;
    nome: string;
    email: string;
    username: string;
    personagem: string;
    fotoPerfil: string;
    materiaFavorita: string;
    xpTotal: number;
    telefone?: string;
    endereco?: string;
  };
  nivel: number;
  xpAtual: number;
  xpNecessario: number;
  xpAcumulado: number;
}

export default function PerfilPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useLayoutEffect(() => {
    document.title = "Perfil - Estude.My";
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/pages/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Buscar dados de progresso e dados pessoais em paralelo
        const [progressoRes, userRes] = await Promise.all([
          fetch(`${API_URL}/api/progresso/usuario`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!progressoRes.ok || !userRes.ok) {
          if (progressoRes.status === 401 || userRes.status === 401) {
            router.push("/pages/login");
            return;
          }
          throw new Error("Erro ao buscar dados do usuário");
        }

        const progressoData = await progressoRes.json();
        const userDataFull = await userRes.json();

        // Mesclar dados
        setUserData({
          ...progressoData,
          usuario: {
            ...progressoData.usuario,
            telefone: userDataFull.telefone,
            endereco: userDataFull.endereco,
          },
        });
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Carregando...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">
          Erro ao carregar dados do usuário.
        </p>
      </div>
    );
  }

  // Obter imagem do personagem
  const getPersonagemImage = (personagem: string) => {
    const personagemLower = personagem?.toLowerCase() || "";
    if (personagemLower === "guerreiro") return "/img/personagem.png";
    if (personagemLower === "mago") return "/img/personagem.png"; // Ajustar quando tiver imagem
    if (personagemLower === "samurai") return "/img/personagem.png"; // Ajustar quando tiver imagem
    return "/img/personagem.png"; // Default
  };

  return (
    <ProtectedRoute>
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/img/backgroundteste1.png')",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div className="relative z-0">
          <div className="flex flex-col min-h-screen">
            <Topo />

            <div className="pt-3 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 bg-white mt-4 mb-4">
              {/* Imagem do personagem */}
              <div className="text-3xl p-3 rounded-xl flex justify-center">
                <Image
                  className="mx-auto"
                  src={
                    userData.usuario.fotoPerfil ||
                    getPersonagemImage(userData.usuario.personagem)
                  }
                  alt={`Imagem do personagem ${
                    userData.usuario.personagem || "Personagem"
                  }`}
                  width={90}
                  height={90}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getPersonagemImage(
                      userData.usuario.personagem
                    );
                  }}
                />
              </div>

              {/* Nome do personagem */}
              <div className="character text-center mb-4">
                <p className="font-bold text-lg md:text-xl">
                  {userData.usuario.username ||
                    userData.usuario.nome ||
                    "Usuário"}
                </p>
                {userData.usuario.personagem && (
                  <p className="text-sm text-gray-600">
                    {userData.usuario.personagem}
                  </p>
                )}
              </div>

              {/* Barra de Experiência */}
              <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 mb-4">
                <ExperienceBar
                  currentLevel={userData.nivel}
                  currentXp={userData.xpAtual}
                  xpToNextLevel={userData.xpNecessario}
                />
              </div>

              {/* Informações adicionais */}
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  XP Total: {userData.usuario.xpTotal || 0}
                </p>
              </div>

              {/* Link para dados pessoais se não estiverem completos */}

              {/* Botões de navegação do perfil */}
              <div className="buttons-container flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 px-4">
                <Link
                  className="blue-btn w-full sm:w-auto text-center"
                  href={"/pages/dadosPessoais"}
                >
                  DADOS PESSOAIS
                </Link>
                <Link
                  className="blue-btn w-full sm:w-auto text-center"
                  href={"/pages/conta"}
                >
                  CONTA
                </Link>
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
