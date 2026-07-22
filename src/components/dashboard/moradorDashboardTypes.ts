// ---------------------------------------------------------------------------
// src/components/dashboard/moradorDashboardTypes.ts
//
// Modelo por unidade do Dashboard do Morador. Isolado dos modulos globais
// (Documentos/Manutencao) — aqui os registros carregam a unidade, permitindo
// exibir ao morador APENAS o que pertence ao seu apartamento (spec).
//
// Datas em ISO 8601. Sem dependencia de React/DOM.
// ---------------------------------------------------------------------------

/** Status compartilhado por solicitacoes e manutencoes da unidade. */
export type StatusOcorrencia = 'aberta' | 'em_andamento' | 'concluida' | 'cancelada';

export interface DocumentoUnidade {
  id: string;
  unidade: string;
  titulo: string;
  /** Contrato, Comunicado, Relatorio, Documento... */
  tipo: string;
  /** ISO 8601 */
  data: string;
}

export interface SolicitacaoServico {
  id: string;
  protocolo: string;
  unidade: string;
  tipo: string;
  /** ISO 8601 — data de abertura. */
  aberturaEm: string;
  status: StatusOcorrencia;
  /** ISO 8601 — ultima atualizacao. */
  atualizadoEm: string;
  descricao?: string;
}

export interface ManutencaoUnidade {
  id: string;
  unidade: string;
  /** ISO 8601 */
  data: string;
  descricao: string;
  /** hidraulica, eletrica, vazamento, porta, fechadura, outros */
  categoria: string;
  status: StatusOcorrencia;
  responsavel: string;
}

export const STATUS_OCORRENCIA_LABEL: Record<StatusOcorrencia, string> = {
  aberta: 'Aberta',
  em_andamento: 'Em andamento',
  concluida: 'Concluida',
  cancelada: 'Cancelada',
};

/**
 * Normaliza a unidade para comparacao, removendo prefixos comuns e separadores
 * para que 'Apto 203', 'apto 203' e '203' sejam equivalentes.
 */
export function normalizeUnidade(unidade: string | undefined | null): string {
  return (unidade ?? '')
    .toLowerCase()
    .replace(/\b(apartamento|apto|apt|ap|unidade|un|bloco|bl)\b/g, '')
    .replace(/[^0-9a-z]/g, '');
}
