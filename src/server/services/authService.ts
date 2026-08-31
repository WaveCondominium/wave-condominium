import { userRepository } from "@/server/repositories/userRepository";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSession, destroySession, getSession } from "@/server/auth/session";
import type { Role } from "@/lib/rbac";
import { papeisDisponiveis } from "@/lib/perfis";
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
  /** Perfil ATIVO da sessão (pode diferir do papel de cadastro em usuários duais). */
  role: Role;
  /** Perfis que o usuário pode assumir (SÍN-003). */
  availableRoles: Role[];
  unit: string | null;
  photoUrl: string | null;
  condominiumId: string | null;
  administradoraId: string | null;
  mustChangePassword: boolean;
}

// Tipo alinhado ao Prisma User — campos opcionais (mustChangePassword,
// secondaryRole) podem ainda nao existir no banco (migration pendente) ou ser
// undefined em registros antigos.
type DbUser = {
  id: string; email: string; name: string; role: PrismaRole;
  secondaryRole?: PrismaRole | null;
  unit: string | null; photoUrl: string | null;
  condominiumId: string | null; administradoraId: string | null;
  mustChangePassword?: boolean;
  acessoRevogado?: boolean;
};

/** Perfis disponíveis do usuário, em rótulos de app (primário + secundário). */
function availableRolesOf(u: DbUser): Role[] {
  const secundario = u.secondaryRole ? DB_TO_LABEL[u.secondaryRole] : null;
  return papeisDisponiveis(DB_TO_LABEL[u.role], secundario);
}

// `activeRole` é o perfil ATIVO da sessão; quando ausente, usa o papel de
// cadastro (comportamento anterior para usuários de perfil único).
function toPublic(u: DbUser, activeRole?: Role): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: activeRole ?? DB_TO_LABEL[u.role],
    availableRoles: availableRolesOf(u),
    unit: u.unit,
    photoUrl: u.photoUrl,
    condominiumId: u.condominiumId,
    administradoraId: u.administradoraId,
    mustChangePassword: u.mustChangePassword ?? false,
  };
}

export type LoginResult =
  | { ok: true; user: PublicUser; needsProfileChoice: boolean }
  | { ok: false; error: string };

export async function login(email: string, password: string): Promise<LoginResult> {
  const user = await userRepository.findByEmail(email);
  // verifyPassword roda mesmo sem user (dummy hash) para nao vazar por timing.
  const valid = await verifyPassword(user?.passwordHash, password);
  if (!user || !valid) return { ok: false, error: "E-mail ou senha invalidos." };

  // SÍN-022: acesso revogado pelo síndico bloqueia o login (verificado só após
  // credenciais válidas, para não revelar existência de conta a terceiros).
  if (user.acessoRevogado) {
    return { ok: false, error: "Seu acesso foi revogado. Fale com o síndico do condomínio." };
  }

  // Perfil ativo inicial = primário. Se houver mais de um perfil, a UI oferece
  // a escolha (needsProfileChoice) e chama setActiveProfile depois.
  const disponiveis = availableRolesOf(user);
  const ativo = disponiveis[0];

  await createSession({
    userId: user.id,
    role: ativo,
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: user.mustChangePassword ?? false,
  });
  return { ok: true, user: toPublic(user, ativo), needsProfileChoice: disponiveis.length > 1 };
}

// ---------------------------------------------------------------------------
// Perfil ativo (SÍN-003) — trocar o perfil da sessão (login dual / switch)
// ---------------------------------------------------------------------------

export type SetActiveProfileResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string };

/**
 * Define o perfil ativo da sessão. Valida no servidor que o perfil pedido está
 * entre os disponíveis do usuário (nunca confia no cliente) e re-emite a sessão.
 */
export async function setActiveProfile(role: Role): Promise<SetActiveProfileResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Sessão expirada. Faça login novamente." };

  const user = await userRepository.findById(session.userId);
  if (!user) return { ok: false, error: "Usuário não encontrado." };

  // Regra crítica validada no SERVIDOR: o perfil pedido precisa estar entre os
  // disponíveis do usuário (primário + secundário). Nunca confia no cliente.
  if (!availableRolesOf(user).includes(role)) {
    return { ok: false, error: "Perfil não permitido para este usuário." };
  }

  await createSession({
    userId: user.id,
    role,
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: user.mustChangePassword ?? false,
  });
  return { ok: true, user: toPublic(user, role) };
}

export async function logout(): Promise<void> {
  await destroySession();
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await userRepository.findById(session.userId);
  if (!user) return null;
  // SÍN-022: acesso revogado invalida a sessão em curso (próxima requisição).
  if (user.acessoRevogado) return null;
  // `role` reflete o PERFIL ATIVO da sessão (SÍN-003), não o papel de cadastro.
  return toPublic(user, session.role);
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
// Ativação de acesso do Morador (SÍN-022)
// ---------------------------------------------------------------------------
//
// Chamado pela ação pública de ativação, DEPOIS de o convite ter sido validado
// (token válido, não expirado, não revogado, uso único). A senha vem do próprio
// morador — o Síndico nunca a define nem a vê. Cria a conta (ou reativa uma já
// existente do mesmo e-mail no condomínio) e abre a sessão (auto-login).

export interface AtivarMoradorInput {
  email: string;
  password: string; // definida pelo morador na ativação
  name: string;
  unit?: string | null;
  condominiumId: string;
}

export type AtivarMoradorResult =
  | { ok: true; user: PublicUser }
  | { ok: false; error: string };

export async function ativarAcessoMorador(input: AtivarMoradorInput): Promise<AtivarMoradorResult> {
  const passwordHash = await hashPassword(input.password);
  const existente = await userRepository.findByEmailInCondominium(input.email, input.condominiumId);

  let user: DbUser;
  if (existente) {
    // Só é permitido "assumir" uma conta existente se ela for de Morador — evita
    // que um convite de morador redefina a senha de um gestor com o mesmo e-mail.
    if (existente.role !== "MORADOR") {
      return {
        ok: false,
        error: "Já existe uma conta com este e-mail. Fale com o síndico do condomínio.",
      };
    }
    user = await userRepository.reativarMoradorComSenha(existente.id, {
      passwordHash,
      name: input.name,
      unit: input.unit ?? null,
    });
  } else {
    user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: "MORADOR",
      unit: input.unit ?? null,
      condominiumId: input.condominiumId,
      mustChangePassword: false,
    });
  }

  await createSession({
    userId: user.id,
    role: "Morador",
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: false,
  });

  return { ok: true, user: toPublic(user, "Morador") };
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

  // Recria a sessão sem mustChangePassword para liberar acesso normal.
  // Preserva o PERFIL ATIVO da sessão (SÍN-003) em vez do papel de cadastro.
  await createSession({
    userId: user.id,
    role: session.role,
    condominiumId: user.condominiumId ?? null,
    administradoraId: user.administradoraId ?? null,
    mustChangePassword: false,
  });

  return { ok: true };
}