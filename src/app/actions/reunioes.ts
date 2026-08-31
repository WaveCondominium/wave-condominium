"use server";

// ---------------------------------------------------------------------------
// src/app/actions/reunioes.ts
//
// Server Actions de Reuniões & Atas (SÍN-026) sobre PostgreSQL.
//
// Segurança (validada NO SERVIDOR):
//   - Leitura: qualquer usuário autenticado do condomínio;
//   - Criar reunião / salvar ata: exigem gestão (requireManager) — MOR-055;
//   - Confirmar presença: qualquer sessão, vinculada à identidade do usuário
//     (MOR-032), uma confirmação por usuário/reunião.
// Tudo escopado por session.condominiumId (multi-tenant).
//
// Requer `prisma generate` após o schema (models Reuniao/ConfirmacaoPresenca).
// ---------------------------------------------------------------------------

import type { StatusReuniao as PrismaStatusReuniao } from "@prisma/client";
import { requireSession, requireManager } from "@/server/auth/guard";
import { reuniaoRepository } from "@/server/repositories/reuniaoRepository";
import { userRepository } from "@/server/repositories/userRepository";
import { calcularHashAta } from "@/components/meetings/atasIntegridade";
import {
  validarNovaReuniao,
  type Reuniao,
  type StatusReuniao,
  type NovaReuniaoInput,
} from "@/components/meetings/reunioes";
import type { ConfirmacaoPresenca } from "@/components/meetings/presencaConfirmacoes";

const STATUS_FROM_DB: Record<PrismaStatusReuniao, StatusReuniao> = {
  AGENDADA: "scheduled",
  EM_ANDAMENTO: "ongoing",
  CONCLUIDA: "completed",
};

function toApp(r: any): Reuniao {
  return {
    id: r.id,
    title: r.titulo,
    description: r.descricao,
    date: r.data,
    time: r.horario,
    duration: r.duracao,
    meetLink: r.meetLink ?? "",
    status: STATUS_FROM_DB[r.status as PrismaStatusReuniao],
    participants: r._count?.confirmacoes ?? 0,
    maxParticipants: r.maxParticipantes,
    agenda: r.pauta ?? [],
    createdBy: r.criadoPor,
    createdAt: new Date(r.criadoEm).toLocaleDateString("pt-BR"),
    ataContent: r.ataContent ?? undefined,
    ataHash: r.ataHash ?? undefined,
    recordingUrl: r.recordingUrl ?? undefined,
  };
}

function toConfirmacao(c: any): ConfirmacaoPresenca {
  return {
    meetingId: c.reuniaoId,
    nome: c.nome,
    unidade: c.unidade ?? "",
    confirmadoEm: new Date(c.confirmadoEm).toISOString(),
  };
}

export type ReuniaoResult = { ok: true; reuniao: Reuniao } | { ok: false; error: string };

// --- Leitura -----------------------------------------------------------------

export async function listReunioesAction(): Promise<Reuniao[]> {
  const session = await requireSession();
  if (!session.condominiumId) return [];
  const rows = await reuniaoRepository.listByCondominium(session.condominiumId);
  return rows.map(toApp);
}

export async function listConfirmacoesAction(): Promise<ConfirmacaoPresenca[]> {
  const session = await requireSession();
  if (!session.condominiumId) return [];
  const rows = await reuniaoRepository.listConfirmacoesByCondominium(session.condominiumId);
  return rows.map(toConfirmacao);
}

// --- Criação (gestor) --------------------------------------------------------

export async function criarReuniaoAction(input: NovaReuniaoInput): Promise<ReuniaoResult> {
  const session = await requireManager();
  if (!session.condominiumId) {
    return { ok: false, error: "Condomínio ativo não identificado na sessão." };
  }
  const erro = validarNovaReuniao(input);
  if (erro) return { ok: false, error: erro };

  const gestor = await userRepository.findById(session.userId);
  const row = await reuniaoRepository.create({
    condominiumId: session.condominiumId,
    titulo: input.title.trim(),
    descricao: input.description.trim(),
    data: input.date,
    horario: input.time,
    duracao: input.duration,
    meetLink: input.meetLink?.trim() || "",
    maxParticipantes: input.maxParticipants,
    pauta: input.agenda.filter((i) => i && i.trim()),
    status: "AGENDADA",
    criadoPor: gestor?.name ?? "Gestor",
  });
  return { ok: true, reuniao: toApp({ ...row, _count: { confirmacoes: 0 } }) };
}

// --- Ata (gestor) — comportamento atual: salvar ata conclui a reunião --------

export async function salvarAtaAction(id: string, conteudo: string): Promise<ReuniaoResult> {
  const session = await requireManager();
  if (!session.condominiumId) {
    return { ok: false, error: "Condomínio ativo não identificado na sessão." };
  }
  if (!conteudo || !conteudo.trim()) {
    return { ok: false, error: "Informe o conteúdo da ata." };
  }
  const existente = await reuniaoRepository.findById(id, session.condominiumId);
  if (!existente) return { ok: false, error: "Reunião não encontrada." };

  // Registra o código de integridade da versão oficial (MOR-033) e conclui.
  await reuniaoRepository.update(id, session.condominiumId, {
    ataContent: conteudo,
    ataHash: calcularHashAta(conteudo),
    status: "CONCLUIDA",
  });

  const rows = await reuniaoRepository.listByCondominium(session.condominiumId);
  const atualizada = rows.find((r: any) => r.id === id);
  return atualizada
    ? { ok: true, reuniao: toApp(atualizada) }
    : { ok: false, error: "Falha ao salvar a ata." };
}

// --- Confirmação de presença (morador) ---------------------------------------

export async function confirmarPresencaAction(reuniaoId: string): Promise<{ ok: boolean; error?: string }> {
  const session = await requireSession();
  if (!session.condominiumId) return { ok: false, error: "Condomínio ativo não identificado na sessão." };

  const reuniao = await reuniaoRepository.findById(reuniaoId, session.condominiumId);
  if (!reuniao) return { ok: false, error: "Reunião não encontrada." };

  const user = await userRepository.findById(session.userId);
  const res = await reuniaoRepository.confirmarPresenca({
    reuniaoId,
    condominiumId: session.condominiumId,
    userId: session.userId,
    nome: user?.name ?? "Morador",
    unidade: user?.unit ?? "",
  });
  return { ok: res === "ok" };
}
