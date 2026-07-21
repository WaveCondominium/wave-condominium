'use client';

import { Receipt, CalendarClock, DollarSign } from 'lucide-react';

import type { BoletoFull } from './boletoTypes';
import { formatCurrency, formatCompetencia, formatDateBR, resolveStatusAberto } from './boletoFormat';
import { StatusAbertoBadge } from './badges';

interface AbertosSectionProps {
  boletos: BoletoFull[];
  onVerDetalhes: (b: BoletoFull) => void;
  onPagar: (b: BoletoFull) => void;
}

/** Secao "Boletos em Aberto" — pendentes/vencidos da unidade do morador. */
export function AbertosSection({ boletos, onVerDetalhes, onPagar }: AbertosSectionProps) {
  if (boletos.length === 0) {
    return (
      <EmptyState
        icon={<CalendarClock className="h-10 w-10 text-wave-300" />}
        title="Nenhum boleto em aberto"
        subtitle="Voce esta em dia! Novos boletos aparecerao aqui quando forem emitidos."
      />
    );
  }

  return (
    <div className="space-y-4">
      {boletos.map((b) => {
        const status = resolveStatusAberto(b);
        return (
          <div
            key={b.id}
            className={`rounded-2xl border bg-white/80 p-5 shadow-sm backdrop-blur-sm transition-all hover:shadow-md sm:p-6 ${
              status === 'vencido' ? 'border-red-200 bg-red-50/50' : 'border-wave-100'
            }`}
          >
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-wave-100 p-2">
                  <Receipt className="h-5 w-5 text-wave-600" />
                </div>
                <div>
                  <h3 className="text-wave-800">{b.description}</h3>
                  <p className="text-sm text-wave-500">Unidade {b.unitNumber}</p>
                </div>
              </div>
              <StatusAbertoBadge status={status} />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Competencia" value={formatCompetencia(b.referenceMonth)} />
              <Field label="Vencimento" value={formatDateBR(b.dueDate)} />
              <Field label="Valor" value={formatCurrency(b.amount)} strong />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => onVerDetalhes(b)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-wave-100 py-2.5 text-wave-600 transition-colors hover:bg-wave-200"
              >
                <Receipt className="h-5 w-5" />
                Ver detalhes
              </button>
              <button
                onClick={() => onPagar(b)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-wave-800 py-2.5 text-white transition-colors hover:bg-wave-700"
              >
                <DollarSign className="h-5 w-5" />
                Pagar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div>
      <p className="text-xs text-wave-500">{label}</p>
      <p className={strong ? 'text-lg text-wave-800' : 'text-wave-800'}>{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wave-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">{icon}</div>
      <h3 className="mb-1 text-lg text-wave-800">{title}</h3>
      <p className="max-w-sm text-sm text-wave-500">{subtitle}</p>
    </div>
  );
}
