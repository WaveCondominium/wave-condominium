"use server";

// ---------------------------------------------------------------------------
// src/app/actions/aprovacoes.ts
//
// Server Actions da Central de Aprovações Pendentes (SÍN-026).
//
// AGREGADOR: reúne, num formato único (`Pendencia`), as solicitações que
// aguardam a decisão do Síndico, lendo os módulos que já são fonte de verdade
// no banco. Nesta fase: Reservas (status pendente) e Propostas (aprovadas pela
// comunidade, aguardando homologação). Novas fontes (financeiro, reuniões,
// manutenção...) se plugam aqui sem mudar a UI.
//
// DECISÃO: `decidirPendenciaAction` NÃO reimplementa regras — despacha para as
// ações já existentes de cada módulo (aprovar/rejeitar/homologar), que revalidam
// permissão (requireManager) e escopo por condomínio no servidor. Assim a
// Central concentra a decisão sem duplicar lógica nem quebrar os fluxos atuais.
// ---------------------------------------------------------------------------

import { requireManager } from "@/server/auth/guard";
import { listReservasAction, aprovarReservaAction, rejeitarReservaAction } from "@/app/actions/reservas";
import { listPropostasAction, homologarPropostaAction, rejeitarPropostaAction } from "@/app/actions/governanca";
import { listDespesasAction, aprovarDespesaAction, reprovarDespesaAction } from "@/app/actions/despesas";
import {
  ordenarPendencias,
  type Pendencia,
  type PendenciaTipo,
  type Decisao,
} from "@/components/approvals/pendencias";
import type { Reserva, EspacoId } from "@/components/communication/reservas/types";
import type { Proposta } from "@/components/dao/governanceCore";
import { formatBRL, type Despesa, CATEGORIA_DESPESA_LABEL } from "@/components/treasury/despesas";

// Rótulos de espaço (decoupled da constante .tsx da UI, que carrega ícones).
const ESPACO_LABEL: Record<EspacoId, string> = {
  salao: "Salão de Festas",
  churrasqueira: "Churrasqueira",
  quadra: "Quadra Poliesportiva",
  gourmet: "Espaço Gourmet",
};

const CATEGORIA_LABEL: Record<string, string> = {
  obras: "Obras", seguranca: "Segurança", financeiro: "Financeiro", eventos: "Eventos",
  melhorias: "Melhorias", sustentabilidade: "Sustentabilidade", outros: "Outros",
};

// SLA (dias) para a decisão do Síndico numa proposta aprovada pela comunidade.
const SLA_DECISAO_PROPOSTA_DIAS = 7;

function formatDataBR(iso: string): string {
  // aceita 'YYYY-MM-DD' ou ISO completo
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
}

// --- Mapeamento de cada fonte -> Pendencia -----------------------------------

function mapReserva(r: Reserva): Pendencia {
  // Prazo natural: o próprio evento — decidir depois dele é inócuo.
  const prazo = `${r.data}T${r.horarioInicio || "00:00"}:00`;
  return {
    tipo: "RESERVA",
    id: r.id,
    titulo: `${ESPACO_LABEL[r.espaco]} · ${formatDataBR(r.data)}`,
    solicitante: r.solicitante,
    dataEntrada: r.criadaEm,
    prazo,
    detalhes: [
      { label: "Espaço", valor: ESPACO_LABEL[r.espaco] },
      { label: "Data", valor: formatDataBR(r.data) },
      { label: "Horário", valor: `${r.horarioInicio} às ${r.horarioFim}` },
      ...(r.observacoes ? [{ label: "Observações", valor: r.observacoes }] : []),
    ],
    rejeicaoMotivoObrigatorio: false,
  };
}

