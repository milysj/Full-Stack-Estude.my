import React from "react";
import Progresso from "@/app/components/Progresso"; // Componente que exibe o progresso do usuário
import Footer from "@/app/components/Footer";       // Componente do rodapé
import Topo from "@/app/components/Topo";           // Componente do topo/navegação

export default function ProgressoPage() {
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
            Container relativo para controle de z-index
            =========================== */}
                <div className="relative z-10">

                    {/* Estrutura principal da página */}
                    <div className="flex flex-col min-h-screen">

                        {/* Topo / Barra de navegação */}
                        <Topo/>

                        {/* Seção do progresso do usuário */}
                        <div className="flex flex-6">
                            <Progresso/>
                        </div>

                        {/* Rodapé */}
                        <Footer/>
                    </div>
                </div>
            </div>
        </>
    );
}
