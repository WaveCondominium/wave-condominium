// ---------------------------------------------------------------------------
// src/components/communication/constants.tsx
//
// Metadados de apresentação de Categorias e Prioridades.
//
// Fonte única de verdade para rótulo, ícone e classes de estilo de cada
// categoria/prioridade. Componentes consomem estes mapas em vez de repetir
// switch/case — segue DRY e mantém consistência visual (paleta wave-*).
// ---------------------------------------------------------------------------

import type { ComponentType } from 'react';
import {
  AlertTriangle,
  ArrowUp,
  Info,
  ArrowUpDown,
  Droplets,
  Zap,
  HardHat,
  Waves,
  Bug,
  ShieldAlert,
  CalendarDays,
  Megaphone,
} from 'lucide-react';

import type { CategoriaAviso, Prioridade } from './types';

interface CategoriaMeta {
  label: string;
  /** Rótulo curto para uso em badge/coluna estreita. */
  short: string;
  Icon: ComponentType<{ className?: string }>;
  /** Classes do badge (fundo + texto + borda). */
  badgeClass: string;
}

export const CATEGORIAS: Record<CategoriaAviso, CategoriaMeta> = {
  elevador: {
    label: 'Manutenção de elevadores',
    short: 'Elevadores',
    Icon: ArrowUpDown,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  agua: {
    label: 'Fornecimento de água',
    short: 'Água',
    Icon: Droplets,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  energia: {
    label: 'Energia em áreas comuns',
    short: 'Energia',
    Icon: Zap,
    badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  obras: {
    label: 'Obras e reformas',
    short: 'Obras',
    Icon: HardHat,
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  caixa_dagua: {
    label: "Limpeza de caixas d'água",
    short: "Caixa d'água",
    Icon: Waves,
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  },
  dedetizacao: {
    label: 'Dedetização',
    short: 'Dedetização',
    Icon: Bug,
    badgeClass: 'bg-lime-50 text-lime-700 border-lime-200',
  },
  seguranca: {
    label: 'Segurança',
    short: 'Segurança',
    Icon: ShieldAlert,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  evento: {
    label: 'Evento',
    short: 'Evento',
    Icon: CalendarDays,
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  comunicado: {
    label: 'Comunicado oficial',
    short: 'Comunicado',
    Icon: Megaphone,
    badgeClass: 'bg-wave-50 text-wave-600 border-wave-100',
  },
};

/** Ordem estável para popular selects. */
export const CATEGORIA_OPTIONS: CategoriaAviso[] = [
  'elevador',
  'agua',
  'energia',
  'obras',
  'caixa_dagua',
  'dedetizacao',
  'seguranca',
  'evento',
  'comunicado',
];

interface PrioridadeMeta {
  label: string;
  Icon: ComponentType<{ className?: string }>;
  /** Classes do badge. */
  badgeClass: string;
  /** Classes de destaque do card (borda/realce). */
  cardClass: string;
}

export const PRIORIDADES: Record<Prioridade, PrioridadeMeta> = {
  urgente: {
    label: 'Urgente',
    Icon: AlertTriangle,
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    cardClass: 'border-red-300 ring-1 ring-red-200 bg-red-50/40',
  },
  alta: {
    label: 'Alta',
    Icon: ArrowUp,
    badgeClass: 'bg-amber-100 text-amber-700 border-amber-200',
    cardClass: 'border-amber-200',
  },
  normal: {
    label: 'Normal',
    Icon: Info,
    badgeClass: 'bg-wave-100 text-wave-600 border-wave-100',
    cardClass: 'border-wave-100',
  },
};

/** Ordem estável para selects de prioridade. */
export const PRIORIDADE_OPTIONS: Prioridade[] = ['urgente', 'alta', 'normal'];
