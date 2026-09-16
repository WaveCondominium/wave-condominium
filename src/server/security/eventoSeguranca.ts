// ---------------------------------------------------------------------------
// SEG-016 (Eventos de Segurança) — Fase 1: estrutura + eventos de auth.
//
// Módulo PURO (sem Prisma) — a lógica testável não deve puxar a cadeia de
// servidor no ambiente de testes, mesmo padrão de
// src/components/boletos/boletoStatus.ts (SÍN-011).
// ---------------------------------------------------------------------------

export type TipoEventoSeguranca =
  | "LOGIN_SUCESSO"
  | "LOGIN_FALHA"
  | "LOGOUT"
  | "ACESSO_NEGADO"
  | "SENHA_ALTERADA"
  | "ACESSO_REVOGADO"
  | "ACESSO_RESTAURADO";

export type ResultadoEvento = "SUCESSO" | "FALHA";

export const TIPO_EVENTO_LABEL: Record<TipoEventoSeguranca, string> = {
  LOGIN_SUCESSO: "Login realizado",
  LOGIN_FALHA: "Falha de login",
  LOGOUT: "Logout",
  ACESSO_NEGADO: "Tentativa de acesso negada",
  SENHA_ALTERADA: "Senha alterada",
  ACESSO_REVOGADO: "Acesso revogado",
  ACESSO_RESTAURADO: "Acesso restaurado",
};

// Eventos cujo resultado é sempre o mesmo (não faz sentido, por exemplo, um
// "logout" com resultado FALHA) — usado para validar a entrada antes de
// gravar, evitando dado inconsistente na trilha de segurança.
const RESULTADO_FIXO: Partial<Record<TipoEventoSeguranca, ResultadoEvento>> = {
  LOGIN_SUCESSO: "SUCESSO",
  LOGIN_FALHA: "FALHA",
  LOGOUT: "SUCESSO",
  SENHA_ALTERADA: "SUCESSO",
  ACESSO_REVOGADO: "SUCESSO",
  ACESSO_RESTAURADO: "SUCESSO",
  ACESSO_NEGADO: "FALHA",
};

export function validarResultado(
  tipo: TipoEventoSeguranca,
  resultado: ResultadoEvento
): boolean {
  const fixo = RESULTADO_FIXO[tipo];
  return fixo === undefined || fixo === resultado;
}

// ---------------------------------------------------------------------------
// Escopo de consulta — quem pode ver o quê.
//
// Decisão confirmada com o Robson: Admin de plataforma vê TODOS os
// condomínios; Síndico vê só os eventos do PRÓPRIO condomínio ativo;
// Administradora vê os eventos de TODOS OS CONDOMÍNIOS QUE ELA GERE (não a
// plataforma inteira) — resolvido via `Condominium.administradoraId`, a
// mesma modelagem já usada no painel dela (SÍN-031). Qualquer outro papel
// (Morador, Conselho) é negado.
//
// A resolução de QUAIS condomínios uma Administradora gere depende do banco
// (não é pura) — por isso o tipo "ADMINISTRADORA" carrega só o
// `administradoraId`; é o repository (eventoSegurancaRepository) quem busca
// a lista de condomínios e monta o filtro final.
// ---------------------------------------------------------------------------

export type EscopoConsultaEventos =
  | { tipo: "TODOS" }
  | { tipo: "CONDOMINIO"; condominiumId: string }
  | { tipo: "ADMINISTRADORA"; administradoraId: string }
  | { tipo: "NEGADO" };

export interface SessaoParaEscopo {
  role: string;
  condominiumId: string | null;
  administradoraId?: string | null;
}

export function resolverEscopoConsulta(
  sessao: SessaoParaEscopo
): EscopoConsultaEventos {
  if (sessao.role === "Admin") return { tipo: "TODOS" };
  if (sessao.role === "Síndico") {
    if (!sessao.condominiumId) return { tipo: "NEGADO" };
    return { tipo: "CONDOMINIO", condominiumId: sessao.condominiumId };
  }
  if (sessao.role === "Administradora") {
    if (!sessao.administradoraId) return { tipo: "NEGADO" };
    return { tipo: "ADMINISTRADORA", administradoraId: sessao.administradoraId };
  }
  return { tipo: "NEGADO" };
}
