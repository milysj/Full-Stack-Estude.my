"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = ["/", "/pages/login", "/pages/cadastro"];

// Cache simples para evitar requisições duplicadas
const authCache: {
  token: string | null;
  isValid: boolean | null;
  timestamp: number;
} = {
  token: null,
  isValid: null,
  timestamp: 0,
};

// Cache válido por 30 segundos
const CACHE_DURATION = 30 * 1000;

// Função helper para verificar se uma rota é pública
const isPublicRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const checkingRef = useRef(false); // Evita requisições simultâneas

  // Verificar se é rota pública ANTES de definir estado inicial
  const publicRoute = isPublicRoute(pathname);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(
    publicRoute ? true : null // Se for pública, já começa como true
  );

  useEffect(() => {
    // Verificar se pathname está definido
    if (!pathname) {
      return;
    }

    // Verificar se é rota pública DENTRO do useEffect
    const isPublic = isPublicRoute(pathname);

    // Se for rota pública, não fazer nada e garantir que está autenticado
    if (isPublic) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      // Evitar requisições simultâneas
      if (checkingRef.current) {
        return;
      }

      // Para rotas protegidas, verificar token
      const token = localStorage.getItem("token");

      if (!token) {
        // Sem token, redirecionar para login SEM fazer requisição
        authCache.token = null;
        authCache.isValid = false;
        router.push("/pages/login");
        setIsAuthenticated(false);
        return;
      }

      // Verificar cache antes de fazer requisição
      const now = Date.now();
      if (
        authCache.token === token &&
        authCache.isValid === true &&
        now - authCache.timestamp < CACHE_DURATION
      ) {
        // Cache válido, usar sem fazer requisição
        setIsAuthenticated(true);
        return;
      }

      checkingRef.current = true;

      // Só fazer requisição se realmente for uma rota protegida E tiver token
      // Usar endpoint leve apenas para verificação de autenticação
      try {
        const API_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${API_URL}/api/users/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Token inválido ou expirado
          if (res.status === 401) {
            localStorage.removeItem("token");
            authCache.token = null;
            authCache.isValid = false;
            authCache.timestamp = now;
            router.push("/pages/login");
            setIsAuthenticated(false);
            checkingRef.current = false;
            return;
          }
        }

        // Token válido - endpoint retorna apenas { authenticated: true, userId: "..." }
        authCache.token = token;
        authCache.isValid = true;
        authCache.timestamp = now;
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        localStorage.removeItem("token");
        authCache.token = null;
        authCache.isValid = false;
        authCache.timestamp = Date.now();
        router.push("/pages/login");
        setIsAuthenticated(false);
      } finally {
        checkingRef.current = false;
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // router não precisa estar nas dependências

  // Mostrar loading enquanto verifica
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Verificando autenticação...</div>
      </div>
    );
  }

  // Se não está autenticado e não é rota pública, não renderizar (já redirecionou)
  if (!isAuthenticated && !publicRoute) {
    return null;
  }

  return <>{children}</>;
}
