// ---------------------------------------------------------------------------
// src/components/boletos/barcode.ts  (DEPRECADO)
//
// Este arquivo colidia com "Barcode.tsx" em sistemas de arquivos
// case-insensitive (Windows), fazendo o import "./barcode" resolver para o
// componente errado (bug: onlyDigits is not a function). A logica foi movida
// para "itf.ts". Mantido apenas como reexport para nao quebrar imports
// antigos. NAO adicione codigo novo aqui — use "./itf".
// ---------------------------------------------------------------------------

export * from './itf';
