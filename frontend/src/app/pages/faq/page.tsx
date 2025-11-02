import Faq from "@/app/components/Faq";         // Componente de perguntas frequentes
import Footer from "@/app/components/Footer";   // Componente do rodapé
import Topo from "@/app/components/Topo";       // Componente do topo/navegação

export default function Home() {
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

                    {/* Topo / Barra de navegação */}
                    <Topo/>

                    {/* ===========================
              Estrutura principal da página
              =========================== */}
                    <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between">

                        {/* Área principal com FAQ */}
                        <Faq/>

                        {/* Rodapé */}
                        <Footer/>
                    </div>
                </div>
            </div>
        </>
    );
}
