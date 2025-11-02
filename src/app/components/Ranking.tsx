"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Usuario {
  position: number;
  name: string;
  initial: string;
  color?: string;
  totalFases?: number;
  totalAcertos?: number;
  totalPerguntas?: number;
  mediaAcertos?: number;
  _id?: string;
}

interface UsuarioNivel {
  position: number;
  name: string;
  initial: string;
  color?: string;
  personagem?: string;
  nivel?: number;
  xpTotal?: number;
  xpAtual?: number;
  xpNecessario?: number;
  _id?: string;
}

export default function Ranking() {
  const [rankingData, setRankingData] = useState<Usuario[]>([]);
  const [rankingNivel, setRankingNivel] = useState<UsuarioNivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [usuarioPosicao, setUsuarioPosicao] = useState<number | null>(null);
  const [usuarioPosicaoNivel, setUsuarioPosicaoNivel] = useState<number | null>(
    null
  );
  const router = useRouter();

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/pages/login");
          return;
        }

        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

        // Carregar ranking de acertos
        const res = await fetch(`${API_URL}/api/ranking`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/pages/login");
            return;
          }
          throw new Error("Erro ao carregar ranking");
        }

        const data = await res.json();

        // Carregar ranking de nível
        const resNivel = await fetch(`${API_URL}/api/ranking/nivel`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let dataNivel: UsuarioNivel[] = [];
        if (resNivel.ok) {
          dataNivel = await resNivel.json();
        }

        // Buscar dados do usuário atual para encontrar sua posição
        try {
          const userRes = await fetch(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.ok) {
            const userData = await userRes.json();

            // Posição no ranking de acertos
            const posicao = data.findIndex(
              (u: Usuario) =>
                u._id &&
                userData._id &&
                u._id.toString() === userData._id.toString()
            );
            if (posicao !== -1) {
              setUsuarioPosicao(posicao + 1);
            }

            // Posição no ranking de nível
            const posicaoNivel = dataNivel.findIndex(
              (u: UsuarioNivel) =>
                u._id &&
                userData._id &&
                u._id.toString() === userData._id.toString()
            );
            if (posicaoNivel !== -1) {
              setUsuarioPosicaoNivel(posicaoNivel + 1);
            }
          }
        } catch (error) {
          console.error("Erro ao buscar dados do usuário:", error);
        }

        const coloredData = data.map((user: Usuario) => {
          let color = "bg-gray-400";
          if (user.position === 1) color = "bg-yellow-400";
          else if (user.position === 2) color = "bg-slate-400";
          else if (user.position === 3) color = "bg-orange-400";

          return { ...user, color };
        });

        const coloredDataNivel = dataNivel.map((user: UsuarioNivel) => {
          let color = "bg-gray-400";
          if (user.position === 1) color = "bg-yellow-400";
          else if (user.position === 2) color = "bg-slate-400";
          else if (user.position === 3) color = "bg-orange-400";

          return { ...user, color };
        });

        setRankingData(coloredData);
        setRankingNivel(coloredDataNivel);
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
      } finally {
        setLoading(false);
      }
    };

    carregarRanking();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-white text-black p-6 flex-col rounded-xl shadow-md max-w-lg">
        <p>Carregando ranking...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 gap-8 flex-nowrap">
      <div className="bg-white text-black p-6 flex flex-col items-center rounded-xl shadow-md w-full max-w-md min-w-[400px] shrink-0">
        <h1>Ranking de Acertos </h1>
        {/* Podium dos 3 primeiros */}
        <div className="flex items-end justify-center gap-4 mb-6 w-full">
          {/* 2º lugar - Prata */}
          {rankingData.slice(1, 2).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥈</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-24 w-16 bg-slate-300 rounded-t-lg flex items-center justify-center flex-col p-2">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}

          {/* 1º lugar - Ouro */}
          {rankingData.slice(0, 1).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥇</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-28 w-16 bg-yellow-400 rounded-t-lg flex items-center justify-center flex-col p-2">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}

          {/* 3º lugar - Bronze */}
          {rankingData.slice(2, 3).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥉</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-20 w-16 bg-orange-400 rounded-t-lg flex items-center justify-center flex-col p-2 gap-1">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Informação da posição do usuário */}
        <h2 className="text-xl font-bold mb-4 text-center">
          {usuarioPosicao
            ? `Você está em ${usuarioPosicao}º lugar`
            : "Ranking Geral"}
        </h2>

        {usuarioPosicao && (
          <p className="text-sm text-gray-600 mb-4 text-center">
            Média de acertos:{" "}
            {rankingData[usuarioPosicao - 1]?.mediaAcertos?.toFixed(1) || 0}% |
            Total de acertos:{" "}
            {rankingData[usuarioPosicao - 1]?.totalAcertos || 0}
          </p>
        )}

        {/* Lista do ranking completo */}
        <div className="w-full space-y-2 max-h-96 overflow-y-auto">
          {rankingData.map((user) => (
            <div
              key={user.position}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              {/* Avatar e nome */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${user.color}`}
                >
                  {user.initial}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    Média: {user.mediaAcertos?.toFixed(1) || 0}% | Acertos:{" "}
                    {user.totalAcertos || 0}
                  </p>
                </div>
              </div>

              {/* Posição no ranking */}
              <span className="text-lg font-bold">#{user.position}</span>
            </div>
          ))}
        </div>

        {/* Botão para continuar */}
      </div>

      {/* Ranking de Nível */}
      <div className="bg-white text-black p-6 flex flex-col items-center rounded-xl shadow-md w-full max-w-md min-w-[400px] shrink-0">
        {/* Título */}
        <h1>Ranking de Nível</h1>

        {/* Podium dos 3 primeiros */}
        <div className="flex items-end justify-center gap-4 mb-6 w-full">
          {/* 2º lugar - Prata */}
          {rankingNivel.slice(1, 2).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥈</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-24 w-16 bg-slate-300 rounded-t-lg flex items-center justify-center flex-col p-2">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}

          {/* 1º lugar - Ouro */}
          {rankingNivel.slice(0, 1).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥇</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-28 w-16 bg-yellow-400 rounded-t-lg flex items-center justify-center flex-col p-2">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}

          {/* 3º lugar - Bronze */}
          {rankingNivel.slice(2, 3).map((user) => (
            <div key={user.position} className="flex flex-col items-center">
              <div className="text-3xl mb-2">🥉</div>
              <div
                className={`${user.color} w-12 h-12 flex items-center justify-center rounded-full text-white font-bold mb-2`}
              >
                {user.initial}
              </div>
              <div className="h-20 w-16 bg-orange-400 rounded-t-lg flex items-center justify-center flex-col p-2 gap-1">
                <p className="text-xs font-bold text-gray-800 truncate w-full text-center">
                  {user.name}
                </p>
                <p className="text-xs text-gray-600">#{user.position}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-xl font-bold mb-4 text-center">
          {usuarioPosicaoNivel
            ? `Você está em ${usuarioPosicaoNivel}º lugar`
            : "Ranking de Nível"}
        </h2>

        {usuarioPosicaoNivel && (
          <p className="text-sm text-gray-600 mb-4 text-center">
            Nível: {rankingNivel[usuarioPosicaoNivel - 1]?.nivel || 1} | XP
            Total: {rankingNivel[usuarioPosicaoNivel - 1]?.xpTotal || 0}
          </p>
        )}

        {/* Lista do ranking de nível */}
        <div className="w-full space-y-2 max-h-96 overflow-y-auto">
          {rankingNivel.map((user) => (
            <div
              key={user.position}
              className="flex items-center justify-between bg-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              {/* Avatar e informações */}
              <div className="flex items-center space-x-4">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${user.color}`}
                >
                  {user.initial}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">
                    {user.personagem && `🧙 ${user.personagem} | `}
                    Nível: {user.nivel || 1} | XP: {user.xpTotal || 0}
                  </p>
                </div>
              </div>

              {/* Posição no ranking */}
              <span className="text-lg font-bold">#{user.position}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
