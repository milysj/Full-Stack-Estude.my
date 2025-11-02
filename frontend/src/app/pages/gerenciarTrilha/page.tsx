"use client";

import React, { useEffect, useLayoutEffect } from "react";
import CriarTrilha from "@/app/components/CriarTrilha"; // Componente para criar trilhas
import Footer from "@/app/components/Footer";           // Componente do rodapé
import Topo from "@/app/components/Topo";               // Componente do topo/navegação

export default function CriarTrilhaPage() {
    useLayoutEffect(() => {
        document.title = "Gerenciar Trilha - Estude.My";
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
                    backgroundColor: '#f3f4f6'                           // Cor de fundo alternativa
                }}
            >
                {/* ===========================
            Container relativo para z-index
            =========================== */}
                <div className="relative z-10">

                    {/* ===========================
              Estrutura principal da página
              =========================== */}
                    <div className="flex flex-col min-h-screen">

                        {/* Topo / Barra de navegação */}
                        <Topo/>

                        {/* Área de conteúdo principal: Criar trilha */}
                        <div className="flex flex-6">
                            <CriarTrilha/>
                        </div>

                        {/* Rodapé */}
                        <Footer/>
                    </div>
                </div>
            </div>
        </>
    );
}
