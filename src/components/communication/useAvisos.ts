// ---------------------------------------------------------------------------
// src/components/communication/useAvisos.ts
//
// Camada de acesso a dados dos Avisos (fase localStorage).
//
// Isola TODA a persistência num único hook, de forma que a UI não conheça a
// origem dos dados. Quando o backend/DB entrar (fase 2), basta trocar o corpo
// deste hook por chamadas a server actions — nenhum componente muda.
//
// A chave é versionada (`_v2`) porque o formato do registro mudou (tipo ->
// categoria + prioridade). Assim não colidimos com dados do formato antigo.
// ---------------------------------------------------------------------------

import { useCallback, useMemo } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import type { Aviso, Comentario, EditarAvisoInput, NovoAvisoInput } from './types';
import { cryptoId, normalizeAvisos, sortAvisos } from './avisoUtils';

const STORAGE_KEY = 'wave_avisos_v2';

const SEED_AVISOS: Aviso[] = [
  {
    id: 'seed-1',
    titulo: 'Manutenção Programada do Elevador A',
    conteudo:
      'O elevador A passará por manutenção preventiva obrigatória no dia 20/07/2026 das 8h às 17h. Por favor, utilizem o elevador B durante este período.',
    categoria: 'elevador',
    prioridade: 'urgente',
    autor: 'Síndico João Silva',
    dataPublicacao: '2026-07-10T09:00:00.000Z',
    comentariosAtivos: true,
    comentarios: [
      {
        id: 'seed-c1',
        autor: 'Maria Santos - Apto 302',
        conteudo: 'Obrigada pelo aviso! Vou programar minhas atividades.',
        data: '2026-07-10T10:30:00.000Z',
      },
    ],
  },
  {
    id: 'seed-2',
    titulo: 'Interrupção no Fornecimento de Água',
    conteudo:
      'A concessionária realizará manutenção na rede no dia 19/07/2026 das 9h às 12h. Recomendamos reservar água para uso essencial durante o período.',
    categoria: 'agua',
    prioridade: 'alta',
    autor: 'Síndico João Silva',
    dataPublicacao: '2026-07-08T13:00:00.000Z',
    comentariosAtivos: true,
    comentarios: [],
  },
  {
    id: 'seed-3',
    titulo: 'Confraternização de Fim de Ano',
    conteudo:
      'Convite para todos os moradores! Nossa confraternização anual será no dia 23/12/2026 às 19h no salão de festas. Haverá ceia e amigo secreto (valor sugerido: R$ 50).',
    categoria: 'evento',
    prioridade: 'normal',
    autor: 'Síndico João Silva',
    dataPublicacao: '2026-07-05T18:00:00.000Z',
    comentariosAtivos: true,
    comentarios: [],
    dataEvento: '2026-12-23',
    horarioEvento: '19:00',
    localEvento: 'Salão de festas',
  },
  {
    id: 'seed-4',
    titulo: 'Nova Escala de Coleta Seletiva',
    conteudo:
      'A partir de agosto/2026 a coleta seletiva passará a ser realizada às terças e quintas-feiras. Lembre-se de separar corretamente seus resíduos.',
    categoria: 'comunicado',
    prioridade: 'normal',
    autor: 'Síndico João Silva',
    dataPublicacao: '2026-07-01T12:00:00.000Z',
    comentariosAtivos: false,
    comentarios: [],
  },
];

export interface UseAvisosResult {
  /** Já ordenados (urgente no topo + cronológico). */
  avisos: Aviso[];
  criarAviso: (input: NovoAvisoInput, autor: string) => Aviso;
  editarAviso: (input: EditarAvisoInput) => void;
  excluirAviso: (id: string) => void;
  adicionarComentario: (avisoId: string, autor: string, conteudo: string) => Comentario | null;
}

export function useAvisos(): UseAvisosResult {
  const [raw, setRaw] = useLocalStorage<Aviso[]>(STORAGE_KEY, SEED_AVISOS);

  // Normaliza defensivamente a cada render barato (memoizado) — protege contra
  // dados corrompidos/legados e garante formato íntegro para a UI.
  const avisos = useMemo(() => sortAvisos(normalizeAvisos(raw)), [raw]);

  const criarAviso = useCallback(
    (input: NovoAvisoInput, autor: string): Aviso => {
      const novo: Aviso = {
        ...input,
        id: cryptoId(),
        autor,
        dataPublicacao: new Date().toISOString(),
        comentarios: input.comentariosAtivos ? [] : undefined,
      };
      setRaw((prev) => [novo, ...normalizeAvisos(prev)]);
      return novo;
    },
    [setRaw],
  );

  const editarAviso = useCallback(
    (input: EditarAvisoInput): void => {
      setRaw((prev) =>
        normalizeAvisos(prev).map((a) => (a.id === input.id ? { ...a, ...input } : a)),
      );
    },
    [setRaw],
  );

  const excluirAviso = useCallback(
    (id: string): void => {
      setRaw((prev) => normalizeAvisos(prev).filter((a) => a.id !== id));
    },
    [setRaw],
  );

  const adicionarComentario = useCallback(
    (avisoId: string, autor: string, conteudo: string): Comentario | null => {
      const texto = conteudo.trim();
      if (!texto) return null;
      const comentario: Comentario = {
        id: cryptoId(),
        autor,
        conteudo: texto,
        data: new Date().toISOString(),
      };
      setRaw((prev) =>
        normalizeAvisos(prev).map((a) =>
          a.id === avisoId
            ? { ...a, comentarios: [...(a.comentarios ?? []), comentario] }
            : a,
        ),
      );
      return comentario;
    },
    [setRaw],
  );

  return { avisos, criarAviso, editarAviso, excluirAviso, adicionarComentario };
}
