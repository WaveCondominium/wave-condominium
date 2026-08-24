'use client';

// ---------------------------------------------------------------------------
// src/components/treasury/useDespesas.ts
//
// Acesso às despesas do condomínio. Hoje lê de localStorage com dados de
// demonstração (padrão do protótipo). A mesma chave será usada pela futura
// tela de lançamento de despesas (Síndico/Administradora), então a origem já
// nasce num lugar único e compartilhável.
// ---------------------------------------------------------------------------

import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  DEFAULT_DESPESAS,
  DESPESAS_STORAGE_KEY,
  totalDespesas,
  agruparPorCategoria,
  type Despesa,
  type CategoriaResumo,
} from './despesas';

export interface UseDespesasResult {
  despesas: Despesa[];
  total: number;
  porCategoria: CategoriaResumo[];
}

export function useDespesas(): UseDespesasResult {
  const [despesas] = useLocalStorage<Despesa[]>(DESPESAS_STORAGE_KEY, DEFAULT_DESPESAS);

  return {
    despesas,
    total: totalDespesas(despesas),
    porCategoria: agruparPorCategoria(despesas),
  };
}
