// ---------------------------------------------------------------------------
// src/components/boletos/itf.ts
//
// Codificacao Interleaved 2 of 5 (ITF) — o padrao usado no codigo de barras
// de boletos bancarios (FEBRABAN). Gera um array de barras {black, wide}.
//
// NOTA: este modulo se chamava "barcode.ts", mas colidia (em sistemas de
// arquivos case-insensitive, como o Windows) com o componente "Barcode.tsx",
// fazendo o import "./barcode" resolver para o arquivo errado. Renomeado para
// "itf.ts" para eliminar de vez essa classe de bug.
//
// Funcao PURA — sem dependencia de DOM.
// ---------------------------------------------------------------------------

export interface Bar {
  black: boolean;
  wide: boolean;
}

// Padroes ITF por digito: N=narrow(false), W=wide(true). 5 elementos cada.
const PATTERNS: Record<string, boolean[]> = {
  '0': [false, false, true, true, false],
  '1': [true, false, false, false, true],
  '2': [false, true, false, false, true],
  '3': [true, true, false, false, false],
  '4': [false, false, true, false, true],
  '5': [true, false, true, false, false],
  '6': [false, true, true, false, false],
  '7': [false, false, false, true, true],
  '8': [true, false, false, true, false],
  '9': [false, true, false, true, false],
};

/** Extrai apenas os digitos de uma linha digitavel (remove pontos/espacos). */
export function onlyDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

/**
 * Codifica uma string numerica em Interleaved 2 of 5.
 * Digitos sao processados em pares: o primeiro define as barras PRETAS, o
 * segundo as barras BRANCAS, intercaladas. Comprimento impar recebe um zero
 * a esquerda (regra do ITF).
 */
export function encodeITF(digits: string): Bar[] {
  let d = onlyDigits(digits);
  if (d.length % 2 !== 0) d = '0' + d;

  const bars: Bar[] = [];
  // Start: barra-preta-N, branca-N, preta-N, branca-N
  bars.push({ black: true, wide: false });
  bars.push({ black: false, wide: false });
  bars.push({ black: true, wide: false });
  bars.push({ black: false, wide: false });

  for (let i = 0; i < d.length; i += 2) {
    const a = PATTERNS[d[i]];
    const b = PATTERNS[d[i + 1]];
    if (!a || !b) continue;
    for (let k = 0; k < 5; k++) {
      bars.push({ black: true, wide: a[k] }); // barra do 1o digito (preta)
      bars.push({ black: false, wide: b[k] }); // espaco do 2o digito (branca)
    }
  }

  // Stop: preta-W, branca-N, preta-N
  bars.push({ black: true, wide: true });
  bars.push({ black: false, wide: false });
  bars.push({ black: true, wide: false });
  return bars;
}

/** Largura em unidades de uma barra (narrow=1, wide=3 — razao ITF padrao). */
export function barWidthUnits(bar: Bar): number {
  return bar.wide ? 3 : 1;
}

/** Soma das larguras (em unidades) — util para dimensionar/escalar. */
export function totalBarUnits(bars: Bar[]): number {
  return bars.reduce((sum, b) => sum + barWidthUnits(b), 0);
}
