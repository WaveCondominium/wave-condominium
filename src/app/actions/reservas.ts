"use server";

// ---------------------------------------------------------------------------
// src/app/actions/reservas.ts
//
// Server Actions de Reservas de espacos comuns sobre PostgreSQL.
//
// Regras no servidor: escopo por condominio; aprovar/rejeitar/bloquear exigem
// gestao; cancelar permite o proprio solicitante ou gestor; conflito de
// espaco+data barrado na solicitacao.
//
// Requer `prisma generate` apos o schema (models Reserva/Bloqueio).
// ---------------------------------------------------------------------------

import type { EspacoComum as PrismaEspaco, StatusReserva as PrismaStatus } from "@prisma/client";
import { requireSession, requireManager } from "@/server/auth/guard";
import { isManager } from "@/lib/rbac";
import { reservaRepository } from "@/server/repositories/reservaRepository";
import type {
  Bloqueio,
  EspacoId,
  Reserva,
  SolicitarReservaInput,
  StatusReserva,
} from "@/components/communication/reservas/types";

const ESPACO_TO_DB: Record<EspacoId, PrismaEspaco> = {
  salao: "SALAO", churrasqueira: "CHURRASQUEIRA", quadra: "QUADRA", gourmet: "GOURMET",
};
const ESPACO_FROM_DB: Record<PrismaEspaco, EspacoId> = {
  SALAO: "salao", CHURRASQUEIRA: "churrasqueira", QUADRA: "quadra", GOURMET: "gourmet",
};
const STATUS_FROM_DB: Record<PrismaStatus, StatusReserva> = {
  PENDENTE: "pendente", APROVADA: "aprovada", REJEITADA: "rejeitada", CANCELADA: "cancelada",
};

function toReserva(r: any): Reserva {
  return {
    id: r.id,
    espaco: ESPACO_FROM_DB[r.espaco as PrismaEspaco],
    data: r.data,
    horarioInicio: r.horarioInicio,
    horarioFim: r.horarioFim,
    solicitanteId: r.solicitanteId,
    solicitante: r.solicitante,
    status: STATUS_FROM_DB[r.status as PrismaStatus],
    observacoes: r.observacoes ?? undefined,
    motivoRejeicao: r.motivoRejeicao ?? undefined,
    criadaEm: new Date(r.criadaEm).toISOString(),
    decididaEm: r.decididaEm ? new Date(r.decididaEm).toISOString() : undefined,
    canceladaEm: r.canceladaEm ? new Date(r.canceladaEm).toISOString() : undefined,
  };
}

function toBloqueio(b: any): Bloqueio {
  return {
    id: b.id,
    espaco: b.espaco ? ESPACO_FROM_DB[b.espaco as PrismaEspaco] : "todos",
    data: b.data,
    motivo: b.motivo ?? undefined,
    criadoPor: b.criadoPor,
    criadoEm: new Date(b.criadoEm).toISOString(),
  };
}

export interface ListaReservas {
  reservas: Reserva[];
  bloqueios: Bloqueio[];
}

export async function listReservasAction(): Promise<ListaReservas> {
  const session = await requireSession();
  if (!session.condominiumId) return { reservas: [], bloqueios: [] };
  const [reservas, bloqueios] = await Promise.all([
    reservaRepository.listReservas(session.condominiumId),
    reservaRepository.listBloqueios(session.condominiumId),
  ]);
  return { reservas: reservas.map(toReserva), bloqueios: bloqueios.map(toBloqueio) };
}

export async function solicitarReservaAction(
  input: SolicitarReservaInput,
  solicitante: string,
): Promise<Reserva | null> {
  const session = await requireSession();
  if (!session.condominiumId) return null;
  const cid = session.condominiumId;
  const espaco = ESPACO_TO_DB[input.espaco];

  // Conflito: bloqueio ou reserva aprovada no espaco+data.
  const [aprovada, bloqueio] = await Promise.all([
    reservaRepository.findReservaAprovada(cid, espaco, input.data),
    reservaRepository.findBloqueioAtivo(cid, espaco, input.data),
  ]);
  if (aprovada || bloqueio) return null;

  const row = await reservaRepository.createReserva({
    condominiumId: cid,
    espaco,
    data: input.data,
    horarioInicio: input.horarioInicio,
    horarioFim: input.horarioFim,
    solicitanteId: session.userId,
    solicitante,
    status: "PENDENTE",
    observacoes: input.observacoes ?? null,
  });
  return toReserva(row);
}

export async function aprovarReservaAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await reservaRepository.updateReserva(id, session.condominiumId, {
    status: "APROVADA",
    decididaEm: new Date(),
    motivoRejeicao: null,
  });
  return { ok: true };
}

export async function rejeitarReservaAction(id: string, motivo: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await reservaRepository.updateReserva(id, session.condominiumId, {
    status: "REJEITADA",
    motivoRejeicao: motivo.trim(),
    decididaEm: new Date(),
  });
  return { ok: true };
}

export async function cancelarReservaAction(id: string): Promise<{ ok: boolean }> {
  const session = await requireSession();
  if (!session.condominiumId) return { ok: false };
  const r = await reservaRepository.findReserva(id, session.condominiumId);
  if (!r) return { ok: false };
  // So o proprio solicitante ou um gestor pode cancelar.
  if (r.solicitanteId !== session.userId && !isManager(session.role)) return { ok: false };
  await reservaRepository.updateReserva(id, session.condominiumId, {
    status: "CANCELADA",
    canceladaEm: new Date(),
  });
  return { ok: true };
}

export async function bloquearDataAction(
  espaco: EspacoId | "todos",
  data: string,
  motivo: string | undefined,
  autor: string,
): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await reservaRepository.createBloqueio({
    condominiumId: session.condominiumId,
    espaco: espaco === "todos" ? null : ESPACO_TO_DB[espaco],
    data,
    motivo: motivo?.trim() || null,
    criadoPor: autor,
  });
  return { ok: true };
}

export async function liberarDataAction(bloqueioId: string): Promise<{ ok: boolean }> {
  const session = await requireManager();
  if (!session.condominiumId) return { ok: false };
  await reservaRepository.removeBloqueio(bloqueioId, session.condominiumId);
  return { ok: true };
}
