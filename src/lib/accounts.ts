// ---------------------------------------------------------------------------
// src/lib/accounts.ts
//
// Responsabilidade única: persistência das contas criadas (mock via
// localStorage, mesmo padrão do resto do projeto) e validação de
// credenciais — compartilhado pelos 4 formulários de "Criar Nova Conta"
// (Administrador, Síndico, Morador, Prestador), evitando duplicar essa
// lógica 4 vezes.
//
// NOTA (dívida técnica documentada): sem backend real ainda, então isto é
// mock local. Quando o Postgres estiver conectado, `salvarConta` vira uma
// chamada de API, com hash de senha feito no servidor.
// ---------------------------------------------------------------------------

export type AccountType = 'administrador' | 'sindico' | 'morador' | 'prestador';

const STORAGE_KEY = 'wave_users';
export const MIN_PASSWORD_LENGTH = 8;

export function validateCredentials(password: string, confirmPassword: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (password !== confirmPassword) {
    return 'As senhas não coincidem.';
  }
  return null;
}

export function salvarConta(tipo: AccountType, dados: Record<string, unknown>): void {
  const existentes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const novaConta = {
    id: Date.now().toString(),
    tipo,
    createdAt: new Date().toISOString(),
    ...dados,
  };
  existentes.push(novaConta);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existentes));
}
