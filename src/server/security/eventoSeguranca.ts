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
// condomínios; Síndico vê só os eventos do PRÓPRIO condomínio ativo.
// Qualquer outro papel (Morador, Conselho) é negado. Administradora
// (gestora de múltiplos condomínios) fica NEGADA por ora — o escopo dela
// não foi decidido ainda (ver docs/SEG-016-EVENTOS-SEGURANCA.md,
// "pendências"); tratar como acesso aberto sem decisão explícita seria
// assumir um requisito de segurança não confirmado.
// ---------------------------------------------------------------------------

export type EscopoConsultaEventos =
  | { tipo: "TODOS" }
  | { tipo: "CONDOMINIO"; condominiumId: string }
  | { tipo: "NEGADO" };

export interface SessaoParaEscopo {
  role: string;
  condominiumId: string | null;
}

export function resolverEscopoConsulta(
  sessao: SessaoParaEscopo
): EscopoConsultaEventos {
  if (sessao.role === "Admin") return { tipo: "TODOS" };
  if (sessao.role === "Síndico") {
    if (!sessao.condominiumId) return { tipo: "NEGADO" };
    return { tipo: "CONDOMINIO", condominiumId: sessao.condominiumId };
  }
  return { tipo: "NEGADO" };
}
