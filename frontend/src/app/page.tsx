"use client";
// Necessário para renderizar este componente no lado do cliente (usa animações e interatividade)

import CoinRain from "@/app/components/CoinRain"; // Efeito visual de moedas caindo

import {motion} from "framer-motion"; // Biblioteca para animações
import Image from "next/image";
import Script from "next/script";
import { useLayoutEffect } from "react";

// Configuração da fonte Jaro


// Ícones e tooltips que aparecem na barra lateral
const tooltips = [
    {icon: "🎮", text: "Estude jogando!", color: "#9CC5EB"},
    {icon: "🏆", text: "Suba no ranking!", color: "#f9bc60"},
    {icon: "💎", text: "Ganhe recompensas!", color: "#7f5af0"},
];

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
            <div className="fixed top-1/2 left-4 z-30 flex flex-col gap-6 -translate-y-1/2 ">
                {tooltips.map(({icon, text, color}, index) => (
                    <div className="group relative flex items-center" key={index}>
                        {/* Ícone com animação e destaque */}
                        <motion.div
                            whileHover={{scale: 1.1}}
                            className="bg-[#163043cc] backdrop-blur-md border-2 p-4 rounded-xl shadow-md cursor-pointer"
                            style={{borderColor: color, boxShadow: `0 0 12px ${color}`}}
                        >
                            <span className="text-3xl">{icon}</span>
                        </motion.div>

                        {/* Tooltip (aparece no hover) */}
                        <motion.div
                            initial={{opacity: 0, x: 0}}
                            whileHover={{opacity: 1, x: 0}}
                            transition={{duration: 0.3}}
                            className="absolute left-16 bg-[#9CC5EB] text-[#163043] px-4 py-2 rounded-md whitespace-nowrap text-md font-bold shadow-lg"
                        >
                            {text}
                        </motion.div>
                    </div>
                ))}
            </div>

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
