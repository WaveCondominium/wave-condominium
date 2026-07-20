'use client';

import { useMemo } from 'react';
import { encodeITF } from './itf';

interface BarcodeProps {
  /** Linha digitavel (ou qualquer string numerica). */
  value: string;
  height?: number;
  className?: string;
}

/**
 * Renderiza um codigo de barras Interleaved 2 of 5 no DOM, identico ao emitido
 * no PDF (mesma funcao encodeITF). Determinstico — nao usa Math.random.
 */
export function Barcode({ value, height = 56, className = '' }: BarcodeProps) {
  const bars = useMemo(() => encodeITF(value), [value]);
  return (
    <div
      className={`flex items-end ${className}`}
      style={{ height }}
      role="img"
      aria-label="Codigo de barras do boleto"
    >
      {bars.map((bar, i) => (
        <span
          key={i}
          style={{
            width: bar.wide ? 3 : 1,
            height: '100%',
            backgroundColor: bar.black ? '#0f172a' : 'transparent',
          }}
        />
      ))}
    </div>
  );
}
