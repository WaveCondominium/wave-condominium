'use client';

import { useLocalStorage } from './useLocalStorage';

// ---------------------------------------------------------------------------
// Movido de Treasury.tsx para cá: esta interface estava duplicada entre
// Boletos.tsx e Treasury.tsx (dívida técnica documentada anteriormente).
// Agora Treasury.tsx importa este tipo em vez de ter sua própria cópia.
// Boletos.tsx ainda mantém a cópia dele por enquanto — fica como sugestão
// de limpeza futura, fora do escopo deste ajuste.
// ---------------------------------------------------------------------------
export interface Boleto {
  id: string;
  unitNumber: string;
  unitOwner: string;
  referenceMonth: string; // 'YYYY-MM'
  dueDate: string;        // 'YYYY-MM-DD'
  amount: number;
  barcode: string;
  status: 'pending' | 'paid' | 'compensated' | 'blockchain_registered' | 'overdue';
  issuedAt: string;
  issuedBy: string;
  paidAt?: string;
  compensatedAt?: string;
  blockchainHash?: string;
  stellarExplorerUrl?: string;
  anchorTxHash?: string;
  contentHash?: string;
  blockchainRegisteredAt?: string;
  description: string;
  details: {
    condominiumFee: number;
    waterFee: number;
    reserveFund: number;
    otherFees: number;
  };
}

export const PAID_STATUS = 'blockchain_registered';

function getTodayLocalISO(): string {
  return new Date().toLocaleDateString('en-CA'); // en-CA => YYYY-MM-DD
}

export function isBoletoOverdue(boleto: Pick<Boleto, 'status' | 'dueDate'>): boolean {
  return boleto.status === 'pending' && boleto.dueDate < getTodayLocalISO();
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

// ---------------------------------------------------------------------------
// Responsabilidade única: calcular os indicadores financeiros do condomínio
// a partir dos boletos reais (wave_boletos). Extraído de Treasury.tsx para
// ser consumido também pelo Dashboard — garante que os dois lugares SEMPRE
// mostrem exatamente o mesmo número, nunca duas fórmulas divergentes.
// ---------------------------------------------------------------------------
export function useFinancialSummary() {
  const [boletos] = useLocalStorage<Boleto[]>('wave_boletos', []);

  const boletosPagos = boletos.filter((b) => b.status === PAID_STATUS);
  const saldoAtual = boletosPagos.reduce((sum, b) => sum + b.amount, 0);
  const fundoReserva = boletosPagos.reduce((sum, b) => sum + (b.details?.reserveFund ?? 0), 0);

  const currentMonthKey = getCurrentMonthKey();
  const boletosDoMes = boletos.filter((b) => b.referenceMonth === currentMonthKey);
  const boletosPagosDoMes = boletosDoMes.filter((b) => b.status === PAID_STATUS);
  const receitasDoMes = boletosPagosDoMes.reduce((sum, b) => sum + b.amount, 0);

  // Adimplência/Inadimplência calculadas por UNIDADE (não por boleto), sobre
  // as unidades que têm cobrança no mês atual.
  const unidadesComCobrancaDoMes = new Set(boletosDoMes.map((b) => b.unitNumber));
  const unidadesAdimplentesDoMes = new Set(boletosPagosDoMes.map((b) => b.unitNumber));
  const percentualAdimplencia = unidadesComCobrancaDoMes.size > 0
    ? Math.round((unidadesAdimplentesDoMes.size / unidadesComCobrancaDoMes.size) * 100)
    : 0;
  const percentualInadimplencia = unidadesComCobrancaDoMes.size > 0
    ? 100 - percentualAdimplencia
    : 0;

  const boletosVencidos = boletos.filter(isBoletoOverdue);
  const totalInadimplencia = boletosVencidos.reduce((sum, b) => sum + b.amount, 0);
  const unidadesInadimplentes = new Set(boletosVencidos.map((b) => b.unitNumber));

  // ATENÇÃO: aproximação — conta unidades distintas que já apareceram em
  // boletos, não o cadastro real de unidades do condomínio (que ainda não
  // existe como fonte de dados neste projeto). Mesma limitação documentada
  // anteriormente em Treasury.tsx.
  const totalUnidadesConhecidas = new Set(boletos.map((b) => b.unitNumber)).size;

  return {
    boletos,
    saldoAtual,
    fundoReserva,
    currentMonthKey,
    boletosDoMes,
    boletosPagosDoMes,
    receitasDoMes,
    percentualAdimplencia,
    percentualInadimplencia,
    boletosVencidos,
    totalInadimplencia,
    unidadesInadimplentes,
    totalUnidadesConhecidas,
  };
}
