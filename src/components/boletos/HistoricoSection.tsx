'use client';

import { CheckCircle, Calendar, CreditCard, ShieldCheck, FileCheck2, History } from 'lucide-react';

import type { BoletoFull } from './boletoTypes';
import { formatCurrency, formatCompetencia, formatDateBR, paymentMethodLabel } from './boletoFormat';
import { PagoBadge } from './badges';

interface HistoricoSectionProps {
  boletos: BoletoFull[];
  onVerComprovante: (b: BoletoFull) => void;
  onVerDetalhes: (b: BoletoFull) => void;
}

/** Secao "Historico de Pagamentos" — boletos quitados da unidade. */
export function HistoricoSection({ boletos, onVerComprovante, onVerDetalhes }: HistoricoSectionProps) {
  if (boletos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wave-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
        <History className="mb-3 h-10 w-10 text-wave-300" aria-hidden="true" />
        <h3 className="mb-1 text-lg text-wave-800">Nenhum pagamento ainda</h3>
        <p className="max-w-sm text-sm text-wave-500">
          Quando um boleto for pago e compensado, ele aparecera aqui com o comprovante rastreavel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {boletos.map((b) => {
        const dataPagamento = b.paidAt || b.compensatedAt;
        return (
          <div key={b.id} className="rounded-2xl border border-wave-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-100 p-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-wave-800">{b.description}</h3>
                  <p className="text-sm text-wave-500">Unidade {b.unitNumber}</p>
                </div>
              </div>
              <PagoBadge />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Field label="Competencia" value={formatCompetencia(b.referenceMonth)} />
              <Field label="Valor pago" value={formatCurrency(b.amount)} strong />
              <Field
                label="Data do pagamento"
                value={dataPagamento ? formatDateBR(dataPagamento.split('T')[0]) : '—'}
                icon={<Calendar className="h-3.5 w-3.5" />}
              />
              <Field
                label="Forma de pagamento"
                value={paymentMethodLabel(b.paymentMethod)}
                icon={<CreditCard className="h-3.5 w-3.5" />}
              />
            </div>

            {/* Hash da transacao na Stellar */}
            {b.blockchainHash ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Registrado na Stellar
                </div>
                <p className="break-all font-mono text-xs text-emerald-700">{b.blockchainHash}</p>
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-wave-200 bg-wave-50 p-3 text-xs text-wave-500">
                Aguardando registro da transacao na rede Stellar.
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => onVerDetalhes(b)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-wave-100 py-2.5 text-wave-600 transition-colors hover:bg-wave-200"
              >
                Ver detalhes
              </button>
              <button
                onClick={() => onVerComprovante(b)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 py-2.5 text-white shadow-lg transition-all hover:opacity-95"
              >
                <FileCheck2 className="h-5 w-5" />
                Ver comprovante
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  value,
  strong = false,
  icon,
}: {
  label: string;
  value: string;
  strong?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs text-wave-500">
        {icon}
        {label}
      </p>
      <p className={strong ? 'text-lg text-wave-800' : 'text-wave-800'}>{value}</p>
    </div>
  );
}
