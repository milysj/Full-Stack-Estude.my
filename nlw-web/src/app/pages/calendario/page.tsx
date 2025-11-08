import React from 'react';
import CalendarPage from '@/app/components/Calendario'; // Componente do calendário
import Footer from '@/app/components/Footer';           // Componente do rodapé
import Topo from '@/app/components/Topo';               // Componente do topo/navegação

function App() {
    return (
    <div
        className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
        style={{
          backgroundImage: "url('/img/backgroundteste1.png')", // Imagem de fundo
          backgroundColor: "#f3f4f6", // Cor de fundo alternativa
        }}>
        <div className="relative z-10">
            <div className="flex min-h-screen flex-col justify-between transition-all duration-300">
                <Topo />
                    <div className="pt-3 w-full max-w-11/12 mx-auto px-4">
                    <CalendarPage/>                  
                    </div>
                <Footer />
            </div>
        </div>
    </div>
    );
}

export default App;
