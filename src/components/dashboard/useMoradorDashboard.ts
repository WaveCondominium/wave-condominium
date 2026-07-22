'use client';

// ---------------------------------------------------------------------------
// src/components/dashboard/useMoradorDashboard.ts
//
// Fonte de dados do Dashboard do Morador. Le os registros por unidade
// (documentos, solicitacoes, manutencoes) e filtra pela unidade do morador
// logado, garantindo que ele veja APENAS o que pertence ao seu apartamento.
// Os comunicados reutilizam os avisos do modulo de Comunicacao (wave_avisos_v2),
// com os urgentes no topo (mesma regra ja testada).
// ---------------------------------------------------------------------------

import { useMemo } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Aviso } from '../communication/types';
import { normalizeAvisos, sortAvisos } from '../communication/avisoUtils';
import {
  type DocumentoUnidade,
  type ManutencaoUnidade,
  type SolicitacaoServico,
  normalizeUnidade,
} from './moradorDashboardTypes';

const DOCS_KEY = 'wave_unit_docs';
const SOLIC_KEY = 'wave_unit_requests';
const MANUT_KEY = 'wave_unit_maintenance';

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const SEED_DOCS: DocumentoUnidade[] = [
  { id: 'doc-203-1', unidade: '203', titulo: 'Contrato de Locacao - Apto 203', tipo: 'Contrato', data: daysAgoISO(120) },
  { id: 'doc-203-2', unidade: '203', titulo: 'Comunicado: vistoria hidraulica da unidade', tipo: 'Comunicado', data: daysAgoISO(20) },
  { id: 'doc-203-3', unidade: '203', titulo: 'Relatorio de atendimento - Vazamento', tipo: 'Relatorio', data: daysAgoISO(8) },
  { id: 'doc-101-1', unidade: '101', titulo: 'Contrato de Locacao - Apto 101', tipo: 'Contrato', data: daysAgoISO(90) },
];

const SEED_SOLIC: SolicitacaoServico[] = [
  {
    id: 'sol-203-1', protocolo: '2026-000123', unidade: '203', tipo: 'Reparo hidraulico',
    aberturaEm: daysAgoISO(10), status: 'em_andamento', atualizadoEm: daysAgoISO(2),
    descricao: 'Vazamento na tubulacao da pia da cozinha.',
  },
  {
    id: 'sol-203-2', protocolo: '2026-000098', unidade: '203', tipo: 'Manutencao de fechadura',
    aberturaEm: daysAgoISO(30), status: 'concluida', atualizadoEm: daysAgoISO(25),
    descricao: 'Troca da fechadura da porta principal.',
  },
  {
    id: 'sol-101-1', protocolo: '2026-000110', unidade: '101', tipo: 'Reparo eletrico',
    aberturaEm: daysAgoISO(5), status: 'aberta', atualizadoEm: daysAgoISO(5),
  },
];

const SEED_MANUT: ManutencaoUnidade[] = [
  { id: 'man-203-1', unidade: '203', data: daysAgoISO(2), descricao: 'Reparo de vazamento na pia da cozinha', categoria: 'hidraulica', status: 'em_andamento', responsavel: 'Joao Tecnico' },
  { id: 'man-203-2', unidade: '203', data: daysAgoISO(25), descricao: 'Troca de fechadura da porta principal', categoria: 'fechadura', status: 'concluida', responsavel: 'Carlos Serralheiro' },
  { id: 'man-203-3', unidade: '203', data: daysAgoISO(60), descricao: 'Substituicao de disjuntor do quadro da unidade', categoria: 'eletrica', status: 'concluida', responsavel: 'Eletrica Predial LTDA' },
  { id: 'man-101-1', unidade: '101', data: daysAgoISO(15), descricao: 'Manutencao da porta de entrada', categoria: 'porta', status: 'concluida', responsavel: 'Joao Tecnico' },
];

export interface MoradorDashboardData {
  documentos: DocumentoUnidade[];
  solicitacoes: SolicitacaoServico[];
  manutencoes: ManutencaoUnidade[];
  comunicados: Aviso[];
}

/** Le e filtra os dados do painel para a unidade do morador. */
export function useMoradorDashboard(unidadeUsuario: string | undefined): MoradorDashboardData {
  const [docs] = useLocalStorage<DocumentoUnidade[]>(DOCS_KEY, SEED_DOCS);
  const [solic] = useLocalStorage<SolicitacaoServico[]>(SOLIC_KEY, SEED_SOLIC);
  const [manut] = useLocalStorage<ManutencaoUnidade[]>(MANUT_KEY, SEED_MANUT);
  const [avisosRaw] = useLocalStorage<Aviso[]>('wave_avisos_v2', []);

  const unidade = normalizeUnidade(unidadeUsuario);

  const documentos = useMemo(
    () =>
      docs
        .filter((d) => normalizeUnidade(d.unidade) === unidade)
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    [docs, unidade],
  );

  const solicitacoes = useMemo(
    () =>
      solic
        .filter((s) => normalizeUnidade(s.unidade) === unidade)
        .sort((a, b) => (a.aberturaEm < b.aberturaEm ? 1 : -1)),
    [solic, unidade],
  );

  const manutencoes = useMemo(
    () =>
      manut
        .filter((m) => normalizeUnidade(m.unidade) === unidade)
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    [manut, unidade],
  );

  // Comunicados do condominio: urgentes no topo (sortAvisos ja garante isso).
  const comunicados = useMemo(() => sortAvisos(normalizeAvisos(avisosRaw)), [avisosRaw]);

  return { documentos, solicitacoes, manutencoes, comunicados };
}
