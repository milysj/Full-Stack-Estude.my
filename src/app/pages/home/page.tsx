"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Script from "next/script";
import Topo from "@/app/components/Topo";
import Footer from "@/app/components/Footer";
import Carrousel from "@/app/components/Carrousel";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Trilha {
  _id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: string;
  image?: string;
}

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [continueTrilhas, setContinueTrilhas] = useState<Trilha[]>([]);
  const [novidades, setNovidades] = useState<Trilha[]>([]);
  const [populares, setPopulares] = useState<Trilha[]>([]);

  const [loadingContinue, setLoadingContinue] = useState(true);
  const [loadingNovidades, setLoadingNovidades] = useState(true);
  const [loadingPopulares, setLoadingPopulares] = useState(true);

  useLayoutEffect(() => {
    document.title = "Home - Estude.My";
  }, []);

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 992);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const savedToken = localStorage.getItem("token");

    const requestInit: RequestInit = {
      headers: savedToken
        ? { Authorization: `Bearer ${savedToken}` }
        : undefined,
      signal: abortController.signal,
    };

    // Função para buscar novidades
    const fetchNovidades = async () => {
      if (isMounted) setLoadingNovidades(true);
      try {
        const res = await fetch(
          `${API_URL}/api/trilhas/novidades`,
          requestInit
        );
        if (!res.ok || !isMounted) {
          if (!isMounted) return;
          console.error("Erro ao buscar novidades:", await res.text());
          setNovidades([]);
          setLoadingNovidades(false);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setNovidades(Array.isArray(data) ? data : []);
          setLoadingNovidades(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro no fetch novidades:", err);
        setNovidades([]);
        setLoadingNovidades(false);
      }
    };

    // Função para buscar populares
    const fetchPopulares = async () => {
      if (isMounted) setLoadingPopulares(true);
      try {
        const res = await fetch(
          `${API_URL}/api/trilhas/populares`,
          requestInit
        );
        if (!res.ok || !isMounted) {
          if (!isMounted) return;
          console.error("Erro ao buscar populares:", await res.text());
          setPopulares([]);
          setLoadingPopulares(false);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setPopulares(Array.isArray(data) ? data : []);
          setLoadingPopulares(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro no fetch populares:", err);
        setPopulares([]);
        setLoadingPopulares(false);
      }
    };

    // Função para buscar continue (trilhas do usuário) – só se houver token
    const fetchContinue = async () => {
      if (!savedToken) {
        if (isMounted) setLoadingContinue(false);
        return;
      }
      if (isMounted) setLoadingContinue(true);
      try {
        const res = await fetch(`${API_URL}/api/trilhas/continue`, {
          headers: { Authorization: `Bearer ${savedToken}` },
          signal: abortController.signal,
        });
        if (!res.ok || !isMounted) {
          if (!isMounted) return;
          console.error("Erro ao buscar trilhas iniciadas:", await res.text());
          setContinueTrilhas([]);
          setLoadingContinue(false);
          return;
        }
        const data = await res.json();
        if (isMounted) {
          setContinueTrilhas(Array.isArray(data) ? data : []);
          setLoadingContinue(false);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        if (!isMounted) return;
        console.error("Erro no fetch continue:", err);
        setContinueTrilhas([]);
        setLoadingContinue(false);
      }
    };

    // Chamar todas as funções
    fetchNovidades();
    fetchPopulares();
    fetchContinue();

    // Guardar token no estado
    if (savedToken && isMounted) setToken(savedToken);

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []);
  // Navegação e registro de visualização
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

      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/img/backgroundteste1.png')",
          backgroundColor: "#f3f4f6",
        }}
      >
        <div className="relative z-10 flex flex-col min-h-screen">
          <Topo />

          <Section title="Continue" isMobile={isMobile}>
            {loadingContinue ? (
              <p className="text-gray-600 p-4 text-center">Carregando...</p>
            ) : (
              <Carrousel items={continueTrilhas} onClick={handleTrilhaClick} />
            )}
          </Section>

          <Section title="Novidades" isMobile={isMobile}>
            {loadingNovidades ? (
              <p className="text-gray-600 p-4 text-center">Carregando...</p>
            ) : (
              <Carrousel items={novidades} onClick={handleTrilhaClick} />
            )}
          </Section>

          <Section title="Melhores para você" isMobile={isMobile}>
            {loadingPopulares ? (
              <p className="text-gray-600 p-4 text-center">Carregando...</p>
            ) : (
              <Carrousel items={populares} onClick={handleTrilhaClick} />
            )}
          </Section>
        </div>
        <Footer />
      </div>
    </>
  );
}

function Section({
  title,
  children,
  isMobile,
}: {
  title: string;
  children: React.ReactNode;
  isMobile: boolean;
}) {
  return (
    <div
      className={`pt-6 w-full ${isMobile ? "px-4" : "max-w-6xl mx-auto px-24"}`}
    >
      <div
        className={`${
          isMobile ? "text-2xl" : "text-3xl"
        } p-4 rounded-xl font-bold text-gray-800 bg-white bg-opacity-80 backdrop-blur-sm`}
      >
        {title}
      </div>
      {children}
    </div>
  );
}
