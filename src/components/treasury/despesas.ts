// ---------------------------------------------------------------------------
// src/components/treasury/despesas.ts
//
// Despesas do condomínio (MOR-52) — fonte de dados e lógica pura.
//
// Contexto: hoje a plataforma só registra RECEITAS (boletos). Não existe um
// módulo/base de despesas. Este módulo introduz uma fonte de despesas
// client-side (demo/seed), no mesmo padrão do restante do protótipo, para
// alimentar a seção "Despesas" do financeiro do Morador. Quando existir
// backend de despesas, troca-se a origem (localStorage → repository/service)
// mantendo a UI e os seletores.
//
// RBAC: o Morador tem acesso SOMENTE LEITURA — a seção que consome estes dados
// (DespesasSection) não possui nenhum controle de criação/edição/exclusão.
// ---------------------------------------------------------------------------

export type CategoriaDespesa =
  | 'Funcionários'
  | 'Manutenção'
  | 'Serviços'
  | 'Limpeza'
  | 'Segurança'
  | 'Energia'
  | 'Água'
  | 'Outras';

/**
 * Origem do recurso usado para pagar a despesa (MOR-054).
 * Regra financeira (a definir): por padrão, descontar do saldo disponível; o
 * Fundo de Reserva só em despesas extraordinárias/autorizadas por governança.
 * Por ora apenas REGISTRAMOS a origem — a dedução efetiva no saldo/fundo é
 * decisão pendente e não é aplicada aqui.
 */
export type OrigemRecurso = 'saldo' | 'fundo_reserva';

export const ORIGEM_RECURSO_LABEL: Record<OrigemRecurso, string> = {
  saldo: 'Saldo disponível',
  fundo_reserva: 'Fundo de Reserva',
};

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  /** Valor em reais (BRL). */
  valor: number;
  /** Data da despesa em ISO 8601 (YYYY-MM-DD) — usada no histórico (MOR-053). */
  data: string;
  /** Origem do recurso utilizado no pagamento (MOR-054). */
  origemRecurso: OrigemRecurso;
  /** Nome do arquivo de comprovante, quando anexado (MOR-054). */
  comprovanteNome?: string;
}

export interface CategoriaResumo {
  categoria: CategoriaDespesa;
  valor: number;
  cor: string;
  /** Participação no total (0–100, arredondada). */
  percentual: number;
}

export const DESPESAS_STORAGE_KEY = 'wave_despesas';

/** Categorias oferecidas no cadastro de despesa (ordem de exibição). */
export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  'Funcionários',
  'Manutenção',
  'Serviços',
  'Limpeza',
  'Segurança',
  'Energia',
  'Água',
  'Outras',
];

/** Cor por categoria — paleta consistente com os gráficos já usados. */
export const CATEGORIA_COR: Record<CategoriaDespesa, string> = {
  Funcionários: '#8b5cf6',
  Manutenção: '#22c55e',
  Serviços: '#3b82f6',
  Limpeza: '#06b6d4',
  Segurança: '#6366f1',
  Energia: '#f59e0b',
  Água: '#0ea5e9',
  Outras: '#94a3b8',
};

