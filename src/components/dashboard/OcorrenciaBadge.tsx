import { Clock, Loader, CheckCircle, XCircle } from 'lucide-react';

import { type StatusOcorrencia, STATUS_OCORRENCIA_LABEL } from './moradorDashboardTypes';

const META: Record<StatusOcorrencia, { cls: string; Icon: typeof Clock }> = {
  aberta: { cls: 'bg-orange-100 text-orange-700 border-orange-200', Icon: Clock },
  em_andamento: { cls: 'bg-wave-100 text-wave-600 border-wave-200', Icon: Loader },
  concluida: { cls: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
  cancelada: { cls: 'bg-slate-100 text-slate-600 border-slate-200', Icon: XCircle },
};

/** Badge de status de solicitacao/manutencao (Aberta/Em andamento/Concluida/Cancelada). */
export function OcorrenciaBadge({ status, className = '' }: { status: StatusOcorrencia; className?: string }) {
  const { cls, Icon } = META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls} ${className}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {STATUS_OCORRENCIA_LABEL[status]}
    </span>
  );
}
