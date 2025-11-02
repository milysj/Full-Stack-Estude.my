"use client";

import Carrousel from "@/app/components/Carrousel";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import Script from "next/script";
import { useState, useEffect, useLayoutEffect } from "react";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
  imagem?: string; // Campo do backend
}

export default function MenuTrilhas() {
  const [isMobile, setIsMobile] = useState(false);
  const [trilhasSalvas, setTrilhasSalvas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    document.title = "Lições Salvas - Estude.My";
  }, []);

  // Hook para detectar se está em tela mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Carregar trilhas salvas
  useEffect(() => {
    const carregarTrilhasSalvas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/licoes-salvas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setTrilhasSalvas(Array.isArray(data) ? data : []);
        } else {
          console.error("Erro ao carregar trilhas salvas");
          setTrilhasSalvas([]);
        }
      } catch (error) {
        console.error("Erro ao carregar trilhas salvas:", error);
        setTrilhasSalvas([]);
      } finally {
        setLoading(false);
      }
    };

    carregarTrilhasSalvas();
  }, []);

  const handleTrilhaClick = (id: string) => {
    window.location.href = `/pages/trilha?trilhaId=${id}`;
  };

  return (
    <>
      {/* Microsoft Clarity Script */}
      <Script id="microsoft-clarity" strategy="afterInteractive">
        {`
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "tvolq13xii");
        `}
      </Script>

      {/* Container principal da página */}
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/img/backgroundteste1.png')",
          backgroundColor: "#f3f4f6",
        }}
      >
        {/* Container relativo para controle de z-index */}
        <div className="relative z-10">
          {/* Estrutura principal da página */}
          <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between">
            {/* Topo / Barra de navegação */}
            <Topo />

            {/* Seção "Lições Salvas" */}
            <div
              className={`pt-3 w-full ${
                isMobile ? "px-4" : "max-w-6xl mx-auto px-24"
              }`}
            >
              <div
                className={`${
                  isMobile ? "text-2xl" : "text-3xl"
                } p-4 rounded-xl text-gray-800 font-bold bg-white bg-opacity-80 backdrop-blur-sm`}
              >
                Lições Salvas
              </div>
              {loading ? (
                <p className="text-gray-600 p-4">Carregando...</p>
              ) : trilhasSalvas.length === 0 ? (
                <p className="text-gray-600 p-4">
                  Você ainda não salvou nenhuma trilha.
                </p>
              ) : (
                <Carrousel items={trilhasSalvas} onClick={handleTrilhaClick} />
              )}
            </div>
          </div>

          {/* Rodapé */}
          <Footer />
        </div>
      </div>
    </>
  );
}
