import { Suspense } from "react";
import GerenciarFasesConteudo from "@/app/components/GerenciarFases" // Importe o novo componente

// Este é um Server Component por padrão (sem "use client")
export default function GerenciarFases() {
  return (
    // O Suspense mostra um fallback (Carregando...) enquanto
    // o componente filho (que usa o hook) não está pronto.
    <Suspense fallback={<p>Carregando...</p>}>
      <GerenciarFasesConteudo />
    </Suspense>
  );
}
