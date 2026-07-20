// ---------------------------------------------------------------------------
// src/components/boletos/boletoFormat.ts
//
// Funcoes PURAS de formatacao e resolucao de status. Sem DOM — testaveis.
//
// Datas 'YYYY-MM-DD' sao tratadas como texto (nunca new Date(string)) para
// evitar o bug de timezone/off-by-one ja documentado em Boletos.tsx.
// ---------------------------------------------------------------------------

import type { BoletoLike, StatusMorador } from './boletoTypes';

/** R$ 1.234,56 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 'YYYY-MM-DD' -> 'DD/MM/YYYY' sem passar por Date. */
export function formatDateBR(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** 'YYYY-MM' -> 'Julho/2026' (competencia). */
export function formatCompetencia(referenceMonth: string): string {
  const [year, month] = referenceMonth.split('-');
  const idx = Number(month) - 1;
  if (!year || idx < 0 || idx > 11) return referenceMonth;
  return `${MESES[idx]}/${year}`;
}

/** Hoje no horario local como 'YYYY-MM-DD'. */
export function getTodayLocalISO(now: Date = new Date()): string {
  return now.toLocaleDateString('en-CA'); // en-CA => YYYY-MM-DD
}

/**
 * Status voltado ao morador (Pago / Pendente / Vencido) a partir do status
 * interno granular + vencimento:
 *   - paid | compensated | blockchain_registered -> pago
 *   - pending & vencido                           -> vencido
 *   - pending                                     -> pendente
 */
export function resolveStatusMorador(boleto: Pick<BoletoLike, 'status' | 'dueDate'>, now: Date = new Date()): StatusMorador {
  if (['paid', 'compensated', 'blockchain_registered'].includes(boleto.status)) return 'pago';
  if (boleto.status === 'pending' && boleto.dueDate < getTodayLocalISO(now)) return 'vencido';
  if (boleto.status === 'overdue') return 'vencido';
  return 'pendente';
}

export const STATUS_MORADOR_LABEL: Record<StatusMorador, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  vencido: 'Vencido',
};

/** Nome de arquivo seguro para o PDF do boleto. */
export function boletoFileName(boleto: Pick<BoletoLike, 'unitNumber' | 'referenceMonth'>): string {
  const comp = boleto.referenceMonth.replace('-', '_');
  const unit = String(boleto.unitNumber).replace(/[^0-9A-Za-z]/g, '');
  return `boleto_${unit}_${comp}.pdf`;
}
