'use client';

import { Login } from '@/components/Login';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { hasPendingPasswordReset } from '@/lib/passwordReset';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading, userProfile } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona após o carregamento inicial terminar
    // Evita piscar o dashboard antes de confirmar sessão
    if (!isLoading && isAuthenticated) {
      // Se este e-mail tem uma redefinição de senha pendente (veio do fluxo
      // "Esqueci minha senha"), manda para /reset-password em vez do
      // dashboard normal. Ver src/lib/passwordReset.ts para detalhes e
      // limitações conhecidas dessa checagem.
      if (userProfile.email && hasPendingPasswordReset(userProfile.email)) {
        router.push('/reset-password');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, userProfile, router]);

  // Enquanto carrega, não exibe nada para evitar flash da tela de login
  if (isLoading) return null;

  // Se já autenticado, aguarda o redirect do useEffect
  if (isAuthenticated) return null;

  return <Login onLogin={login} />;
}
