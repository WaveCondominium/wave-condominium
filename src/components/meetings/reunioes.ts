// ---------------------------------------------------------------------------
// src/components/meetings/reunioes.ts
//
// Modelo de aplicação e lógica PURA das Reuniões (migração p/ banco, SÍN-026).
// Sem React/DOM nem imports de servidor — testável no Vitest.
//
// O tipo de aplicação mantém a mesma forma que o módulo já usava (localStorage),
// para minimizar mudanças na UI. As Server Actions mapeiam o enum do Prisma
// (AGENDADA/EM_ANDAMENTO/CONCLUIDA) de/para estes rótulos-string.
// ---------------------------------------------------------------------------

export type StatusReuniao = 'scheduled' | 'ongoing' | 'completed';

export const STATUS_REUNIAO_LABEL: Record<StatusReuniao, string> = {
  scheduled: 'Agendada',
  ongoing: 'Ao Vivo',
  completed: 'Concluída',
};

export interface Reuniao {
  id: string;
  title: string;
  description: string;
  /** 'YYYY-MM-DD' */
  date: string;
  /** 'HH:mm' */
  time: string;
  /** minutos */
  duration: number;
  meetLink: string;
  status: StatusReuniao;
  /** Confirmados — derivado da contagem de confirmações (não é armazenado). */
  participants: number;
  maxParticipants: number;
  agenda: string[];
  createdBy: string;
  createdAt: string;
  /** Ata oficial + código de integridade (MOR-033). */
  ataContent?: string;
  ataHash?: string;
  recordingUrl?: string;
}

export interface NovaReuniaoInput {
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  meetLink: string;
  maxParticipants: number;
  agenda: string[];
}

/** Valida os campos obrigatórios de uma nova reunião. Msg de erro ou null. */
export function validarNovaReuniao(input: Partial<NovaReuniaoInput>): string | null {
  if (!input.title || !input.title.trim()) return 'Informe o título da reunião.';
  if (!input.description || !input.description.trim()) return 'Informe a descrição da reunião.';
  if (!input.date) return 'Informe a data da reunião.';
  if (!input.time) return 'Informe o horário da reunião.';
  const pauta = (input.agenda ?? []).filter((i) => i && i.trim());
  if (pauta.length === 0) return 'Inclua ao menos um item de pauta.';
  return null;
}
