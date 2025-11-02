"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  "/",
  "/pages/login",
  "/pages/cadastro",
  "/pages/home", // Página inicial
];

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      // Verificar se a rota é pública
      const isPublicRoute = PUBLIC_ROUTES.some((route) => 
        pathname === route || pathname?.startsWith(route + "/")
      );

      if (isPublicRoute) {
        setIsAuthenticated(true);
        return;
      }

      // Para rotas protegidas, verificar token
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Sem token, redirecionar para login
        router.push("/pages/login");
        setIsAuthenticated(false);
        return;
      }

      // Verificar se o token é válido fazendo uma requisição
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Token inválido ou expirado
          if (res.status === 401) {
            localStorage.removeItem("token");
            router.push("/pages/login");
            setIsAuthenticated(false);
            return;
          }
        }

        // Token válido
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("token");
        router.push("/pages/login");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Mostrar loading enquanto verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não está autenticado e não é rota pública, não renderizar (já redirecionou)
  if (!isAuthenticated && !PUBLIC_ROUTES.some((route) => pathname === route || pathname?.startsWith(route + "/"))) {
    return null;
  }

  return <>{children}</>;
}

