'use client';

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, isAuthenticated, isLoading, logout } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <Sidebar
        userProfile={userProfile}
        onLogout={logout}
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Barra superior — só existe em telas menores que lg (mobile/tablet).
            É onde o botão de abrir o menu mora, já que o Sidebar fica fora
            da tela por padrão nesse tamanho. */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-wave-100 sticky top-0 z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2 text-wave-600 hover:bg-wave-50 rounded-lg transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg text-wave-800">Wave</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-wave-50">
          {children}
        </main>
      </div>
    </div>
  );
}
