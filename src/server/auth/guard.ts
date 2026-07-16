import { getSession, type SessionPayload } from "./session";
import { isManager, isPlatformAdmin } from "@/lib/rbac";

export class AuthError extends Error {
  constructor(public code: "NAO_AUTENTICADO" | "SEM_PERMISSAO") {
    super(code);
    this.name = "AuthError";
  }
}

/** Exige apenas estar autenticado. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new AuthError("NAO_AUTENTICADO");
  return session;
}

/** Exige papel de gestao (Sindico ou Admin). */
export async function requireManager(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!isManager(session.role)) throw new AuthError("SEM_PERMISSAO");
  return session;
}

/** Exige Admin de plataforma. */
export async function requirePlatformAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!isPlatformAdmin(session.role)) throw new AuthError("SEM_PERMISSAO");
  return session;
}