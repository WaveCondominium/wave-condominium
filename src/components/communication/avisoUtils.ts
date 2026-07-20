// ---------------------------------------------------------------------------
// src/components/communication/avisoUtils.ts
//
// Funções PURAS de ordenação, normalização e formatação de Avisos.
// Sem dependência de React/DOM — fáceis de testar isoladamente.
// ---------------------------------------------------------------------------

import type { Aviso, CategoriaAviso, Prioridade } from './types';

/**
 * Regra de negócio de ordenação:
 *   1. Todo aviso URGENTE aparece no topo, independentemente da data.
 *   2. Os demais (alta/normal) seguem ordem cronológica: mais recente primeiro.
 *   3. Dentro de cada grupo, desempata pela data de publicação (desc).
 *
 * Não muta o array recebido (retorna cópia ordenada).
 */
export function sortAvisos(avisos: Aviso[]): Aviso[] {
  return [...avisos].sort((a, b) => {
    const aUrgente = a.prioridade === 'urgente' ? 1 : 0;
    const bUrgente = b.prioridade === 'urgente' ? 1 : 0;
    if (aUrgente !== bUrgente) return bUrgente - aUrgente; // urgente antes

    // Mais recente primeiro. Datas inválidas vão para o fim.
    const aTime = toTime(a.dataPublicacao);
    const bTime = toTime(b.dataPublicacao);
    return bTime - aTime;
  });
}

function toTime(iso: string): number {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? -Infinity : t;
}

const PRIORIDADES_VALIDAS: Prioridade[] = ['urgente', 'alta', 'normal'];
const CATEGORIAS_VALIDAS: CategoriaAviso[] = [
  'elevador', 'agua', 'energia', 'obras', 'caixa_dagua',
  'dedetizacao', 'seguranca', 'evento', 'comunicado',
];

/**
 * Normaliza um registro possivelmente vindo do formato antigo (campo `tipo`)
 * ou com campos ausentes/ inválidos, garantindo um Aviso íntegro.
 *
 * Compatibilidade com dados legados armazenados sob o modelo anterior:
 *   tipo 'urgente'    -> prioridade urgente,  categoria comunicado
 *   tipo 'evento'     -> prioridade normal,   categoria evento
 *   tipo 'manutencao' -> prioridade alta,     categoria elevador
 *   tipo 'info'/outros-> prioridade normal,   categoria comunicado
 */
export function normalizeAviso(raw: any): Aviso {
  const legadoTipo: string | undefined = raw?.tipo;

  const prioridade: Prioridade = PRIORIDADES_VALIDAS.includes(raw?.prioridade)
    ? raw.prioridade
    : legadoTipo === 'urgente'
      ? 'urgente'
      : legadoTipo === 'manutencao'
        ? 'alta'
        : 'normal';

  const categoria: CategoriaAviso = CATEGORIAS_VALIDAS.includes(raw?.categoria)
    ? raw.categoria
    : legadoTipo === 'evento'
      ? 'evento'
      : legadoTipo === 'manutencao'
        ? 'elevador'
        : 'comunicado';

  const dataPublicacao = toIso(raw?.dataPublicacao);

  const comentarios = Array.isArray(raw?.comentarios)
    ? raw.comentarios.map((c: any) => ({
        id: String(c?.id ?? cryptoId()),
        autor: String(c?.autor ?? 'Anônimo'),
        conteudo: String(c?.conteudo ?? ''),
        data: toIso(c?.data),
      }))
    : [];

  return {
    id: String(raw?.id ?? cryptoId()),
    titulo: String(raw?.titulo ?? 'Sem título'),
    conteudo: String(raw?.conteudo ?? ''),
    categoria,
    prioridade,
    autor: String(raw?.autor ?? 'Síndico'),
    dataPublicacao,
    dataEvento: raw?.dataEvento || undefined,
    horarioEvento: raw?.horarioEvento || undefined,
    localEvento: raw?.localEvento || undefined,
    comentariosAtivos: Boolean(raw?.comentariosAtivos ?? true),
    comentarios,
    enviarEmail: raw?.enviarEmail ?? undefined,
  };
}

export function normalizeAvisos(list: any): Aviso[] {
  if (!Array.isArray(list)) return [];
  return list.map(normalizeAviso);
}

function toIso(value: any): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

/** Gera um id razoavelmente único sem depender de libs externas. */
export function cryptoId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Formata a data de publicação como "18/07/2026 às 14:30". */
export function formatDataHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const data = d.toLocaleDateString('pt-BR');
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${data} às ${hora}`;
}

/** Formata só a data (dd/mm/aaaa). */
export function formatData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

/** Converte "2026-12-23" -> "23/12/2026" para exibição de data de evento. */
export function formatDataEvento(dateStr?: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? parts.reverse().join('/') : dateStr;
}
