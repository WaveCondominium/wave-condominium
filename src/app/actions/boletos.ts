"use server";

// ---------------------------------------------------------------------------
// src/app/actions/boletos.ts
//
// Server Actions de Boletos sobre PostgreSQL. Escopo por condominio; emissao
// exige gestao; pagamento/compensacao atualizam status + campos de ancora
// Stellar. Valores monetarios sao Decimal no banco.
//
// Requer `prisma generate` apos o schema (model Boleto e enums).
// ---------------------------------------------------------------------------

import type { StatusBoleto as PrismaStatus, FormaPagamento as PrismaPM } from "@prisma/client";
import { requireSession, requireManager } from "@/server/auth/guard";
import { boletoRepository } from "@/server/repositories/boletoRepository";
import type { BoletoFull, PaymentMethod } from "@/components/boletos/boletoTypes";

const STATUS_TO_DB: Record<string, PrismaStatus> = {
  pending: "PENDING", paid: "PAID", compensated: "COMPENSATED",
  blockchain_registered: "BLOCKCHAIN_REGISTERED", overdue: "OVERDUE",
};
const STATUS_FROM_DB: Record<PrismaStatus, string> = {
  PENDING: "pending", PAID: "paid", COMPENSATED: "compensated",
  BLOCKCHAIN_REGISTERED: "blockchain_registered", OVERDUE: "overdue",
};
const PM_TO_DB: Record<PaymentMethod, PrismaPM> = { pix: "PIX", card: "CARD", boleto: "BOLETO" };
const PM_FROM_DB: Record<PrismaPM, PaymentMethod> = { PIX: "pix", CARD: "card", BOLETO: "boleto" };

function dateOnly(d: Date | null | undefined): string | undefined {
  return d ? new Date(d).toISOString().split("T")[0] : undefined;
}

function toApp(b: any): BoletoFull {
  return {
    id: b.id,
    unitNumber: b.unitNumber,
    unitOwner: b.unitOwner,
    referenceMonth: b.referenceMonth,
    dueDate: b.dueDate,
    amount: Number(b.amount),
    barcode: b.barcode,
    status: STATUS_FROM_DB[b.status as PrismaStatus],
    description: b.description,
    details: {
      condominiumFee: Number(b.condominiumFee),
      waterFee: Number(b.waterFee),
      reserveFund: Number(b.reserveFund),
      otherFees: Number(b.otherFees),
    },
    issuedBy: b.issuedBy,
    issuedAt: dateOnly(b.issuedAt) ?? "",
    paidAt: dateOnly(b.paidAt),
    compensatedAt: dateOnly(b.compensatedAt),
    paymentMethod: b.paymentMethod ? PM_FROM_DB[b.paymentMethod as PrismaPM] : undefined,
    blockchainHash: b.blockchainHash ?? undefined,
    blockchainRegisteredAt: b.blockchainRegisteredAt ? new Date(b.blockchainRegisteredAt).toISOString() : undefined,
    stellarExplorerUrl: b.stellarExplorerUrl ?? undefined,
  };
}

function gerarBarcode(): string {
  const r = (n: number) => Math.floor(Math.random() * 10 ** n).toString().padStart(n, "0");
  return `23793.38128 60000.${r(5)} ${r(6)}.${r(6)} ${Math.floor(Math.random() * 10)} 9999${r(10)}`;
}

export interface EmitirBoletoInput {
  unitNumber: string;
  unitOwner: string;
  referenceMonth: string;
  dueDate: string;
  amount: number;
  description: string;
  details: { condominiumFee: number; waterFee: number; reserveFund: number; otherFees: number };
}

/** Lista os boletos do condominio. O filtro por unidade (morador) segue no cliente. */
export async function listBoletosAction(): Promise<BoletoFull[]> {
  const session = await requireSession();
  if (!session.condominiumId) return [];
  const rows = await boletoRepository.listByCondominium(session.condominiumId);
  return rows.map(toApp);
}

/** Emite um boleto (gestor). */
export async function emitirBoletoAction(input: EmitirBoletoInput, issuedBy: string): Promise<BoletoFull | null> {
  const session = await requireManager();
  if (!session.condominiumId) return null;
  const row = await boletoRepository.create({
    condominiumId: session.condominiumId,
    unitNumber: input.unitNumber,
    unitOwner: input.unitOwner,
    referenceMonth: input.referenceMonth,
    dueDate: input.dueDate,
    amount: input.amount,
    barcode: gerarBarcode(),
    status: "PENDING",
    description: input.description,
    condominiumFee: input.details.condominiumFee,
    waterFee: input.details.waterFee,
    reserveFund: input.details.reserveFund,
    otherFees: input.details.otherFees,
    issuedBy,
  });
  return toApp(row);
}

export interface BoletoPatch {
  status?: string;
  paymentMethod?: PaymentMethod | null;
  paidAt?: string | null;
  compensatedAt?: string | null;
  blockchainHash?: string | null;
  blockchainRegisteredAt?: string | null;
  stellarExplorerUrl?: string | null;
}

/** Atualiza pagamento/compensacao de um boleto (persiste status + ancora Stellar). */
export async function atualizarBoletoAction(id: string, patch: BoletoPatch): Promise<{ ok: boolean }> {
  const session = await requireSession();
  if (!session.condominiumId) return { ok: false };
  await boletoRepository.update(id, session.condominiumId, {
    ...(patch.status !== undefined ? { status: STATUS_TO_DB[patch.status] } : {}),
    ...(patch.paymentMethod !== undefined ? { paymentMethod: patch.paymentMethod ? PM_TO_DB[patch.paymentMethod] : null } : {}),
    ...(patch.paidAt !== undefined ? { paidAt: patch.paidAt ? new Date(patch.paidAt) : null } : {}),
    ...(patch.compensatedAt !== undefined ? { compensatedAt: patch.compensatedAt ? new Date(patch.compensatedAt) : null } : {}),
    ...(patch.blockchainHash !== undefined ? { blockchainHash: patch.blockchainHash } : {}),
    ...(patch.blockchainRegisteredAt !== undefined ? { blockchainRegisteredAt: patch.blockchainRegisteredAt ? new Date(patch.blockchainRegisteredAt) : null } : {}),
    ...(patch.stellarExplorerUrl !== undefined ? { stellarExplorerUrl: patch.stellarExplorerUrl } : {}),
  });
  return { ok: true };
}
