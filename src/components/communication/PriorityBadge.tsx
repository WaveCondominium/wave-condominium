import type { Prioridade } from './types';
import { PRIORIDADES } from './constants';

interface PriorityBadgeProps {
  prioridade: Prioridade;
  className?: string;
}

/** Badge de nível de prioridade (Urgente / Alta / Normal). */
export function PriorityBadge({ prioridade, className = '' }: PriorityBadgeProps) {
  const meta = PRIORIDADES[prioridade];
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
