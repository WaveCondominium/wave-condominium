import { userRepository } from "@/server/repositories/userRepository";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import type { Role } from "@/lib/rbac";
import type { Role as PrismaRole } from "@prisma/client";

// Ponto UNICO de conversao entre o enum do banco e o rotulo do app.
// Mantido aqui para nao recriar o bug de grafia que o rbac.ts eliminou.
const DB_TO_LABEL: Record<PrismaRole, Role> = {
  ADMIN: "Admin",
  ADMINISTRADORA: "Administradora",
  SINDICO: "Síndico",
  MORADOR: "Morador",
};
const LABEL_TO_DB: Record<Role, PrismaRole> = {
  Admin: "ADMIN",
  Administradora: "ADMINISTRADORA",
  "Síndico": "SINDICO",
  Morador: "MORADOR",
};

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  unit: string | null;
  photoUrl: string | null;
  condominiumId: string | null;
  administradoraId: string | null;
  mustChangePassword: boolean;
}

// Tipo alinhado ao Prisma User — mustChangePassword pode ainda nao existir
// no banco (migration pendente) ou ser undefined em registros antigos.
type DbUser = {
  id: string; email: string; name: string; role: PrismaRole;
  unit: string | null; photoUrl: string | null;
  condominiumId: string | null; administradoraId: string | null;
  mustChangePassword?: boolean;
};

function toPublic(u: DbUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: DB_TO_LABEL[u.role],
    unit: u.unit,
    photoUrl: u.photoUrl,
    condominiumId: u.condominiumId,
    administradoraId: u.administradoraId,
    mustChangePassword: u.mustChangePassword ?? false,
  };
}

export type LoginResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await userRepository.findByEmail(email);
  // verifyPassword roda mesmo sem user (dummy hash) para nao vazar por timing.
  const valid = await verifyPassword(user?.passwordHash, password);
  if (!user || !valid) return { ok: false, error: "E-mail ou senha invalidos." };

  await createSession({
    userId: user.id,
    role: DB_TO_LABEL[user.role],
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: user.mustChangePassword ?? false,
  });
  return { ok: true, user: toPublic(user) };
}

export async function logout(): Promise<void> {
  await destroySession();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await userRepository.findById(session.userId);
  return user ? toPublic(user) : null;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role: Role;
  unit?: string | null;
  condominiumId: string;
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.password);
  const created = await userRepository.create({
    email: input.email,
    passwordHash,
    name: input.name,
    role: LABEL_TO_DB[input.role],
    unit: input.unit ?? null,
    condominiumId: input.condominiumId,
  });
  return toPublic(created);
}

// ---------------------------------------------------------------------------
// Primeiro acesso — registro de Morador com senha provisória
// ---------------------------------------------------------------------------

export interface RegisterMoradorInput {
  email: string;
  provisionalPassword: string;
  name: string;
  unit?: string | null;
  condominiumId: string;
}

/**
 * Registra um Morador com senha provisória. O campo `mustChangePassword`
 * é setado como true, forçando a troca no primeiro login.
 */
export async function registerMorador(input: RegisterMoradorInput): Promise<PublicUser> {
  const passwordHash = await hashPassword(input.provisionalPassword);
  const created = await userRepository.create({
    email: input.email,
    passwordHash,
    name: input.name,
    role: "MORADOR",
    unit: input.unit ?? null,
    condominiumId: input.condominiumId,
    mustChangePassword: true,
  });
  return toPublic(created);
}

// ---------------------------------------------------------------------------
// Alteração obrigatória de senha (primeiro acesso)
// ---------------------------------------------------------------------------

export type ChangePasswordResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Troca a senha do usuário autenticado, invalida a provisória,
 * limpa mustChangePassword e recria a sessão sem a flag.
 */
export async function changePassword(newPassword: string): Promise<ChangePasswordResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada. Faça login novamente." };

  const user = await userRepository.findById(session.userId);
  if (!user) return { ok: false, error: "Usuário não encontrado." };

  // Impede reutilização da senha provisória (ou senha atual)
  const isSamePassword = await verifyPassword(user.passwordHash, newPassword);
  if (isSamePassword) {
    return { ok: false, error: "A nova senha não pode ser igual à senha atual." };
  }

  const newHash = await hashPassword(newPassword);
  await userRepository.updatePassword(user.id, newHash);

  // Recria a sessão sem mustChangePassword para liberar acesso normal
  await createSession({
    userId: user.id,
    role: DB_TO_LABEL[user.role],
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: false,
  });

  return { ok: true };
}