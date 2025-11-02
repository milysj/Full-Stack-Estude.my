import type {Metadata} from "next";
// 🔹 Importa o tipo Metadata do Next.js (usado para configurar <title>, <meta>, etc.)

import "bootstrap/dist/css/bootstrap.min.css";
// 🔹 Importa o CSS principal do Bootstrap (disponibilizando suas classes globalmente)

import "./globals.css";
// 🔹 Importa o CSS global do projeto (suas customizações próprias)


// 🔹 Configuração de metadados da aplicação (SEO e cabeçalho do HTML)
export const metadata: Metadata = {
    title: "Estude.My", // Título padrão da aplicação
    description: "Plataforma de aprendizado gamificado", // Descrição padrão
};


// 🔹 Layout raiz: envolve todas as páginas do projeto
export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode; // "children" são os componentes das páginas
}>) {
    return (
        // O componente deve sempre retornar <html> e <body>
        // "suppressHydrationWarning" é usado para evitar erros de hidratação
        // quando o HTML do servidor e do cliente são ligeiramente diferentes
        <html lang="en" suppressHydrationWarning={true}>
            <body>
            {children} {/* Aqui todas as páginas/rotas serão renderizadas */}
            </body>
        </html>
    );
}
