'use client';

// ---------------------------------------------------------------------------
// src/components/dao/useGovernance.ts
//
// Camada de dados da Governanca (fase localStorage). Fonte unica de verdade
// para propostas e votos. Encapsula persistencia, encerramento automatico por
// prazo, voto unico por morador, apuracao e notificacoes in-app.
//
// Chave versionada (wave_proposals_v2) porque o modelo mudou em relacao ao
// formato antigo e incompativel usado antes.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useNotifications } from '../../hooks/useNotifications';
import {
  type Categoria,
  type GovernanceConfig,
  type Proposta,
  type VoteChoice,
  DEFAULT_CONFIG,
  apurar,
  isAprovada,
  isEmVotacao,
  isVotacaoExpirada,
  ordenarFila,
  prazoFrom,
  resolverResultado,
} from './governanceCore';

const PROPOSALS_KEY = 'wave_proposals_v2';
const CONFIG_KEY = 'wave_governance_config';

function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const SEED: Proposta[] = [
  {
    id: 'prop-seed-1',
    titulo: 'Instalacao de Energia Solar',
    descricao: 'Sistema fotovoltaico nas areas comuns para reduzir a conta de energia do condominio.',
    categoria: 'sustentabilidade',
    autor: 'Sindico Joao Silva',
    criadaEm: daysAgoISO(10),
    prazoVotacao: prazoFrom(daysAgoISO(10)),
    status: 'votacao_aberta',
    votos: { 'seed-a': 'aprovo', 'seed-b': 'aprovo', 'seed-c': 'reprovo', 'seed-d': 'abstencao' },
  },
  {
    id: 'prop-seed-2',
    titulo: 'Cameras Inteligentes',
    descricao: 'Upgrade do sistema de seguranca com cameras com reconhecimento e visao noturna.',
    categoria: 'seguranca',
    autor: 'Sindico Joao Silva',
    criadaEm: daysAgoISO(40),
    prazoVotacao: prazoFrom(daysAgoISO(40)),
    status: 'aprovada_comunidade',
    votos: { 'seed-a': 'aprovo', 'seed-b': 'aprovo', 'seed-c': 'aprovo', 'seed-d': 'aprovo', 'seed-e': 'reprovo' },
    encerradaEm: daysAgoISO(10),
    aprovadaEm: daysAgoISO(10),
  },
  {
    id: 'prop-seed-3',
    titulo: 'Reforma da Academia',
    descricao: 'Modernizacao dos equipamentos e do piso da academia do condominio.',
    categoria: 'melhorias',
    autor: 'Maria Santos - Apto 302',
    criadaEm: daysAgoISO(70),
    prazoVotacao: prazoFrom(daysAgoISO(70)),
    status: 'em_execucao',
    votos: { 'seed-a': 'aprovo', 'seed-b': 'aprovo', 'seed-c': 'aprovo', 'seed-d': 'reprovo' },
    encerradaEm: daysAgoISO(40),
    aprovadaEm: daysAgoISO(40),
  },
  {
    id: 'prop-seed-4',
    titulo: 'Pintura da Fachada',
    descricao: 'Repintura completa da fachada e areas externas do predio.',
    categoria: 'obras',
    autor: 'Sindico Joao Silva',
    criadaEm: daysAgoISO(120),
    prazoVotacao: prazoFrom(daysAgoISO(120)),
    status: 'concluida',
    votos: { 'seed-a': 'aprovo', 'seed-b': 'aprovo', 'seed-c': 'aprovo', 'seed-d': 'aprovo' },
    encerradaEm: daysAgoISO(90),
    aprovadaEm: daysAgoISO(90),
  },
  {
    id: 'prop-seed-5',
    titulo: 'Aumento da Taxa de Eventos',
    descricao: 'Proposta para aumentar a taxa de uso do salao de festas em 30%.',
    categoria: 'financeiro',
    autor: 'Carlos Mendes - Apto 504',
    criadaEm: daysAgoISO(45),
    prazoVotacao: prazoFrom(daysAgoISO(45)),
    status: 'rejeitada',
    votos: { 'seed-a': 'reprovo', 'seed-b': 'reprovo', 'seed-c': 'aprovo', 'seed-d': 'reprovo' },
    encerradaEm: daysAgoISO(15),
  },
];

export interface GovernanceStats {
  emVotacao: number;
  aprovadas: number;
  rejeitadas: number;
  totalParticipantes: number;
  taxaParticipacao: number; // 0-100
  ranking: Proposta[]; // top por apoio
}

export interface UseGovernanceResult {
  propostas: Proposta[];
  emVotacao: Proposta[];
  aprovadas: Proposta[];
  fila: Proposta[]; // aprovadas ordenadas por apoio
  config: GovernanceConfig;
  stats: GovernanceStats;
  criarProposta: (input: { titulo: string; descricao: string; categoria: Categoria }, autor: string) => Proposta;
  votar: (propostaId: string, userId: string, escolha: VoteChoice) => 'ok' | 'ja_votou' | 'encerrada';
  encerrarVotacao: (propostaId: string) => void;
  removerProposta: (propostaId: string) => void;
  setTotalMoradores: (n: number) => void;
}

