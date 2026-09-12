// ---------------------------------------------------------------------------
// src/app/api/psp/webhook/route.ts  —  MOR-057
//
// Webhook de confirmação de pagamento do PSP/Gateway (fonte primária da receita).
// Recebe a confirmação (unidade/valor/data), faz a baixa automática e contabiliza
// a receita — idempotente. No PSP real, a origem é validada por ASSINATURA; aqui
// (sandbox) validamos um segredo compartilhado quando configurado (PSP_WEBHOOK_SECRET).
//
// Somente escrita de receita a partir de confirmação — nunca movimenta valores.
// ---------------------------------------------------------------------------

import { NextResponse } from "next/server";
import { contabilizarPagamentoPsp } from "@/server/services/receitaService";

export async function POST(req: Request) {
  // SEG-009 — antes, sem PSP_WEBHOOK_SECRET configurada, a validação era
  // pulada inteiramente e QUALQUER requisição não autenticada da internet
  // conseguia contabilizar receita/dar baixa em boleto de qualquer condomínio.
  // Agora falha FECHADO: sem segredo configurado no servidor, a requisição é
  // sempre recusada — nunca aceita por omissão de configuração.
  const secret = process.env.PSP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[psp/webhook] PSP_WEBHOOK_SECRET não configurada no servidor — recusando requisição.");
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (req.headers.get("x-psp-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const { condominiumId, boletoId, unitNumber, referenceMonth, valorPago, dataPagamento, pspReferencia } = body ?? {};
  const temIdentificacao = !!boletoId || (!!unitNumber && !!referenceMonth);
  if (!condominiumId || valorPago == null || !temIdentificacao) {
    return NextResponse.json(
      { ok: false, error: "campos obrigatórios: condominiumId, valorPago e (boletoId OU unitNumber+referenceMonth)" },
      { status: 400 },
    );
  }

  const res = await contabilizarPagamentoPsp({
    condominiumId,
    boletoId,
    unitNumber,
    referenceMonth,
    valorPago: Number(valorPago),
    dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
    pspReferencia,
  });

  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
