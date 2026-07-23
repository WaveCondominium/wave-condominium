"use server";

// ---------------------------------------------------------------------------
// src/app/actions/avisos.ts
//
// TEMPLATE de Server Actions para a migracao localStorage -> PostgreSQL.
//
// Padrao a replicar por modulo:
//   1. Guard (requireSession / requireManager / requireCondominioScope);
//   2. Escopo por condominiumId (isolamento multi-tenant);
//   3. Mapear tipos do app (minusculos) <-> enums do Prisma (maiusculos);
//   4. Retornar objetos no MESMO formato que o hook ja usa, para que a troca
//      do corpo do hook (localStorage -> action) seja minima.
//
// Requer `prisma generate` apos o schema (models Aviso/ComentarioAviso).
// ---------------------------------------------------------------------------

import type {
  CategoriaAviso as PrismaCategoria,
  Prioridade as PrismaPrioridade,
} from "@prisma/client";
import { requireSession, requireManager } from "@/server/auth/guard";
import { avisoRepository } from "@/server/repositories/avisoRepository";
import type { Aviso, CategoriaAviso, Prioridade } from "@/components/communication/types";

// --- mapeamentos app <-> banco ----------------------------------------------

const PRIORIDADE_TO_DB: Record<Prioridade, PrismaPrioridade> = {
  urgente: "URGENTE",
  alta: "ALTA",
  normal: "NORMAL",
};
const PRIORIDADE_FROM_DB: Record<PrismaPrioridade, Prioridade> = {
  URGENTE: "urgente",
  ALTA: "alta",
  NORMAL: "normal",
};
const CATEGORIA_TO_DB: Record<CategoriaAviso, PrismaCategoria> = {
  elevador: "ELEVADOR",
  agua: "AGUA",
  energia: "ENERGIA",
  obras: "OBRAS",
  caixa_dagua: "CAIXA_DAGUA",
  dedetizacao: "DEDETIZACAO",
  seguranca: "SEGURANCA",
  evento: "EVENTO",
  comunicado: "COMUNICADO",
};
const CATEGORIA_FROM_DB: Record<PrismaCategoria, CategoriaAviso> = {
  ELEVADOR: "elevador",
  AGUA: "agua",
  ENERGIA: "energia",
  OBRAS: "obras",
  CAIXA_DAGUA: "caixa_dagua",
  DEDETIZACAO: "dedetizacao",
  SEGURANCA: "seguranca",
  EVENTO: "evento",
  COMUNICADO: "comunicado",
};

function toApp(row: any): Aviso {
  return {
    id: row.id,
    titulo: row.titulo,
    conteudo: row.conteudo,
    categoria: CATEGORIA_FROM_DB[row.categoria as PrismaCategoria],
    prioridade: PRIORIDADE_FROM_DB[row.prioridade as PrismaPrioridade],
    autor: row.autorNome,
    dataPublicacao: new Date(row.publicadoEm).toISOString(),
    comentariosAtivos: row.comentariosAtivos,
    enviarEmail: row.enviarEmail ?? undefined,
    dataEvento: row.dataEvento ?? undefined,
    horarioEvento: row.horarioEvento ?? undefined,
    localEvento: row.localEvento ?? undefined,
    comentarios: (row.comentarios ?? []).map((c: any) => ({
      id: c.id,
      autor: c.autor,
      conteudo: c.conteudo,
      data: new Date(c.criadoEm).toISOString(),
    })),
  };
}

export type NovoAvisoInput = Omit<Aviso, "id" | "dataPublicacao" | "autor" | "comentarios">;

/** Lista os avisos do condominio da sessao (urgentes no topo). */
export async function listAvisosAction(): Promise<Aviso[]> {
  const session = await requireSession();
  if (!session.condominiumId) return [];
  const rows = await avisoRepository.listByCondominium(session.condominiumId);
  return rows.map(toApp);
}

/** Cria um aviso (apenas gestao). */
export async function criarAvisoAction(input: NovoAvisoInput, autor: string): Promise<Aviso | null> {
  const session = await requireManager();
  if (!session.condominiumId) return null;
  const row = await avisoRepository.create({
    condominiumId: session.condominiumId,
    titulo: input.titulo,
    conteudo: input.conteudo,
    categoria: CATEGORIA_TO_DB[input.categoria],
    prioridade: PRIORIDADE_TO_DB[input.prioridade],
    autorNome: autor,
    comentariosAtivos: input.comentariosAtivos,
    enviarEmail: input.enviarEmail ?? false,
    dataEvento: input.dataEvento ?? null,
    horarioEvento: input.horarioEvento ?? null,
    localEvento: input.localEvento ?? null,
  });
  return toApp(row);
}

/** Edita um aviso (apenas gestao), garantindo o escopo do condominio. */
export async function editarAvisoAction(
  id: string,
  patch: Partial<NovoAvisoInput>,
): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await avisoRepository.update(id, session.condominiumId, {
    ...(patch.titulo !== undefined ? { titulo: patch.titulo } : {}),
    ...(patch.conteudo !== undefined ? { conteudo: patch.conteudo } : {}),
    ...(patch.categoria !== undefined ? { categoria: CATEGORIA_TO_DB[patch.categoria] } : {}),
    ...(patch.prioridade !== undefined ? { prioridade: PRIORIDADE_TO_DB[patch.prioridade] } : {}),
    ...(patch.comentariosAtivos !== undefined ? { comentariosAtivos: patch.comentariosAtivos } : {}),
    ...(patch.dataEvento !== undefined ? { dataEvento: patch.dataEvento ?? null } : {}),
    ...(patch.horarioEvento !== undefined ? { horarioEvento: patch.horarioEvento ?? null } : {}),
    ...(patch.localEvento !== undefined ? { localEvento: patch.localEvento ?? null } : {}),
  });
  return { ok: true };
}

/** Exclui um aviso (apenas gestao). */
export async function excluirAvisoAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await avisoRepository.remove(id, session.condominiumId);
  return { ok: true };
}

/** Adiciona comentario (qualquer usuario autenticado do condominio). */
export async function adicionarComentarioAction(
  avisoId: string,
  autor: string,
  conteudo: string,
): Promise<{ ok: boolean }> {
  const session = await requireSession();
  if (!session.condominiumId) return { ok: false };
  const c = await avisoRepository.addComentario(avisoId, session.condominiumId, autor, conteudo.trim());
  return { ok: Boolean(c) };
}
