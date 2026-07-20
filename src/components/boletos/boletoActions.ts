// ---------------------------------------------------------------------------
// src/components/boletos/boletoActions.ts
//
// Efeitos de navegador para baixar e imprimir o PDF do boleto.
//
// Impressao: a tecnica de "iframe oculto + contentWindow.print()" falha
// SILENCIOSAMENTE para PDFs no Chrome/Edge (o visualizador embutido nao
// responde ao print() do iframe e nao lanca erro). Por isso a impressao abre
// o MESMO PDF numa nova aba (visualizador nativo do navegador) e dispara o
// print() ali — abordagem confiavel em Chrome, Edge, Firefox e Safari. Se o
// popup for bloqueado, cai para o iframe como ultimo recurso.
//
// Download e impressao usam exatamente o mesmo documento (mesma funcao
// buildBoletoPdfBytes), preservando a formatacao.
// ---------------------------------------------------------------------------

import type { BoletoLike } from './boletoTypes';
import { buildBoletoPdfBytes } from './boletoPdf';
import { boletoFileName } from './boletoFormat';

/** Gera o PDF e devolve uma object URL (blob) pronta para uso no navegador. */
function createPdfUrl(boleto: BoletoLike): string {
  const bytes = buildBoletoPdfBytes(boleto);
  // Copia para um ArrayBuffer proprio — evita a incompatibilidade de tipos
  // Uint8Array/BlobPart das libs mais novas do TS e garante bytes corretos.
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  const blob = new Blob([buffer], { type: 'application/pdf' });
  return URL.createObjectURL(blob);
}

/** Gera o PDF e inicia o download automaticamente. */
export function downloadBoletoPdf(boleto: BoletoLike): void {
  const url = createPdfUrl(boleto);
  const a = document.createElement('a');
  a.href = url;
  a.download = boletoFileName(boleto);
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoga depois de um tempo — cedo demais cancela o download em andamento.
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Abre o PDF do boleto numa nova aba e dispara a janela de impressao. O
 * usuario pode imprimir ou salvar como PDF pelo proprio visualizador.
 */
export function printBoletoPdf(boleto: BoletoLike): void {
  const url = createPdfUrl(boleto);
  const win = window.open(url, '_blank');

  if (!win) {
    // Popup bloqueado — ultimo recurso: iframe oculto.
    printViaIframe(url);
    return;
  }

  let triggered = false;
  const doPrint = () => {
    if (triggered) return;
    triggered = true;
    try {
      win.focus();
      win.print();
    } catch {
      // Se o print automatico falhar, o usuario ainda tem o botao de
      // imprimir do visualizador de PDF aberto na aba.
    }
  };

  try {
    win.addEventListener('load', doPrint);
  } catch {
    /* alguns navegadores nao expoem o load da aba de PDF — usa o timeout */
  }
  // Visualizadores de PDF podem demorar a renderizar; tenta apos um intervalo.
  window.setTimeout(doPrint, 1200);
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}

/** Fallback de impressao via iframe oculto (quando o popup e bloqueado). */
function printViaIframe(url: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* noop */
    }
    window.setTimeout(() => {
      iframe.remove();
      URL.revokeObjectURL(url);
    }, 60000);
  };
  document.body.appendChild(iframe);
  iframe.src = url;
}
