import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'Admin' | 'Morador' | 'Síndico';
  unit: string;
  walletAddress?: string; // mantido por compatibilidade com tipos existentes; não utilizado na arquitetura atual
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const storedUser = localStorage.getItem('wave_mock_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth check failed', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setLoading(true);

    await new Promise(r => setTimeout(r, 800));

    if (!email || !password) {
      setLoading(false);
      return { error: { message: 'Email e senha são obrigatórios' } };
    }

    // Usuários de demonstração pré-definidos
    const DEMO_USERS: Record<string, User> = {
      'sindico@wave.com': {
        id: 'demo-sindico-001',
        email: 'sindico@wave.com',
        name: 'João Silva',
        role: 'Síndico',
        unit: 'Apto 101',
      },
      'morador@wave.com': {
        id: 'demo-morador-001',
        email: 'morador@wave.com',
        name: 'Maria Santos',
        role: 'Morador',
        unit: 'Apto 203',
      },
      'admin@wave.com': {
        id: 'demo-admin-001',
        email: 'admin@wave.com',
        name: 'Administrador Wave',
        role: 'Síndico',
        unit: 'Administração',
      },
    };

    // Verifica usuário de demo
    const emailLower = email.toLowerCase().trim();
    let mockUser: User | null = DEMO_USERS[emailLower] ?? null;

    // Aceita qualquer email/senha como fallback (para demos livres)
    if (!mockUser) {
      mockUser = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0].replace(/[._]/g, ' '),
        role: emailLower.includes('sindico') || emailLower.includes('admin') ? 'Síndico' : 'Morador',
        unit: 'Apto 101',
      };
    }

    try {
      localStorage.setItem('wave_mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      router.push('/dashboard');
      return { error: null };
    } catch (err) {
      console.error(err);
      return { error: { message: 'Erro ao realizar login' } };
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    localStorage.removeItem('wave_mock_user');
    setUser(null);
    router.push('/login');
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
}
