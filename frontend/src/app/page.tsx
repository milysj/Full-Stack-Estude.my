"use client";
// Necessário para renderizar este componente no lado do cliente (usa animações e interatividade)

import CoinRain from "@/app/components/CoinRain"; // Efeito visual de moedas caindo

import {motion} from "framer-motion"; // Biblioteca para animações
import Image from "next/image";
import Script from "next/script";
import { useLayoutEffect } from "react";

// Componente principal da Landing Page
export default function LandingPage() {
    useLayoutEffect(() => {
        document.title = "Estude.My - Aprenda Jogando";
    }, []);
    
    return (
        
        <>
        <Script id="microsoft-clarity" strategy="afterInteractive">
                {`
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "tvolq13xii");
                `}
            </Script>
        <main
            className="h-screen flex flex-col text-white relative overflow-hidden bg-cover bg-center"
            style={{backgroundImage: `url('/img/background-image.png')`}} // Imagem de fundo
        >
            <CoinRain/> {/* Animação de moedas caindo */}

            {/* Barra lateral fixa com ícones e tooltips */}

            {/* Conteúdo principal (logo + botões) */}
            <div
                className="flex-grow flex flex-col justify-center items-center px-4 py-6 overflow-hidden relative z-10">
                <section className="text-center max-w-3xl mb-12">
                    {/* Logo */}
                    <div className="mb-6">
                        <Image
                            width={550}
                            height={128}
                            src="/svg/EstudeMyLogo.svg"
                            alt="Logo Estude.My"
                            className="m-auto h-32 drop-shadow-[4px_4px_0_#000]"
                        />
                    </div>

                    {/* Botões principais (Cadastro / Login) */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-8 mt-10">
                        <motion.a
                            href="/pages/cadastro"
                            whileHover={{scale: 1.05}}
                            className="bg-[#2b9348] text-white px-8 py-4 border-4 border-[#1b1b1b] shadow-[8px_8px_0_0_#000000] rounded-xl font-extrabold text-1xl transition-transform"
                        >
                            Começar agora!
                        </motion.a>

                        <motion.a
                            href="/pages/login"
                            whileHover={{scale: 1.05}}
                            className="bg-[#f9bc60] text-black px-8 py-4 border-4 border-[#1b1b1b] shadow-[8px_8px_0_0_#000000] rounded-xl font-extrabold text-1xl transition-transform"
                        >
                            Entrar
                        </motion.a>
                    </div>
                </section>
            </div>
        </main>
        </>
    );
}
