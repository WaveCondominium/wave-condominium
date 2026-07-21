// ---------------------------------------------------------------------------
// src/components/boletos/boletoFormat.ts
//
// Funcoes PURAS de formatacao e resolucao de status. Sem DOM — testaveis.
//
// Datas 'YYYY-MM-DD' sao tratadas como texto (nunca new Date(string)) para
// evitar o bug de timezone/off-by-one ja documentado em Boletos.tsx.
// ---------------------------------------------------------------------------

import type { BoletoLike, PaymentMethod, StatusAberto, StatusMorador } from './boletoTypes';

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

/** true se o boleto ja foi pago (qualquer etapa apos o pagamento). */
export function isPago(boleto: Pick<BoletoLike, 'status'>): boolean {
  return ['paid', 'compensated', 'blockchain_registered'].includes(boleto.status);
}

/** Janela (em dias) para considerar um boleto "Proximo do Vencimento". */
export const DIAS_PROXIMO_VENCIMENTO = 5;

/** Dias ate o vencimento (negativo = ja venceu), comparando datas locais. */
export function diasAteVencimento(dueDate: string, now: Date = new Date()): number {
  const [y, m, d] = dueDate.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const due = new Date(y, m - 1, d);
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - hoje.getTime()) / 86400000);
}

/**
 * Status de um boleto EM ABERTO para a secao correspondente:
 *   - vencido: data de vencimento ja passou;
 *   - proximo: vence dentro de DIAS_PROXIMO_VENCIMENTO dias;
 *   - aberto:  ainda ha folga ate o vencimento.
 */
export function resolveStatusAberto(
  boleto: Pick<BoletoLike, 'dueDate'>,
  now: Date = new Date(),
): StatusAberto {
  const dias = diasAteVencimento(boleto.dueDate, now);
  if (dias < 0) return 'vencido';
  if (dias <= DIAS_PROXIMO_VENCIMENTO) return 'proximo';
  return 'aberto';
}

export const STATUS_ABERTO_LABEL: Record<StatusAberto, string> = {
  aberto: 'Em Aberto',
  proximo: 'Proximo do Vencimento',
  vencido: 'Vencido',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: 'Pix',
  card: 'Cartao de Credito',
  boleto: 'Boleto Bancario',
};

/**
 * Rotulo da forma de pagamento. Boletos antigos (sem metodo salvo) assumem
 * "Pix" por padrao (decisao de produto para dados legados).
 */
export function paymentMethodLabel(method?: PaymentMethod): string {
  return method ? PAYMENT_METHOD_LABEL[method] : PAYMENT_METHOD_LABEL.pix;
}

/** Nome de arquivo seguro para o PDF do boleto. */
export function boletoFileName(boleto: Pick<BoletoLike, 'unitNumber' | 'referenceMonth'>): string {
  const comp = boleto.referenceMonth.replace('-', '_');
  const unit = String(boleto.unitNumber).replace(/[^0-9A-Za-z]/g, '');
  return `boleto_${unit}_${comp}.pdf`;
}
