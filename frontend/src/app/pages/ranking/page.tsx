"use client";

import React, { useEffect, useLayoutEffect } from "react";
import Topo from "@/app/components/Topo"; // Componente do topo/navegação
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Ranking from "@/app/components/Ranking"; // Componente que exibe o ranking de usuários

export default function RankingPage() {
  useLayoutEffect(() => {
    document.title = "Ranking - Estude.My";
  }, []);

  return (
    <>
      {/* ===========================
          Container principal da página
          =========================== */}
      <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/img/backgroundteste1.png')", // Imagem de fundo
          backgroundColor: "#f3f4f6", // Cor de fundo alternativa
        }}
      >
        {/* ===========================
            Container relativo para z-index
            =========================== */}
        <div className="relative z-10">
          {/* ===========================
              Estrutura principal da página
              =========================== */}
          <div className="">
            {/* Topo / Barra de navegação */}
            <Topo />

            {/* Área de conteúdo principal */}
            <div className=" flex items-center justify-center min-h-screen">
              <Ranking />
            </div>

            {/* Rodapé */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