export function useGovernance(): UseGovernanceResult {
  const [raw, setRaw] = useLocalStorage<Proposta[]>(PROPOSALS_KEY, SEED);
  const [config, setConfig] = useLocalStorage<GovernanceConfig>(CONFIG_KEY, DEFAULT_CONFIG);
  const { addNotification } = useNotifications();

  // Encerramento automatico por prazo (spec secao 4): fecha e apura as
  // votacoes expiradas na montagem / quando a lista muda.
  useEffect(() => {
    let mudou = false;
    const atualizadas = raw.map((p) => {
      if (isEmVotacao(p) && isVotacaoExpirada(p)) {
        mudou = true;
        const resultado = resolverResultado(p, config);
        const agora = new Date().toISOString();
        return {
          ...p,
          status: resultado,
          encerradaEm: agora,
          aprovadaEm: resultado === 'aprovada_comunidade' ? agora : undefined,
        };
      }
      return p;
    });
    if (mudou) setRaw(atualizadas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw]);

  const propostas = useMemo(() => raw, [raw]);
  const emVotacao = useMemo(() => propostas.filter(isEmVotacao), [propostas]);
  const aprovadas = useMemo(() => propostas.filter(isAprovada), [propostas]);
  const fila = useMemo(() => ordenarFila(aprovadas), [aprovadas]);

  const stats = useMemo<GovernanceStats>(() => {
    const rejeitadas = propostas.filter((p) => p.status === 'rejeitada').length;
    const votantes = new Set<string>();
    let somaParticipacao = 0;
    let comVotos = 0;
    for (const p of propostas) {
      const ids = Object.keys(p.votos || {});
      ids.forEach((id) => votantes.add(id));
      if (p.status !== 'votacao_aberta' || ids.length > 0) {
        somaParticipacao += config.totalMoradores > 0 ? ids.length / config.totalMoradores : 0;
        comVotos++;
      }
    }
    const taxa = comVotos > 0 ? Math.round((somaParticipacao / comVotos) * 100) : 0;
    return {
      emVotacao: emVotacao.length,
      aprovadas: aprovadas.length,
      rejeitadas,
      totalParticipantes: votantes.size,
      taxaParticipacao: Math.min(100, taxa),
      ranking: ordenarFila(propostas).slice(0, 5),
    };
  }, [propostas, emVotacao.length, aprovadas.length, config.totalMoradores]);

  const criarProposta = useCallback(
    (input: { titulo: string; descricao: string; categoria: Categoria }, autor: string): Proposta => {
      const criadaEm = new Date().toISOString();
      const nova: Proposta = {
        id: uid(),
        titulo: input.titulo.trim(),
        descricao: input.descricao.trim(),
        categoria: input.categoria,
        autor,
        criadaEm,
        prazoVotacao: prazoFrom(criadaEm),
        status: 'votacao_aberta',
        votos: {},
        comentarios: [],
      };
      setRaw((prev) => [nova, ...prev]);
      // Notificacao in-app a todos os moradores (spec secao 3). E-mail e mock.
      addNotification({
        type: 'proposal',
        title: 'Nova proposta disponivel para votacao',
        message: `"${nova.titulo}" esta aberta para votacao. Sua participacao e importante — o prazo e de 30 dias.`,
        priority: 'medium',
        actionUrl: 'governance',
        metadata: { proposalId: nova.id },
      });
      toast.success('Proposta publicada!', {
        description: 'Os moradores foram notificados. A votacao fica aberta por 30 dias.',
      });
      return nova;
    },
    [setRaw, addNotification],
  );

  const votar = useCallback(
    (propostaId: string, userId: string, escolha: VoteChoice): 'ok' | 'ja_votou' | 'encerrada' => {
      const alvo = raw.find((p) => p.id === propostaId);
      if (!alvo) return 'encerrada';
      if (!isEmVotacao(alvo) || isVotacaoExpirada(alvo)) return 'encerrada';
      if (alvo.votos[userId]) return 'ja_votou';
      setRaw((prev) =>
        prev.map((p) => (p.id === propostaId ? { ...p, votos: { ...p.votos, [userId]: escolha } } : p)),
      );
      return 'ok';
    },
    [raw, setRaw],
  );

  const encerrarVotacao = useCallback(
    (propostaId: string) => {
      setRaw((prev) =>
        prev.map((p) => {
          if (p.id !== propostaId || !isEmVotacao(p)) return p;
          const resultado = resolverResultado(p, config);
          const agora = new Date().toISOString();
          return {
            ...p,
            status: resultado,
            encerradaEm: agora,
            aprovadaEm: resultado === 'aprovada_comunidade' ? agora : undefined,
          };
        }),
      );
      const alvo = raw.find((p) => p.id === propostaId);
      if (alvo) {
        const resultado = resolverResultado(alvo, config);
        const { aprovo } = apurar(alvo);
        toast.success('Votacao encerrada', {
          description:
            resultado === 'aprovada_comunidade'
              ? `Aprovada pela comunidade (${aprovo} votos favoraveis).`
              : 'Proposta rejeitada.',
        });
      }
    },
    [raw, setRaw, config],
  );

  const removerProposta = useCallback(
    (propostaId: string) => {
      setRaw((prev) => prev.filter((p) => p.id !== propostaId));
      toast.success('Proposta removida.', {
        description: 'A proposta foi retirada da governanca.',
      });
    },
    [setRaw],
  );

  const setTotalMoradores = useCallback(
    (n: number) => setConfig((c) => ({ ...c, totalMoradores: Math.max(1, Math.round(n)) })),
    [setConfig],
  );

  return {
    propostas, emVotacao, aprovadas, fila, config, stats,
    criarProposta, votar, encerrarVotacao, removerProposta, setTotalMoradores,
  };
}
