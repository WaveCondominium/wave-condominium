// ---------------------------------------------------------------------------
// src/components/boletos/boletoPdf.ts
//
// Compoe o PDF oficial do boleto usando o PdfDoc (sem dependencias) e a
// codificacao Interleaved 2 of 5. Layout inspirado na ficha de compensacao
// bancaria: cabecalho, linha digitavel, dados, detalhamento e codigo de barras.
//
// Funcao PURA (nao toca no DOM) — retorna os bytes do PDF, que a UI empacota
// em Blob para download/impressao.
// ---------------------------------------------------------------------------

import type { BoletoLike } from './boletoTypes';
import { PdfDoc } from './pdfBuilder';
import { encodeITF, onlyDigits, barWidthUnits } from './itf';
import {
  formatCurrency,
  formatDateBR,
  formatCompetencia,
  resolveStatusMorador,
  STATUS_MORADOR_LABEL,
} from './boletoFormat';

const MARGIN = 40;
const PAGE_W = 595; // A4 em pontos
const CONTENT_W = PAGE_W - MARGIN * 2;

export function buildBoletoPdfBytes(boleto: BoletoLike): Uint8Array {
  const doc = new PdfDoc(PAGE_W, 842);
  let y = MARGIN;

  // Cabecalho
  doc.text(MARGIN, y + 4, 16, 'Wave Condominio', { bold: true });
  doc.text(PAGE_W - MARGIN, y + 2, 9, `Boleto No ${boleto.id}`, { align: 'right', gray: 0.35 });
  y += 12;
  doc.text(MARGIN, y + 6, 9, 'Gestao Condominial Inteligente', { gray: 0.35 });
  y += 16;
  doc.hline(MARGIN, y, CONTENT_W, 1.2);
  y += 16;

  // Linha digitavel (destaque)
  doc.text(MARGIN, y, 8, 'LINHA DIGITAVEL', { gray: 0.4 });
  y += 12;
  doc.text(MARGIN, y, 12, boleto.barcode, { bold: true });
  y += 18;
  doc.hline(MARGIN, y, CONTENT_W, 0.6, 0.6);
  y += 18;

  // Grade de dados (2 colunas)
  const colR = MARGIN + CONTENT_W / 2;
  const status = STATUS_MORADOR_LABEL[resolveStatusMorador(boleto)];

  y = field(doc, MARGIN, colR, y, 'Unidade', boleto.unitNumber, 'Beneficiario', 'Wave Condominio');
  y = field(doc, MARGIN, colR, y, 'Sacado (Proprietario)', boleto.unitOwner, 'Competencia', formatCompetencia(boleto.referenceMonth));
  y = field(doc, MARGIN, colR, y, 'Vencimento', formatDateBR(boleto.dueDate), 'Status', status);
  y = field(doc, MARGIN, colR, y, 'Valor do Documento', formatCurrency(boleto.amount), 'Descricao', boleto.description);

  y += 4;
  doc.hline(MARGIN, y, CONTENT_W, 0.6, 0.6);
  y += 16;

  // Detalhamento
  doc.text(MARGIN, y, 10, 'Detalhamento', { bold: true });
  y += 16;
  y = lineItem(doc, y, 'Taxa de Condominio', boleto.details.condominiumFee);
  y = lineItem(doc, y, 'Agua', boleto.details.waterFee);
  y = lineItem(doc, y, 'Fundo de Reserva', boleto.details.reserveFund);
  y = lineItem(doc, y, 'Outras Taxas', boleto.details.otherFees);
  doc.hline(MARGIN, y, CONTENT_W, 0.8);
  y += 14;
  doc.text(MARGIN, y, 11, 'Valor Total', { bold: true });
  doc.text(PAGE_W - MARGIN, y, 12, formatCurrency(boleto.amount), { bold: true, align: 'right' });
  y += 26;

  // Codigo de barras (Interleaved 2 of 5)
  doc.hline(MARGIN, y, CONTENT_W, 0.6, 0.6);
  y += 16;
  doc.text(MARGIN, y, 8, 'CODIGO DE BARRAS', { gray: 0.4 });
  y += 10;
  drawBarcode(doc, MARGIN, y, boleto.barcode);
  y += 56;

  // Rodape
  doc.text(MARGIN, y, 8, 'Documento gerado pela plataforma Wave. Comprovante sujeito a confirmacao bancaria.', {
    gray: 0.45,
  });

  return doc.toBytes();
}

/** Duas colunas de rotulo/valor na mesma linha. Retorna novo y. */
function field(
  doc: PdfDoc,
  xL: number,
  xR: number,
  y: number,
  labelL: string,
  valueL: string,
  labelR: string,
  valueR: string,
): number {
  doc.text(xL, y, 8, labelL.toUpperCase(), { gray: 0.4 });
  doc.text(xR, y, 8, labelR.toUpperCase(), { gray: 0.4 });
  doc.text(xL, y + 13, 11, valueL);
  doc.text(xR, y + 13, 11, valueR);
  return y + 30;
}

/** Item do detalhamento (rotulo a esquerda, valor a direita). Retorna novo y. */
function lineItem(doc: PdfDoc, y: number, label: string, value: number): number {
  doc.text(MARGIN, y, 10, label, { gray: 0.2 });
  doc.text(PAGE_W - MARGIN, y, 10, formatCurrency(value), { align: 'right' });
  return y + 16;
}

/** Desenha as barras ITF escalando para caber na largura do conteudo. */
function drawBarcode(doc: PdfDoc, x: number, yTop: number, linhaDigitavel: string): void {
  const digits = onlyDigits(linhaDigitavel);
  const bars = encodeITF(digits);
  const totalUnits = bars.reduce((s, b) => s + barWidthUnits(b), 0);
  const unit = CONTENT_W / totalUnits; // largura de 1 unidade para caber exato
  const height = 44;

  let cx = x;
  for (const bar of bars) {
    const w = barWidthUnits(bar) * unit;
    if (bar.black) doc.rect(cx, yTop, w, height);
    cx += w;
  }
}
