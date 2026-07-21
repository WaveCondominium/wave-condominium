import { Clock, AlertTriangle, CalendarClock, CheckCircle } from 'lucide-react';

import type { StatusAberto } from './boletoTypes';
import { STATUS_ABERTO_LABEL } from './boletoFormat';

const ABERTO_STYLE: Record<StatusAberto, { cls: string; Icon: typeof Clock }> = {
  aberto: { cls: 'bg-wave-100 text-wave-600 border-wave-200', Icon: Clock },
  proximo: { cls: 'bg-amber-100 text-amber-700 border-amber-200', Icon: CalendarClock },
  vencido: { cls: 'bg-red-100 text-red-700 border-red-200', Icon: AlertTriangle },
};

/** Badge de status de um boleto em aberto (Em Aberto / Proximo / Vencido). */
export function StatusAbertoBadge({ status, className = '' }: { status: StatusAberto; className?: string }) {
  const { cls, Icon } = ABERTO_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium ${cls} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {STATUS_ABERTO_LABEL[status]}
    </span>
  );
}

/** Badge fixo "Pago" para o historico de pagamentos. */
export function PagoBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-medium text-green-700 ${className}`}>
      <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Pago
    </span>
  );
}
