import type { StatusReserva } from './types';
import { STATUS_RESERVA } from './constants';

interface StatusReservaBadgeProps {
  status: StatusReserva;
  className?: string;
}

/** Badge do status da reserva (Pendente / Aprovada / Rejeitada / Cancelada). */
export function StatusReservaBadge({ status, className = '' }: StatusReservaBadgeProps) {
  const meta = STATUS_RESERVA[status];
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass} ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
