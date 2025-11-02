import React from "react";
import Footer from "@/app/components/Footer"; // Componente do rodapé
import Topo from "@/app/components/Topo"; // Componente do topo/navegação
import ConsultAi from "@/app/components/ConsultAi";

export default function DadosPessoaisPage() {
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
            Container relativo para controle de z-index
            =========================== */}
        <div className="relative z-10">
          {/* ===========================
              Estrutura principal da página
              =========================== */}
          <div className="flex min-h-screen flex-col justify-between transition-all duration-300">
            {/* Topo / Barra de navegação */}
            <Topo />

            {/* Área de conteúdo principal: Dados Pessoais */}
            <div className="pt-3 w-7xl max-w-11/12 mx-auto px-4">
              <ConsultAi />
            </div>

            {/* Rodapé */}
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
