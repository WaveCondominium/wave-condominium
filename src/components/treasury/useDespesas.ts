'use client';

// ---------------------------------------------------------------------------
// src/components/treasury/useDespesas.ts
//
// Acesso às despesas do condomínio. Hoje lê/grava em localStorage com dados de
// demonstração (padrão do protótipo). Leitura é usada pelo Morador (somente
// visualização); a escrita (`adicionar`) é usada apenas pela UI administrativa
// (Síndico/Administradora) no modal de cadastro — MOR-054.
//
// Observação: o estado é levantado no Treasury (fonte única), então o cadastro
// reflete imediatamente na seção "Despesas" e no "Histórico de Transações".
// ---------------------------------------------------------------------------

import { useCallback } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  DEFAULT_DESPESAS,
  DESPESAS_STORAGE_KEY,
  montarDespesa,
  type Despesa,
  type NovaDespesaInput,
} from './despesas';

export interface UseDespesasResult {
  despesas: Despesa[];
  /** Cadastra uma nova despesa (uso administrativo). Retorna a despesa criada. */
  adicionar: (input: NovaDespesaInput) => Despesa;
}

export function useDespesas(): UseDespesasResult {
  const [despesas, setDespesas] = useLocalStorage<Despesa[]>(DESPESAS_STORAGE_KEY, DEFAULT_DESPESAS);

  const adicionar = useCallback((entrada: NovaDespesaInput): Despesa => {
    const nova = montarDespesa(entrada, `DESP-${Date.now().toString().slice(-8)}`);
    setDespesas((prev) => [nova, ...prev]);
    return nova;
  }, [setDespesas]);

  return { despesas, adicionar };
}
