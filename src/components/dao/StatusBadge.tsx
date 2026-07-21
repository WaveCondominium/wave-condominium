import type { ComponentType } from 'react';
import { Vote, CheckCircle, XCircle, ListOrdered, Users, Hammer, Flag, Clock, Trophy } from 'lucide-react';

import { type StatusProposta, type StatusFila, STATUS_LABEL, STATUS_FILA_LABEL } from './governanceCore';

const META: Record<StatusProposta, { cls: string; Icon: ComponentType<{ className?: string }> }> = {
  votacao_aberta: { cls: 'bg-wave-100 text-wave-600 border-wave-200', Icon: Vote },
  votacao_encerrada: { cls: 'bg-slate-100 text-slate-600 border-slate-200', Icon: Clock },
  aprovada_comunidade: { cls: 'bg-green-100 text-green-700 border-green-200', Icon: CheckCircle },
  fila_prioridades: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: ListOrdered },
  em_assembleia: { cls: 'bg-purple-100 text-purple-700 border-purple-200', Icon: Users },
  aprovada_assembleia: { cls: 'bg-green-100 text-green-700 border-green-200', Icon: Trophy },
  em_execucao: { cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: Hammer },
  concluida: { cls: 'bg-teal-100 text-teal-700 border-teal-200', Icon: Flag },
  rejeitada: { cls: 'bg-red-100 text-red-700 border-red-200', Icon: XCircle },
};

/** Badge do status do ciclo de vida da proposta. */
export function StatusBadge({ status, className = '' }: { status: StatusProposta; className?: string }) {
  const { cls, Icon } = META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${cls} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  );
}

const FILA_META: Record<StatusFila, { cls: string; emoji: string }> = {
  aguardando: { cls: 'bg-amber-100 text-amber-700 border-amber-200', emoji: '⏳' },
  em_execucao: { cls: 'bg-wave-100 text-wave-600 border-wave-200', emoji: '🔄' },
  concluida: { cls: 'bg-green-100 text-green-700 border-green-200', emoji: '✅' },
};

/** Badge do status simplificado da Fila/Deliberacoes (Aguardando/Em Execucao/Concluida). */
export function StatusFilaBadge({ status, className = '' }: { status: StatusFila; className?: string }) {
  const { cls, emoji } = FILA_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${cls} ${className}`}>
      <span aria-hidden="true">{emoji}</span>
      {STATUS_FILA_LABEL[status]}
    </span>
  );
}
