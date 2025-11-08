"use client";

import Cadastrar from "@/app/components/Cadastro"; // Importa o componente de cadastro
import Script from "next/script";
import { useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
    const router = useRouter();

    useLayoutEffect(() => {
        document.title = "Cadastro - Estude.My";
    }, []);

    useEffect(() => {
        const verificarAutenticacao = async () => {
            const token = localStorage.getItem("token");
            
            if (!token) {
                return; // Não está autenticado, pode ver a página de cadastro
            }

            // Verificar se o token é válido
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const res = await fetch(`${API_URL}/api/users/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    // Token válido, usuário já está autenticado, redirecionar para home
                    router.push("/pages/home");
                } else {
                    // Token inválido, remover e permitir acesso à página de cadastro
                    localStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Erro ao verificar autenticação:", error);
                // Em caso de erro, remover token e permitir acesso
                localStorage.removeItem("token");
            }
        };

        verificarAutenticacao();
    }, [router]);

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
        
            {/* ===========================
          Container principal da página
          =========================== */}
            <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between bg-gray-50">

                {/* Componente de cadastro */}
                <Cadastrar/>
            </div>
        </>

        
    );
}
