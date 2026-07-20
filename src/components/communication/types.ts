// ---------------------------------------------------------------------------
// src/components/communication/types.ts
//
// Modelo de dados da aba Comunicação (Avisos).
//
// Decisão de modelagem: a versão anterior conflava um único campo `tipo`
// (urgente | info | evento | manutencao) que misturava DOIS conceitos
// distintos — categoria do assunto e nível de prioridade. As regras de
// negócio da aba separam explicitamente:
//   - Categoria: sobre o QUE é o aviso (elevador, água, energia, obras...).
//   - Prioridade: QUÃO importante ele é (Urgente, Alta, Normal).
// Separar os dois elimina ambiguidade na ordenação e no destaque visual.
//
// Datas são persistidas como string ISO 8601. localStorage serializa via
// JSON, que converte Date -> string na escrita mas NÃO reidrata na leitura;
// guardar string desde a origem remove essa inconsistência silenciosa.
// ---------------------------------------------------------------------------

/** Nível de prioridade do aviso. Só `urgente` altera a ordenação (vai ao topo). */
export type Prioridade = 'urgente' | 'alta' | 'normal';

/**
 * Categorias oficiais de comunicação do condomínio.
 * Refletem os assuntos que impactam o dia a dia dos moradores.
 */
export type CategoriaAviso =
  | 'elevador'      // Manutenção de elevadores
  | 'agua'          // Interrupção no fornecimento de água
  | 'energia'       // Falta de energia em áreas comuns
  | 'obras'         // Obras e reformas
  | 'caixa_dagua'   // Limpeza de caixas d'água
  | 'dedetizacao'   // Dedetização
  | 'seguranca'     // Avisos de segurança
  | 'evento'        // Eventos
  | 'comunicado';   // Comunicados oficiais

export interface Comentario {
  id: string;
  autor: string;
  conteudo: string;
  /** ISO 8601 */
  data: string;
}

export interface Aviso {
  id: string;
  titulo: string;
  /** Descrição / corpo do aviso. */
  conteudo: string;
  categoria: CategoriaAviso;
  prioridade: Prioridade;
  /** Nome do responsável pela publicação (Síndico). */
  autor: string;
  /** ISO 8601 — data e hora da publicação. */
  dataPublicacao: string;

  // Campos opcionais específicos de eventos.
  dataEvento?: string;
  horarioEvento?: string;
  localEvento?: string;

  // Interação.
  comentariosAtivos: boolean;
  comentarios?: Comentario[];
  enviarEmail?: boolean;
}

/** Payload aceito ao criar um aviso — o hook preenche id/dataPublicacao/autor. */
export type NovoAvisoInput = Omit<Aviso, 'id' | 'dataPublicacao' | 'autor'>;

/** Payload aceito ao editar — id obrigatório, demais campos parciais. */
export type EditarAvisoInput = Partial<Omit<Aviso, 'id' | 'dataPublicacao' | 'autor'>> & {
  id: string;
};
