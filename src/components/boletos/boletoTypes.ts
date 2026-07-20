// ---------------------------------------------------------------------------
// src/components/boletos/boletoTypes.ts
//
// Tipo compartilhado (subconjunto estrutural) usado pelos utilitarios de
// boleto, pelo gerador de PDF e pelo modal de detalhes. O objeto Boleto
// completo (definido em Boletos.tsx) satisfaz esta interface por estrutura.
// ---------------------------------------------------------------------------

export interface BoletoDetalhes {
  condominiumFee: number;
  waterFee: number;
  reserveFund: number;
  otherFees: number;
}

/** Campos necessarios para exibir/gerar/imprimir um boleto. */
export interface BoletoLike {
  id: string;
  unitNumber: string;
  unitOwner: string;
  /** 'YYYY-MM' */
  referenceMonth: string;
  /** 'YYYY-MM-DD' */
  dueDate: string;
  amount: number;
  /** Linha digitavel (formato tipavel, com pontos/espacos). */
  barcode: string;
  status: string;
  description: string;
  details: BoletoDetalhes;
}

/** Status voltado ao morador, conforme regra de negocio (3 estados). */
export type StatusMorador = 'pago' | 'pendente' | 'vencido';