function mapProposta(p: Proposta): Pendencia {
  const entrada = p.aprovadaEm ?? p.criadaEm;
  const prazo = new Date(new Date(entrada).getTime() + SLA_DECISAO_PROPOSTA_DIAS * 86_400_000).toISOString();
  const aFavor = Object.values(p.votos ?? {}).filter((v) => v === "aprovo").length;
  return {
    tipo: "PROPOSTA",
    id: p.id,
    titulo: `Proposta · ${p.titulo}`,
    solicitante: p.autor,
    dataEntrada: entrada,
    prazo,
    detalhes: [
      { label: "Categoria", valor: CATEGORIA_LABEL[p.categoria] ?? p.categoria },
      { label: "Descrição", valor: p.descricao },
      { label: "Aprovada pela comunidade em", valor: p.aprovadaEm ? formatDataBR(p.aprovadaEm) : "—" },
      { label: "Votos a favor", valor: String(aFavor) },
    ],
    rejeicaoMotivoObrigatorio: true, // proposta exige motivo na rejeição (SÍN-005)
  };
}

function mapDespesa(d: Despesa): Pendencia {
  return {
    tipo: "DESPESA",
    id: d.id,
    titulo: `${d.descricao} · ${formatBRL(d.valor)}`,
    solicitante: d.registradoPor,
    dataEntrada: d.criadoEm,
    // Prazo natural: o vencimento — decidir antes de vencer evita atraso no pagamento.
    prazo: `${d.dataVencimento}T00:00:00`,
    detalhes: [
      { label: "Valor", valor: formatBRL(d.valor) },
      { label: "Categoria", valor: CATEGORIA_DESPESA_LABEL[d.categoria] },
      ...(d.fornecedor ? [{ label: "Fornecedor", valor: d.fornecedor }] : []),
      { label: "Vencimento", valor: formatDataBR(d.dataVencimento) },
    ],
    rejeicaoMotivoObrigatorio: true, // reprovação de despesa exige motivo
  };
}

// --- Leitura: lista agregada -------------------------------------------------

export async function listPendenciasAction(): Promise<Pendencia[]> {
  const session = await requireManager();
  if (!session.condominiumId) return [];

  const [reservasData, governanca, despesas] = await Promise.all([
    listReservasAction(),
    listPropostasAction(),
    listDespesasAction(),
  ]);

  const pendencias: Pendencia[] = [];
  for (const r of reservasData.reservas) {
    if (r.status === "pendente") pendencias.push(mapReserva(r));
  }
  for (const p of governanca.propostas) {
    if (p.status === "aprovada_comunidade") pendencias.push(mapProposta(p));
  }
  for (const d of despesas) {
    if (d.status === "AGUARDANDO_APROVACAO") pendencias.push(mapDespesa(d));
  }

  return ordenarPendencias(pendencias);
}

// --- Decisão: despacha para a ação do módulo de origem -----------------------

export interface DecidirPendenciaInput {
  tipo: PendenciaTipo;
  id: string;
  decisao: Decisao;
  motivo?: string;
}

export type DecidirPendenciaResult = { ok: true } | { ok: false; error: string };

export async function decidirPendenciaAction(input: DecidirPendenciaInput): Promise<DecidirPendenciaResult> {
  // Barra não-gestor cedo; cada ação delegada revalida permissão e escopo.
  await requireManager();
  const motivo = (input.motivo ?? "").trim();

  if (input.tipo === "RESERVA") {
    if (input.decisao === "aprovar") {
      const r = await aprovarReservaAction(input.id);
      return r.ok ? { ok: true } : { ok: false, error: "Não foi possível aprovar a reserva." };
    }
    const r = await rejeitarReservaAction(input.id, motivo);
    return r.ok ? { ok: true } : { ok: false, error: "Não foi possível rejeitar a reserva." };
  }

  if (input.tipo === "PROPOSTA") {
    if (input.decisao === "aprovar") {
      const r = await homologarPropostaAction(input.id);
      return r.ok ? { ok: true } : { ok: false, error: r.error ?? "Não foi possível aprovar a proposta." };
    }
    const r = await rejeitarPropostaAction(input.id, motivo);
    return r.ok ? { ok: true } : { ok: false, error: r.error };
  }

  if (input.tipo === "DESPESA") {
    if (input.decisao === "aprovar") {
      const r = await aprovarDespesaAction(input.id);
      return r.ok ? { ok: true } : { ok: false, error: r.error };
    }
    const r = await reprovarDespesaAction(input.id, motivo);
    return r.ok ? { ok: true } : { ok: false, error: r.error };
  }

  return { ok: false, error: "Tipo de pendência não suportado." };
}
