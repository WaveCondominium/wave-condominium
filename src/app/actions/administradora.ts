"use server";

// ---------------------------------------------------------------------------
// src/app/actions/administradora.ts
//
// Server Actions do canal Administradora (multi-condominio).
//
// Ideia central do "condominio ativo": ao selecionar um condominio, REEMITIMOS
// a sessao com aquele `condominiumId`. Assim TODAS as actions de dominio ja
// existentes (Boletos, Governanca, Comunicacao, etc.) passam a operar scopadas
// naquele condominio sem qualquer alteracao — o isolamento multi-tenant continua
// garantido no servidor.
//
// Guardas: apenas Administradora (ou Admin de plataforma). A selecao verifica no
// banco que o condominio pertence a administradora da sessao.
// ---------------------------------------------------------------------------

import { requireSession, requireAdministradora } from "@/server/auth/guard";
import { createSession } from "@/server/auth/session";
import { isAdministradora } from "@/lib/rbac";
import { condominiumRepository } from "@/server/repositories/condominiumRepository";

export interface CondominioCard {
  id: string;
  name: string;
  totalMoradores: number;
  boletosEmAberto: number;
  propostasAtivas: number;
}

export interface PainelAdministradora {
  condominios: CondominioCard[];
  totais: {
    condominios: number;
    moradores: number;
    boletosEmAberto: number;
    propostasAtivas: number;
  };
}

const TOTAIS_ZERO = { condominios: 0, moradores: 0, boletosEmAberto: 0, propostasAtivas: 0 };

/** Lista os condominios da administradora logada, com metricas para o painel. */
export async function listCondominiosAction(): Promise<PainelAdministradora> {
  const session = await requireAdministradora();
  const admId = session.administradoraId;
  if (!admId) return { condominios: [], totais: { ...TOTAIS_ZERO } };

  const condos = await condominiumRepository.listByAdministradora(admId);
  const cards: CondominioCard[] = await Promise.all(
    condos.map(async (c) => {
      const m = await condominiumRepository.metrics(c.id);
      return { id: c.id, name: c.name, ...m };
    }),
  );

  const totais = cards.reduce(
    (acc, c) => ({
      condominios: acc.condominios + 1,
      moradores: acc.moradores + c.totalMoradores,
      boletosEmAberto: acc.boletosEmAberto + c.boletosEmAberto,
      propostasAtivas: acc.propostasAtivas + c.propostasAtivas,
    }),
    { ...TOTAIS_ZERO },
  );

  return { condominios: cards, totais };
}

/**
 * Seleciona o condominio ativo (reemite a sessao). So permite se o condominio
 * pertence a administradora — barreira de isolamento multi-tenant.
 */
export async function selecionarCondominioAction(
  condominiumId: string,
): Promise<{ ok: boolean }> {
  const session = await requireAdministradora();
  const admId = session.administradoraId;
  if (!admId) return { ok: false };

  const owns = await condominiumRepository.belongsToAdministradora(condominiumId, admId);
  if (!owns) return { ok: false };

  await createSession({
    userId: session.userId,
    role: session.role,
    condominiumId,
    administradoraId: admId,
  });
  return { ok: true };
}

/** Sai do condominio ativo e volta ao painel (condominiumId = null). */
export async function sairDoCondominioAction(): Promise<{ ok: boolean }> {
  const session = await requireAdministradora();
  await createSession({
    userId: session.userId,
    role: session.role,
    condominiumId: null,
    administradoraId: session.administradoraId ?? null,
  });
  return { ok: true };
}

export interface ContextoAdministradora {
  isAdministradora: boolean;
  activeCondominiumId: string | null;
  activeCondominiumName: string | null;
}

/**
 * Contexto para o layout/sidebar: se a sessao e de administradora e qual o
 * condominio ativo (para exibir o banner "Gerenciando X" e decidir o redirect
 * ao painel). Nao lanca erro para outros perfis — apenas responde isAdministradora:false.
 */
export async function contextoAdministradoraAction(): Promise<ContextoAdministradora> {
  const session = await requireSession();
  if (!isAdministradora(session.role)) {
    return { isAdministradora: false, activeCondominiumId: null, activeCondominiumName: null };
  }
  const activeId = session.condominiumId;
  let name: string | null = null;
  if (activeId) {
    const c = await condominiumRepository.findById(activeId);
    name = c?.name ?? null;
  }
  return {
    isAdministradora: true,
    activeCondominiumId: activeId,
    activeCondominiumName: name,
  };
}
