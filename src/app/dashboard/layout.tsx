'use client';

import { Sidebar } from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, isAuthenticated, isLoading, logout } = useUser();
  const router = useRouter();

  useEffect(() => {
    // Só redireciona ao login após confirmar que não há sessão ativa
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Enquanto verifica sessão, não renderiza nada
  if (isLoading) return null;

  // Não autenticado — aguarda redirect
  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-wave-50">
      <Sidebar userProfile={userProfile} onLogout={logout} />
      <main className="flex-1 overflow-y-auto h-screen bg-wave-50">
        {children}
      </main>
    </div>
  );
}
