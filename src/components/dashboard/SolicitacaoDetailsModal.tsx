'use client';

import { X, Hash, Tag, Calendar, RefreshCw } from 'lucide-react';

import type { SolicitacaoServico } from './moradorDashboardTypes';
import { OcorrenciaBadge } from './OcorrenciaBadge';

function fmt(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

/** Detalhes de uma solicitacao de servico do morador. */
export function SolicitacaoDetailsModal({ solicitacao, onClose }: { solicitacao: SolicitacaoServico; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Detalhes da solicitacao"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-xl text-wave-800">Detalhes da Solicitacao</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-wave-500 hover:text-wave-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <OcorrenciaBadge status={solicitacao.status} />
        </div>

        <dl className="space-y-3 text-sm">
          <Row icon={<Hash className="h-4 w-4" />} label="Protocolo" value={solicitacao.protocolo} />
          <Row icon={<Tag className="h-4 w-4" />} label="Tipo" value={solicitacao.tipo} />
          <Row icon={<Calendar className="h-4 w-4" />} label="Abertura" value={fmt(solicitacao.aberturaEm)} />
          <Row icon={<RefreshCw className="h-4 w-4" />} label="Ultima atualizacao" value={fmt(solicitacao.atualizadoEm)} />
        </dl>

        {solicitacao.descricao && (
          <div className="mt-4 rounded-xl bg-wave-50 p-3">
            <p className="mb-1 text-xs text-wave-500">Descricao</p>
            <p className="text-sm text-wave-700">{solicitacao.descricao}</p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-wave-800 py-2.5 text-white transition-colors hover:bg-wave-700"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-2 text-wave-500">
        {icon}
        {label}
      </dt>
      <dd className="text-right text-wave-800">{value}</dd>
    </div>
  );
}
