'use client';

import { X, ShieldCheck, ExternalLink, Copy, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import type { BoletoFull } from './boletoTypes';
import { formatCurrency, formatCompetencia, formatDateBR, paymentMethodLabel } from './boletoFormat';

interface ComprovanteModalProps {
  boleto: BoletoFull;
  onClose: () => void;
}

/** Deriva o link publico de consulta da transacao na Stellar, se possivel. */
function stellarLink(b: BoletoFull): string | null {
  if (b.stellarExplorerUrl) return b.stellarExplorerUrl;
  const h = b.blockchainHash;
  if (h && !h.startsWith('0x') && h.length === 64) {
    return `https://stellar.expert/explorer/testnet/tx/${h}`;
  }
  return null;
}

/**
 * Comprovante rastreavel de um pagamento: dados do boleto, data/hora da
 * compensacao, hash da transacao na Stellar, status e link de consulta.
 */
export function ComprovanteModal({ boleto, onClose }: ComprovanteModalProps) {
  const registrado = Boolean(boleto.blockchainHash);
  const link = stellarLink(boleto);
  const dataHoraCompensacao = boleto.blockchainRegisteredAt
    ? new Date(boleto.blockchainRegisteredAt).toLocaleString('pt-BR')
    : boleto.compensatedAt
      ? formatDateBR(boleto.compensatedAt.split('T')[0])
      : boleto.paidAt
        ? formatDateBR(boleto.paidAt.split('T')[0])
        : '—';

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado!`);
    } catch {
      toast.error('Nao foi possivel copiar.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-wave-800/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-wave-100 bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 p-2">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl text-wave-800">Comprovante</h2>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="rounded-lg p-2 transition-colors hover:bg-wave-50">
            <X className="h-5 w-5 text-wave-500" />
          </button>
        </div>

        {/* Status da transacao */}
        <div
          className={`mb-6 flex items-center gap-3 rounded-xl border p-4 ${
            registrado ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
          }`}
        >
          {registrado ? (
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          ) : (
            <Clock className="h-6 w-6 text-amber-600" />
          )}
          <div>
            <p className={`font-medium ${registrado ? 'text-emerald-800' : 'text-amber-800'}`}>
              {registrado ? 'Pagamento confirmado e registrado' : 'Pagamento em processamento'}
            </p>
            <p className={`text-xs ${registrado ? 'text-emerald-600' : 'text-amber-600'}`}>
              Status da transacao: {registrado ? 'Confirmada na rede Stellar' : 'Aguardando registro'}
            </p>
          </div>
        </div>

        {/* Dados do boleto */}
        <div className="mb-6 rounded-xl bg-wave-50 p-4">
          <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-wave-500">Dados do boleto</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Unidade" value={boleto.unitNumber} />
            <Info label="Proprietario" value={boleto.unitOwner} />
            <Info label="Competencia" value={formatCompetencia(boleto.referenceMonth)} />
            <Info label="Vencimento" value={formatDateBR(boleto.dueDate)} />
            <Info label="Valor pago" value={formatCurrency(boleto.amount)} />
            <Info label="Forma de pagamento" value={paymentMethodLabel(boleto.paymentMethod)} />
            <Info label="Data/hora da compensacao" value={dataHoraCompensacao} full />
          </div>
        </div>

        {/* Transacao Stellar */}
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            Transacao na blockchain Stellar
          </h3>
          {registrado ? (
            <>
              <p className="mb-1 text-xs text-emerald-600">Hash da transacao</p>
              <div className="flex items-center gap-2">
                <p className="flex-1 break-all font-mono text-xs text-emerald-700">{boleto.blockchainHash}</p>
                <button
                  onClick={() => copy(boleto.blockchainHash!, 'Hash')}
                  className="shrink-0 rounded bg-emerald-100 p-1.5 transition-colors hover:bg-emerald-200"
                  aria-label="Copiar hash"
                >
                  <Copy className="h-3.5 w-3.5 text-emerald-700" />
                </button>
              </div>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-emerald-100 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Consultar transacao na blockchain
                </a>
              )}
            </>
          ) : (
            <p className="text-xs text-emerald-700">
              A transacao sera registrada na Stellar assim que a compensacao bancaria for concluida.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full rounded-xl bg-wave-800 py-2.5 text-white transition-colors hover:bg-wave-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function Info({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <p className="mb-0.5 text-xs text-wave-500">{label}</p>
      <p className="text-wave-800">{value}</p>
    </div>
  );
}
