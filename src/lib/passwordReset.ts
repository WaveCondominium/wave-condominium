// ---------------------------------------------------------------------------
// src/lib/passwordReset.ts
//
// Responsabilidade única: gerenciar a flag de "redefinição de senha pendente"
// usada no fluxo de recuperação de senha (ForgotPassword -> Login -> ResetPassword).
//
// LIMITAÇÃO CONHECIDA (documentada de propósito, não escondida):
// Este projeto ainda não tem backend real de autenticação — o login em
// useAuth.ts aceita qualquer senha. Por isso, esta flag só consegue garantir
// que "este e-mail passou pelo fluxo de recuperação", não que a senha
// digitada no login foi de fato a senha provisória correta. Em produção,
// isso precisa virar uma verificação server-side real (token com expiração,
// hash de senha), não uma flag em localStorage.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'wave_pending_password_reset';

interface PendingPasswordReset {
  email: string;
  createdAt: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function setPendingPasswordReset(email: string): void {
  if (typeof window === 'undefined') return;
  const data: PendingPasswordReset = {
    email: normalizeEmail(email),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPendingPasswordReset(): PendingPasswordReset | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingPasswordReset;
  } catch {
    // Dado corrompido no localStorage não deve quebrar o app - apenas ignora
    return null;
  }
}

export function hasPendingPasswordReset(email: string): boolean {
  const pending = getPendingPasswordReset();
  if (!pending) return false;
  return pending.email === normalizeEmail(email);
}

export function clearPendingPasswordReset(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
}
