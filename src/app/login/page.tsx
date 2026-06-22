'use client';

import { Login } from '@/components/Login';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona após o carregamento inicial terminar
    // Evita piscar o dashboard antes de confirmar sessão
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Enquanto carrega, não exibe nada para evitar flash da tela de login
  if (isLoading) return null;

  // Se já autenticado, aguarda o redirect do useEffect
  if (isAuthenticated) return null;

  return <Login onLogin={login} />;
}
