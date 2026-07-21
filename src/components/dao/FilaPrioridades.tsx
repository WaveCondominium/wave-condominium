'use client';

import { ListOrdered, Trophy } from 'lucide-react';

import { type Proposta, apurar, formatData, statusFila, CATEGORIA_LABEL } from './governanceCore';
import { StatusFilaBadge } from './StatusBadge';

/**
 * Fila de Prioridades: propostas aprovadas pela comunidade, ordenadas pelo
 * apoio recebido. Recebe a lista ja ordenada (ordenarFila).
 */
export function FilaPrioridades({ fila }: { fila: Proposta[] }) {
  if (fila.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wave-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
        <ListOrdered className="mb-3 h-10 w-10 text-wave-300" aria-hidden="true" />
        <h3 className="mb-1 text-lg text-wave-800">Fila vazia</h3>
        <p className="max-w-sm text-sm text-wave-500">
          As propostas aprovadas pela comunidade aparecerao aqui, ordenadas pelo apoio recebido.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {fila.map((p, i) => {
        const ap = apurar(p);
        const pos = i + 1;
        return (
          <div
            key={p.id}
            className="flex flex-col gap-3 rounded-2xl border border-wave-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:flex-row sm:items-center"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-semibold ${
                pos === 1 ? 'bg-amber-100 text-amber-700' : 'bg-wave-100 text-wave-700'
              }`}
            >
              {pos === 1 ? <Trophy className="h-5 w-5" /> : pos}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h4 className="text-wave-800">{p.titulo}</h4>
                <span className="rounded-full bg-wave-50 px-2.5 py-0.5 text-xs text-wave-600">
                  {CATEGORIA_LABEL[p.categoria]}
                </span>
                <StatusFilaBadge status={statusFila(p)} />
              </div>
              <p className="text-xs text-wave-500">
                Aprovada em {formatData(p.aprovadaEm)} • {ap.aprovo} votos favoraveis • {ap.total} votos no total
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-2xl font-semibold text-green-600">{ap.percentAprovacao}%</p>
              <p className="text-xs text-wave-500">aprovacao</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
