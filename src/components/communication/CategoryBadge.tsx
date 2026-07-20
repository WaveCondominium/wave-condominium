import type { CategoriaAviso } from './types';
import { CATEGORIAS } from './constants';

interface CategoryBadgeProps {
  categoria: CategoriaAviso;
  /** Usa o rótulo curto (útil em telas estreitas). */
  short?: boolean;
  className?: string;
}

/** Badge da categoria do aviso (elevador, água, energia...). */
export function CategoryBadge({ categoria, short = false, className = '' }: CategoryBadgeProps) {
  const meta = CATEGORIAS[categoria];
  const { Icon } = meta;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.badgeClass} ${className}`}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {short ? meta.short : meta.label}
    </span>
  );
}
