// ---------------------------------------------------------------------------
// src/components/communication/reservas/types.ts
//
// Modelo de dados do fluxo de Reserva de Espacos Comuns.
//
// Datas em ISO 'YYYY-MM-DD' (dia) e timestamps em ISO 8601 completo, para
// evitar ambiguidade de fuso e facilitar ordenacao/comparacao por string.
// ---------------------------------------------------------------------------

export type EspacoId = 'salao' | 'churrasqueira' | 'quadra' | 'gourmet';

export type StatusReserva = 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada';

export interface Reserva {
  id: string;
  espaco: EspacoId;
  /** Dia da reserva no formato 'YYYY-MM-DD'. */
  data: string;
  /** 'HH:mm' */
  horarioInicio: string;
  /** 'HH:mm' */
  horarioFim: string;
  /** Id do morador solicitante (para escopo por usuario na fase de banco). */
  solicitanteId: string;
  /** Nome + unidade, para exibicao. */
  solicitante: string;
  status: StatusReserva;
  observacoes?: string;
  /** Obrigatorio quando status === 'rejeitada'. */
  motivoRejeicao?: string;
  /** ISO 8601 — criacao da solicitacao. */
  criadaEm: string;
  /** ISO 8601 — quando o sindico aprovou/rejeitou. */
  decididaEm?: string;
  /** ISO 8601 — quando foi cancelada. */
  canceladaEm?: string;
}

/**
 * Bloqueio de disponibilidade criado pelo Sindico (manutencao, evento interno,
 * reforma). Impede novas solicitacoes para o espaco+dia atingidos.
 */
export interface Bloqueio {
  id: string;
  /** 'todos' bloqueia o dia para todos os espacos. */
  espaco: EspacoId | 'todos';
  /** 'YYYY-MM-DD' */
  data: string;
  motivo?: string;
  criadoPor: string;
  criadoEm: string;
}

/** Status visual de um dia no calendario, para um espaco selecionado. */
export type DiaStatus = 'passado' | 'disponivel' | 'reservada' | 'bloqueada';

/** Payload de criacao de uma solicitacao (o hook preenche id/status/datas). */
export interface SolicitarReservaInput {
  espaco: EspacoId;
  data: string;
  horarioInicio: string;
  horarioFim: string;
  observacoes?: string;
}