/** Dados de demonstração (representam as despesas do período corrente). */
export const DEFAULT_DESPESAS: Despesa[] = [
  { id: 'DESP-001', descricao: 'Folha de pagamento — Portaria/Zeladoria', categoria: 'Funcionários', valor: 18500, data: '2026-08-05', origemRecurso: 'saldo' },
  { id: 'DESP-002', descricao: 'Vigilância patrimonial (contrato)',       categoria: 'Segurança',    valor: 9200,  data: '2026-08-05', origemRecurso: 'saldo' },
  { id: 'DESP-003', descricao: 'Empresa de limpeza (contrato)',            categoria: 'Limpeza',      valor: 8500,  data: '2026-08-08', origemRecurso: 'saldo' },
  { id: 'DESP-004', descricao: 'Manutenção de elevadores',                 categoria: 'Manutenção',   valor: 4300,  data: '2026-08-12', origemRecurso: 'saldo' },
  { id: 'DESP-005', descricao: 'Reforma extraordinária do telhado',        categoria: 'Manutenção',   valor: 2200,  data: '2026-08-15', origemRecurso: 'fundo_reserva' },
  { id: 'DESP-006', descricao: 'Energia elétrica — áreas comuns',          categoria: 'Energia',      valor: 4200,  data: '2026-08-18', origemRecurso: 'saldo' },
  { id: 'DESP-007', descricao: 'Conta de água',                            categoria: 'Água',         valor: 1800,  data: '2026-08-18', origemRecurso: 'saldo' },
  { id: 'DESP-008', descricao: 'Jardinagem e paisagismo',                  categoria: 'Serviços',     valor: 1500,  data: '2026-08-20', origemRecurso: 'saldo' },
  { id: 'DESP-009', descricao: 'Material de escritório e limpeza',         categoria: 'Outras',       valor: 900,   data: '2026-08-22', origemRecurso: 'saldo' },
];

/** Soma o valor total das despesas. */
export function totalDespesas(despesas: Despesa[]): number {
  return despesas.reduce((soma, d) => soma + d.valor, 0);
}

/**
 * Agrupa as despesas por categoria, com valor somado, cor e participação (%)
 * no total. Ordena da maior para a menor. Não muta a entrada.
 */
export function agruparPorCategoria(despesas: Despesa[]): CategoriaResumo[] {
  const total = totalDespesas(despesas);

  const somaPorCategoria = new Map<CategoriaDespesa, number>();
  for (const d of despesas) {
    somaPorCategoria.set(d.categoria, (somaPorCategoria.get(d.categoria) ?? 0) + d.valor);
  }

  return Array.from(somaPorCategoria.entries())
    .map(([categoria, valor]) => ({
      categoria,
      valor,
      cor: CATEGORIA_COR[categoria],
      percentual: total > 0 ? Math.round((valor / total) * 100) : 0,
    }))
    .sort((a, b) => b.valor - a.valor);
}

/** Formata um valor em Real (BRL). */
export function formatBRL(valor: number): string {
  return `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Cadastro de despesa (MOR-054) — apenas perfis administrativos (Síndico/
// Administradora). Validação e montagem são puras (testáveis). A restrição de
// acesso é aplicada na UI (botão/modal só para gestor); quando houver backend,
// a autorização deve ser validada também no servidor.
// ---------------------------------------------------------------------------

export interface NovaDespesaInput {
  categoria: CategoriaDespesa;
  descricao: string;
  valor: number;
  /** Data do pagamento (YYYY-MM-DD). */
  data: string;
  origemRecurso: OrigemRecurso;
  comprovanteNome?: string;
}

/** Valida os campos obrigatórios do cadastro. Retorna a mensagem de erro ou null. */
export function validarNovaDespesa(input: Partial<NovaDespesaInput>): string | null {
  if (!input.descricao || !input.descricao.trim()) return 'Informe a descrição da despesa.';
  if (input.valor == null || Number.isNaN(input.valor) || input.valor <= 0) {
    return 'Informe um valor maior que zero.';
  }
  if (!input.data) return 'Informe a data do pagamento.';
  if (!input.categoria) return 'Selecione a categoria da despesa.';
  if (!input.origemRecurso) return 'Selecione a origem do recurso.';
  return null;
}

/** Monta uma Despesa a partir do input validado. O id é fornecido por quem chama. */
export function montarDespesa(input: NovaDespesaInput, id: string): Despesa {
  return {
    id,
    descricao: input.descricao.trim(),
    categoria: input.categoria,
    valor: input.valor,
    data: input.data,
    origemRecurso: input.origemRecurso,
    comprovanteNome: input.comprovanteNome?.trim() || undefined,
  };
}
