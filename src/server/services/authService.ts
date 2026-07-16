import { userRepository } from "@/server/repositories/userRepository";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import type { Role } from "@/lib/rbac";
import type { Role as PrismaRole } from "@prisma/client";

// Ponto UNICO de conversao entre o enum do banco e o rotulo do app.
// Mantido aqui para nao recriar o bug de grafia que o rbac.ts eliminou.
const DB_TO_LABEL: Record<PrismaRole, Role> = {
  ADMIN: "Admin",
  SINDICO: "Síndico",
  MORADOR: "Morador",
};
const LABEL_TO_DB: Record<Role, PrismaRole> = {
  Admin: "ADMIN",
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
  condominiumId: string;
}

type DbUser = {
  id: string; email: string; name: string; role: PrismaRole;
  unit: string | null; photoUrl: string | null; condominiumId: string;
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
    condominiumId: user.condominiumId,
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