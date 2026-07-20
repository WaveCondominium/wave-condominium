// ---------------------------------------------------------------------------
// src/components/communication/reservas/constants.tsx
//
// Metadados de apresentacao de Espacos e Status de reserva.
// Fonte unica de verdade (DRY) — componentes nao repetem switch/case.
// ---------------------------------------------------------------------------

import type { ComponentType } from 'react';
import {
  PartyPopper,
  Flame,
  Trophy,
  UtensilsCrossed,
  Clock,
  CheckCircle,
  XCircle,
  Ban,
} from 'lucide-react';

import type { EspacoId, StatusReserva } from './types';

interface EspacoMeta {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  /** Classe de acento (texto/fundo) para o espaco. */
  accentClass: string;
}

export const ESPACOS: Record<EspacoId, EspacoMeta> = {
  salao: { label: 'Salao de Festas', Icon: PartyPopper, accentClass: 'text-purple-600' },
  churrasqueira: { label: 'Churrasqueira', Icon: Flame, accentClass: 'text-orange-600' },
  quadra: { label: 'Quadra Poliesportiva', Icon: Trophy, accentClass: 'text-emerald-600' },
  gourmet: { label: 'Espaco Gourmet', Icon: UtensilsCrossed, accentClass: 'text-rose-600' },
};

export const ESPACO_OPTIONS: EspacoId[] = ['salao', 'churrasqueira', 'quadra', 'gourmet'];

interface StatusMeta {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  badgeClass: string;
}

export const STATUS_RESERVA: Record<StatusReserva, StatusMeta> = {
  pendente: {
    label: 'Pendente',
    Icon: Clock,
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  aprovada: {
    label: 'Aprovada',
    Icon: CheckCircle,
    badgeClass: 'bg-green-100 text-green-700 border-green-200',
  },
  rejeitada: {
    label: 'Rejeitada',
    Icon: XCircle,
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
  },
  cancelada: {
    label: 'Cancelada',
    Icon: Ban,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

/** Ordem estavel para filtros de status na UI. */
export const STATUS_OPTIONS: StatusReserva[] = ['pendente', 'aprovada', 'rejeitada', 'cancelada'];
