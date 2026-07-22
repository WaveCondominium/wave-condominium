"use server";

// ---------------------------------------------------------------------------
// src/app/actions/governanca.ts
//
// Server Actions da Governanca (DAO) sobre PostgreSQL.
//
// Regras aplicadas NO SERVIDOR (nao dependem do cliente):
//   - Voto unico por morador (constraint @@unique([propostaId, userId]));
//   - Apuracao automatica por prazo (ao listar, encerra as expiradas);
//   - Resultado por maioria de TODOS os moradores (> 50%), usando a contagem
//     real de usuarios MORADOR do condominio.
//
// Requer `prisma generate` apos o schema (models Proposta/Voto e enums).
// ---------------------------------------------------------------------------

import type {
  CategoriaProposta as PrismaCategoria,
  StatusProposta as PrismaStatus,
  VotoEscolha as PrismaEscolha,
} from "@prisma/client";
import { requireSession, requireManager } from "@/server/auth/guard";
import { propostaRepository } from "@/server/repositories/propostaRepository";
import {
  type Categoria,
  type Proposta,
  type StatusProposta,
  type VoteChoice,
  DIAS_VOTACAO,
} from "@/components/dao/governanceCore";

// --- mapeamentos app <-> banco ----------------------------------------------

const CAT_TO_DB: Record<Categoria, PrismaCategoria> = {
  obras: "OBRAS", seguranca: "SEGURANCA", financeiro: "FINANCEIRO", eventos: "EVENTOS",
  melhorias: "MELHORIAS", sustentabilidade: "SUSTENTABILIDADE", outros: "OUTROS",
};
const CAT_FROM_DB: Record<PrismaCategoria, Categoria> = {
  OBRAS: "obras", SEGURANCA: "seguranca", FINANCEIRO: "financeiro", EVENTOS: "eventos",
  MELHORIAS: "melhorias", SUSTENTABILIDADE: "sustentabilidade", OUTROS: "outros",
};
const STATUS_FROM_DB: Record<PrismaStatus, StatusProposta> = {
  VOTACAO_ABERTA: "votacao_aberta", VOTACAO_ENCERRADA: "votacao_encerrada",
  APROVADA_COMUNIDADE: "aprovada_comunidade", FILA_PRIORIDADES: "fila_prioridades",
  EM_ASSEMBLEIA: "em_assembleia", APROVADA_ASSEMBLEIA: "aprovada_assembleia",
  EM_EXECUCAO: "em_execucao", CONCLUIDA: "concluida", REJEITADA: "rejeitada",
};
const ESCOLHA_TO_DB: Record<VoteChoice, PrismaEscolha> = {
  aprovo: "APROVO", reprovo: "REPROVO", abstencao: "ABSTENCAO",
};
const ESCOLHA_FROM_DB: Record<PrismaEscolha, VoteChoice> = {
  APROVO: "aprovo", REPROVO: "reprovo", ABSTENCAO: "abstencao",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function toApp(row: any): Proposta {
  const votos: Record<string, VoteChoice> = {};
  for (const v of row.votos ?? []) votos[v.userId] = ESCOLHA_FROM_DB[v.escolha as PrismaEscolha];
  return {
    id: row.id,
    titulo: row.titulo,
    descricao: row.descricao,
    categoria: CAT_FROM_DB[row.categoria as PrismaCategoria],
    autor: row.autorNome,
    criadaEm: new Date(row.criadaEm).toISOString(),
    prazoVotacao: new Date(row.prazoVotacao).toISOString(),
    status: STATUS_FROM_DB[row.status as PrismaStatus],
    votos,
    encerradaEm: row.encerradaEm ? new Date(row.encerradaEm).toISOString() : undefined,
    aprovadaEm: row.aprovadaEm ? new Date(row.aprovadaEm).toISOString() : undefined,
    comentarios: [],
  };
}

/** Encerra uma proposta e grava o resultado (maioria de todos os moradores). */
async function encerrar(propostaId: string, condominiumId: string): Promise<PrismaStatus> {
  const [aprovo, totalMoradores] = await Promise.all([
    propostaRepository.countAprovo(propostaId),
    propostaRepository.countMoradores(condominiumId),
  ]);
  const aprovada = aprovo > totalMoradores / 2;
  const agora = new Date();
  const status: PrismaStatus = aprovada ? "APROVADA_COMUNIDADE" : "REJEITADA";
  await propostaRepository.update(propostaId, condominiumId, {
    status,
    encerradaEm: agora,
    aprovadaEm: aprovada ? agora : null,
  });
  return status;
}

export interface ListaGovernanca {
  propostas: Proposta[];
  totalMoradores: number;
}

/** Lista as propostas do condominio, encerrando automaticamente as expiradas. */
export async function listPropostasAction(): Promise<ListaGovernanca> {
  const session = await requireSession();
  if (!session.condominiumId) return { propostas: [], totalMoradores: 0 };
  const cid = session.condominiumId;

  const rows = await propostaRepository.listByCondominium(cid);
  const agora = Date.now();

  // Apuracao automatica por prazo (SOW: encerramento automatico aos 30 dias).
  const expiradas = rows.filter(
    (p) => p.status === "VOTACAO_ABERTA" && new Date(p.prazoVotacao).getTime() <= agora,
  );
  for (const p of expiradas) await encerrar(p.id, cid);

  const totalMoradores = await propostaRepository.countMoradores(cid);
  const atualizadas = expiradas.length ? await propostaRepository.listByCondominium(cid) : rows;
  return { propostas: atualizadas.map(toApp), totalMoradores };
}

/** Cria/publica uma proposta — qualquer morador pode (vai direto para votacao). */
export async function criarPropostaAction(
  input: { titulo: string; descricao: string; categoria: Categoria },
  autor: string,
): Promise<Proposta | null> {
  const session = await requireSession();
  if (!session.condominiumId) return null;
  const criadaEm = new Date();
  const prazo = new Date(criadaEm);
  prazo.setDate(prazo.getDate() + DIAS_VOTACAO);
  const row = await propostaRepository.create({
    condominiumId: session.condominiumId,
    titulo: input.titulo.trim(),
    descricao: input.descricao.trim(),
    categoria: CAT_TO_DB[input.categoria],
    autorNome: autor,
    status: "VOTACAO_ABERTA",
    criadaEm,
    prazoVotacao: prazo,
  });
  return toApp(row);
}

/** Registra o voto do usuario logado (voto unico, uma vez). */
export async function votarAction(
  propostaId: string,
  escolha: VoteChoice,
): Promise<"ok" | "ja_votou" | "encerrada"> {
  const session = await requireSession();
  if (!session.condominiumId) return "encerrada";
  const p = await propostaRepository.findById(propostaId, session.condominiumId);
  if (!p) return "encerrada";
  if (p.status !== "VOTACAO_ABERTA" || new Date(p.prazoVotacao).getTime() <= Date.now()) {
    return "encerrada";
  }
  try {
    await propostaRepository.createVoto(propostaId, session.userId, ESCOLHA_TO_DB[escolha]);
    return "ok";
  } catch {
    // Violacao do unique => ja votou.
    return "ja_votou";
  }
}

/** Encerra a votacao manualmente (gestor) e apura o resultado. */
export async function encerrarVotacaoAction(propostaId: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  const p = await propostaRepository.findById(propostaId, session.condominiumId);
  if (!p || p.status !== "VOTACAO_ABERTA") return { ok: false };
  await encerrar(propostaId, session.condominiumId);
  return { ok: true };
}

/** Remove uma proposta (gestor). */
export async function removerPropostaAction(propostaId: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await propostaRepository.remove(propostaId, session.condominiumId);
  return { ok: true };
}
