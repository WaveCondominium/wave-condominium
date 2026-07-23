'use client';

// ---------------------------------------------------------------------------
// src/components/dashboard/useMoradorDashboard.ts
//
// Dados do Dashboard do Morador — agora sobre PostgreSQL via Server Action.
//
// A action retorna APENAS o que pertence a unidade do morador logado (o filtro
// por unidade e feito no servidor, a partir da sessao). Os comunicados vem dos
// avisos do condominio, com urgentes no topo. A UI (MoradorDashboard) nao muda.
// ---------------------------------------------------------------------------

import { useEffect, useState } from 'react';

import type { Aviso } from '../communication/types';
import { normalizeAvisos, sortAvisos } from '../communication/avisoUtils';
import type { DocumentoUnidade, ManutencaoUnidade, SolicitacaoServico } from './moradorDashboardTypes';
import { getMoradorDashboardAction } from '@/app/actions/unitDashboard';

export interface MoradorDashboardData {
  documentos: DocumentoUnidade[];
  solicitacoes: SolicitacaoServico[];
  manutencoes: ManutencaoUnidade[];
  comunicados: Aviso[];
}

const EMPTY: MoradorDashboardData = {
  documentos: [],
  solicitacoes: [],
  manutencoes: [],
  comunicados: [],
};

/** Carrega e filtra os dados do painel para a unidade do morador (via banco). */
export function useMoradorDashboard(_unidadeUsuario?: string): MoradorDashboardData {
  const [data, setData] = useState<MoradorDashboardData>(EMPTY);

  useEffect(() => {
    let alive = true;
    getMoradorDashboardAction()
      .then((res) => {
        if (!alive) return;
        setData({
          documentos: [...res.documentos].sort((a, b) => (a.data < b.data ? 1 : -1)),
          solicitacoes: [...res.solicitacoes].sort((a, b) => (a.aberturaEm < b.aberturaEm ? 1 : -1)),
          manutencoes: [...res.manutencoes].sort((a, b) => (a.data < b.data ? 1 : -1)),
          comunicados: sortAvisos(normalizeAvisos(res.comunicados)),
        });
      })
      .catch((err) => console.error('Falha ao carregar o painel da unidade', err));
    return () => {
      alive = false;
    };
  }, []);

  return data;
}
