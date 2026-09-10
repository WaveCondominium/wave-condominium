"use server";

import { processBoletoPagamento, getAccountBalances, type PaymentResult } from "@/lib/stellar-payment";
import { requireSession, requirePlatformAdmin } from "@/server/auth/guard";
import { isManager } from "@/lib/rbac";
import { boletoRepository } from "@/server/repositories/boletoRepository";
import { userRepository } from "@/server/repositories/userRepository";

function falha(error: string): PaymentResult {
  return {
    success: false,
    onRamp: { brlAmount: 0, usdcAmount: 0, rate: 0, provider: "abroad_mock", mockTxId: "" },
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * SEG-009 — Correção de Broken Access Control (OWASP A01).
 *
 * ANTES: esta action recebia boletoId, brlAmount, unitNumber, referenceMonth
 * e payerName inteiramente do cliente, e repassava direto para
 * processBoletoPagamento SEM NENHUMA validação contra o banco. Isso permitia
 * a qualquer usuário autenticado (inclusive gestor, inclusive de outro
 * condomínio) mover fundos Stellar informando um boletoId/valor/unidade
 * arbitrários — nenhuma checagem de que o boleto existe, pertence ao
 * condomínio do usuário, ou pertence à unidade dele. Isso também contrariava
 * a regra já estabelecida no SÍN-009 ("síndico não paga boleto de terceiro"),
 * que só protegia o outro caminho de pagamento (atualizarBoletoAction).
 *
 * AGORA: a action só recebe o boletoId. Todo o resto (valor, unidade, mês de
 * referência) é lido do boleto real no banco, escopado por condomínio da
 * sessão, e validado contra a unidade do usuário logado — o mesmo padrão já
 * usado no restante do módulo de Boletos (SÍN-009).
 */
export async function pagarBoletoViaStellar(params: { boletoId: string }): Promise<PaymentResult> {
  const session = await requireSession();
  if (!session.condominiumId) {
    return falha("Condomínio ativo não identificado na sessão.");
  }

  // SÍN-009: gestor não paga boleto de terceiro. Aqui a regra é ainda mais
  // simples — gestor não paga boleto nenhum por este caminho.
  if (isManager(session.role)) {
    return falha("Gestores não podem pagar boletos.");
  }

  const boleto = await boletoRepository.findById(params.boletoId, session.condominiumId);
  if (!boleto) {
    return falha("Boleto não encontrado.");
  }

  const user = await userRepository.findById(session.userId);
  if (!user?.unit || user.unit !== boleto.unitNumber) {
    return falha("Você só pode pagar boletos da sua própria unidade.");
  }

  // Idempotência real (substitui o Set em memória de stellar-payment.ts, que
  // não sobrevive entre invocações serverless): se o boleto já está marcado
  // como pago no banco, não processa de novo.
  if (boleto.paidAt) {
    return falha("Este boleto já está pago.");
  }

  return processBoletoPagamento({
    boletoId: boleto.id,
    brlAmount: Number(boleto.amount), // valor real do banco — nunca do cliente
    unitNumber: boleto.unitNumber,
    referenceMonth: boleto.referenceMonth,
    payerName: user.name,
  });
}

export async function getSaldoContaOperacional() {
  // C3: dado operacional da plataforma -> exclusivo de Admin, checado no servidor.
  await requirePlatformAdmin();

  const secret = process.env.WAVE_STELLAR_SECRET;
  if (!secret) {
    return { xlm: "0.00", usdc: "0.00", found: false, publicKey: null };
  }

  const { Keypair } = await import("@stellar/stellar-sdk");
  const kp = Keypair.fromSecret(secret);
  const publicKey = kp.publicKey();

  const balances = await getAccountBalances(publicKey);
  return { ...balances, publicKey };
}
