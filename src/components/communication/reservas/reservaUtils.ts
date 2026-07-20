// ---------------------------------------------------------------------------
// src/components/communication/reservas/reservaUtils.ts
//
// Funcoes PURAS de disponibilidade, conflito, ordenacao e formatacao.
// Sem dependencia de React/DOM — testaveis isoladamente.
// ---------------------------------------------------------------------------

import type { Bloqueio, DiaStatus, EspacoId, Reserva, StatusReserva } from './types';

/** Chave de dia 'YYYY-MM-DD' a partir de ano/mes(0-11)/dia. */
export function dateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/** Chave de hoje no fuso local. */
export function todayKey(now: Date = new Date()): string {
  return dateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

/** true se a data (YYYY-MM-DD) e anterior a hoje. */
export function isPast(data: string, now: Date = new Date()): boolean {
  return data < todayKey(now);
}

/** Bloqueio que atinge o espaco+dia (considera 'todos'). */
export function findBloqueio(
  data: string,
  espaco: EspacoId,
  bloqueios: Bloqueio[],
): Bloqueio | undefined {
  return bloqueios.find(
    (b) => b.data === data && (b.espaco === espaco || b.espaco === 'todos'),
  );
}

/** Reserva aprovada que ocupa o espaco+dia. */
export function findReservaAprovada(
  data: string,
  espaco: EspacoId,
  reservas: Reserva[],
): Reserva | undefined {
  return reservas.find(
    (r) => r.data === data && r.espaco === espaco && r.status === 'aprovada',
  );
}

/**
 * Impede novas solicitacoes: existe bloqueio OU reserva aprovada no espaco+dia.
 * (Regra de negocio: aprovacao bloqueia o dia inteiro para aquele espaco.)
 */
export function hasConflito(
  data: string,
  espaco: EspacoId,
  reservas: Reserva[],
  bloqueios: Bloqueio[],
): boolean {
  return Boolean(
    findBloqueio(data, espaco, bloqueios) || findReservaAprovada(data, espaco, reservas),
  );
}

/** Status visual de um dia para um espaco (usado no calendario). */
export function getDiaStatus(
  data: string,
  espaco: EspacoId,
  reservas: Reserva[],
  bloqueios: Bloqueio[],
  now: Date = new Date(),
): DiaStatus {
  if (isPast(data, now)) return 'passado';
  if (findBloqueio(data, espaco, bloqueios)) return 'bloqueada';
  if (findReservaAprovada(data, espaco, reservas)) return 'reservada';
  return 'disponivel';
}

/** Existe alguma solicitacao pendente no espaco+dia? (marcador no calendario) */
export function hasPendente(
  data: string,
  espaco: EspacoId,
  reservas: Reserva[],
): boolean {
  return reservas.some(
    (r) => r.data === data && r.espaco === espaco && r.status === 'pendente',
  );
}

const STATUS_ORDER: Record<StatusReserva, number> = {
  pendente: 0,
  aprovada: 1,
  rejeitada: 2,
  cancelada: 3,
};

/**
 * Ordena para a lista de gestao: pendentes primeiro (pedem acao), depois por
 * data da reserva (mais proxima primeiro) e, por fim, por criacao (desc).
 * Nao muta o array recebido.
 */
export function sortReservas(reservas: Reserva[]): Reserva[] {
  return [...reservas].sort((a, b) => {
    if (STATUS_ORDER[a.status] !== STATUS_ORDER[b.status]) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    if (a.data !== b.data) return a.data < b.data ? -1 : 1;
    return b.criadaEm.localeCompare(a.criadaEm);
  });
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY'. */
export function formatData(data: string): string {
  const parts = data.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : data;
}

/** Faixa de horario 'HH:mm - HH:mm'. */
export function formatHorario(inicio: string, fim: string): string {
  if (!inicio && !fim) return '';
  return `${inicio}${fim ? ` - ${fim}` : ''}`;
}

/** Valida que fim > inicio (mesmo dia). Retorna null se ok, ou msg de erro. */
export function validarHorario(inicio: string, fim: string): string | null {
  if (!inicio || !fim) return 'Informe o horario de inicio e de fim.';
  if (fim <= inicio) return 'O horario de fim deve ser posterior ao de inicio.';
  return null;
}
