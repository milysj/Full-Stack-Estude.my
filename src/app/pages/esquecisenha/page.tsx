import Esquecisenha from "@/app/components/EsqueciSenha"; // Componente de recuperação de senha

export default function Home() {
    return (
        <>
            {/* ===========================
          Container principal da página
          =========================== */}
            <div className="flex min-h-screen flex-col transition-all duration-300 justify-space-between bg-gray-50">

                {/* Componente de recuperação de senha */}
                <Esquecisenha/>

            </div>
        </>
    );
}
