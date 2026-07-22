import { getSession, type SessionPayload } from "./session";
import { isManager, isPlatformAdmin, isAdministradora } from "@/lib/rbac";

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

/** Exige papel de Administradora (ou Admin de plataforma). */
export async function requireAdministradora(): Promise<SessionPayload> {
  const session = await requireSession();
  if (!isAdministradora(session.role) && !isPlatformAdmin(session.role)) {
    throw new AuthError("SEM_PERMISSAO");
  }
  return session;
}

/**
 * Garante que a sessao pode atuar no condominio informado (isolamento
 * multi-tenant). Permitido quando: e o condominio ativo da sessao; OU e uma
 * Administradora que gere o condominio; OU Admin de plataforma.
 *
 * NOTA: a checagem de "administradora gere este condominio" deve consultar o
 * banco (condominium.administradoraId === session.administradoraId). Aqui
 * validamos a base; o repositorio confirma o vinculo ao carregar o condominio.
 */
export async function requireCondominioScope(condominiumId: string): Promise<SessionPayload> {
  const session = await requireSession();
  if (isPlatformAdmin(session.role)) return session;
  if (isAdministradora(session.role)) return session;
  if (session.condominiumId && session.condominiumId === condominiumId) return session;
  throw new AuthError("SEM_PERMISSAO");
}