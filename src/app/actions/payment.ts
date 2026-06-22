'use server';

import { processBoletoPagamento, getAccountBalances } from '@/lib/stellar-payment';

/**
 * Server Action: processa o pagamento completo de um boleto.
 * Chamada pelo componente Boletos.tsx quando o morador clica em "Pagar".
 */
export async function pagarBoletoViaStellar(params: {
  boletoId: string;
  brlAmount: number;
  unitNumber: string;
  referenceMonth: string;
  payerName: string;
}) {
  return processBoletoPagamento(params);
}

/**
 * Server Action: retorna os saldos da conta operacional da Wave.
 * Usada pelo painel admin para mostrar status da conta.
 */
export async function getSaldoContaOperacional() {
  const secret = process.env.WAVE_STELLAR_SECRET;
  if (!secret) {
    return { xlm: '0.00', usdc: '0.00', found: false, publicKey: null };
  }

  const { Keypair } = await import('@stellar/stellar-sdk');
  const kp = Keypair.fromSecret(secret);
  const publicKey = kp.publicKey();

  const balances = await getAccountBalances(publicKey);
  return { ...balances, publicKey };
}
