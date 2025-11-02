"use client";

import Carrousel from "@/app/components/Carrousel";
import Footer from "@/app/components/Footer";
import Topo from "@/app/components/Topo";
import Script from "next/script";
import { useState, useEffect, useLayoutEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
}

export default function MeusCursos() {
  const [isMobile, setIsMobile] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [continueTrilhas, setContinueTrilhas] = useState<Trilha[]>([]);
  const [loading, setLoading] = useState(true);

  useLayoutEffect(() => {
    document.title = "Meus Cursos - Estude.My";
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

  // Buscar trilhas iniciadas pelo usuário
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    setToken(savedToken);

    if (savedToken) {
      const fetchTrilhas = async () => {
        try {
          const res = await fetch(`${API_URL}/api/trilhas/continue`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          
          if (res.ok) {
            const data = await res.json();
            setContinueTrilhas(Array.isArray(data) ? data : []);
          } else {
            console.error("Erro ao buscar trilhas iniciadas:", await res.text());
            setContinueTrilhas([]);
          }
        } catch (err) {
          console.error("Erro no fetch continue:", err);
          setContinueTrilhas([]);
        } finally {
          setLoading(false);
        }
      };

      fetchTrilhas();
    } else {
      setLoading(false);
    }
  }, []);

  // Navegação para trilha
  const handleTrilhaClick = (id: string) => {
    // Registrar visualização no backend se houver token
    if (token) {
      fetch(`${API_URL}/api/trilhas/visualizar/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(console.error);
    }
    
    // Redirecionar para a página da trilha com as fases
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
          backgroundColor: '#f3f4f6'
        }}
      >
        {/* Container relativo para controle de z-index */}
        <div className="relative z-10">
          {/* Estrutura principal da página */}
          <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between">
            {/* Topo / Barra de navegação */}
            <Topo />

            {/* Seção "Meus Cursos" */}
            <div className={`pt-3 w-full ${isMobile ? 'px-4' : 'max-w-6xl mx-auto px-24'}`}>
              <div className={`${isMobile ? 'text-2xl' : 'text-3xl'} p-4 rounded-xl text-gray-800 font-bold bg-white bg-opacity-80 backdrop-blur-sm mb-4`}>
                Meus Cursos
              </div>
              {loading ? (
                <div className="text-center text-gray-600 py-6">Carregando seus cursos...</div>
              ) : continueTrilhas.length === 0 ? (
                <div className="text-center text-gray-600 py-6">
                  <p className="mb-4">Você ainda não iniciou nenhum curso.</p>
                  <p className="text-sm">Explore as trilhas disponíveis na página inicial para começar!</p>
                </div>
              ) : (
                <Carrousel items={continueTrilhas} onClick={handleTrilhaClick} />
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