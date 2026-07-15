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
  photoUrl?: string; // foto de perfil, quando existir uma conta cadastrada com o mesmo e-mail
}

// ---------------------------------------------------------------------------
// Busca, no localStorage de contas criadas (via "Criar Nova Conta"), se existe
// um cadastro com o mesmo e-mail que está fazendo login — e, se existir,
// retorna o registro completo (nome, papel, unidade, foto). É uma ponte
// simples entre dois sistemas mock que hoje não se conversam (login por
// atalho vs. contas cadastradas de verdade). Quando existir backend real de
// autenticação, isso deixa de ser necessário — os dados viriam direto do
// registro do usuário no banco.
//
// Prestadores de serviço ficam de fora desta ponte propositalmente: não usam
// o campo `fullName` (usam `nomeOuRazaoSocial`), não têm foto de perfil, e
// não existe hoje um papel `Prestador` no sistema de permissões — logar como
// prestador ainda cai no fallback genérico abaixo.
// ---------------------------------------------------------------------------
const ROLE_BY_TIPO_CONTA: Record<string, User['role']> = {
  administrador: 'Admin',
  sindico: 'Síndico',
  morador: 'Morador',
};

interface ContaCadastrada {
  tipo: string;
  email: string;
  fullName?: string;
  unidade?: string;
  photoPreview?: string | null;
}

function buscarContaCadastrada(email: string): ContaCadastrada | undefined {
  try {
    const contasCadastradas = JSON.parse(localStorage.getItem('wave_users') || '[]');
    const emailNormalizado = email.toLowerCase().trim();
    return contasCadastradas.find(
      (c: any) => typeof c?.email === 'string' && c.email.toLowerCase() === emailNormalizado
    );
  } catch {
    // localStorage corrompido/indisponível — segue sem cadastro, não quebra o login
    return undefined;
  }
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
        role: 'Admin',
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
        role: emailLower.includes('admin')
          ? 'Admin'
          : emailLower.includes('sindico')
          ? 'Síndico'
          : 'Morador',
        unit: 'Apto 101',
      };
    }

    // Enriquece com os dados reais do cadastro, se existir uma conta criada
    // com este e-mail via "Criar Nova Conta" — nome, papel e unidade reais
    // têm prioridade sobre o cálculo genérico do fallback acima. Contas de
    // Prestador (sem papel de login definido) não entram nesta ponte.
    const contaCadastrada = buscarContaCadastrada(email);
    const roleCadastrada = contaCadastrada ? ROLE_BY_TIPO_CONTA[contaCadastrada.tipo] : undefined;

    if (contaCadastrada && roleCadastrada) {
      mockUser = {
        ...mockUser,
        name: contaCadastrada.fullName || mockUser.name,
        role: roleCadastrada,
        unit: contaCadastrada.unidade || mockUser.unit,
        photoUrl: contaCadastrada.photoPreview || undefined,
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