// ---------------------------------------------------------------------------
// src/components/communication/reservas/useReservas.ts
//
// Camada de acesso a dados do fluxo de Reservas (fase localStorage).
//
// Isola TODA a persistencia e os efeitos (notificacoes / e-mail mock) num
// unico hook. Na fase de banco, o corpo aqui vira chamadas a server actions
// com RBAC (requireManager) — os componentes de UI nao mudam.
//
// Chaves versionadas: o formato mudou em relacao ao mock anterior
// (data ISO + horarios separados + status/rejeicao), entao usamos _v2 para
// nao colidir com 'wave_reservas' antigo.
// ---------------------------------------------------------------------------

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';

import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { useNotifications } from '../../../hooks/useNotifications';
import type { Bloqueio, EspacoId, Reserva, SolicitarReservaInput } from './types';
import { ESPACOS } from './constants';
import { formatData, sortReservas } from './reservaUtils';

const RESERVAS_KEY = 'wave_reservas_v2';
const BLOQUEIOS_KEY = 'wave_bloqueios';

function uid(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const SEED_RESERVAS: Reserva[] = [
  {
    id: 'res-seed-1',
    espaco: 'salao',
    data: '2026-08-15',
    horarioInicio: '18:00',
    horarioFim: '23:00',
    solicitanteId: 'morador-demo',
    solicitante: 'Carlos Mendes - Apto 504',
    status: 'aprovada',
    observacoes: 'Festa de aniversario',
    criadaEm: '2026-07-10T12:00:00.000Z',
    decididaEm: '2026-07-11T09:00:00.000Z',
  },
  {
    id: 'res-seed-2',
    espaco: 'churrasqueira',
    data: '2026-08-22',
    horarioInicio: '12:00',
    horarioFim: '18:00',
    solicitanteId: 'morador-demo',
    solicitante: 'Ana Paula - Apto 201',
    status: 'pendente',
    observacoes: 'Almoco de familia',
    criadaEm: '2026-07-16T14:30:00.000Z',
  },
];

const SEED_BLOQUEIOS: Bloqueio[] = [
  {
    id: 'blq-seed-1',
    espaco: 'quadra',
    data: '2026-08-10',
    motivo: 'Manutencao do piso',
    criadoPor: 'Sindico Joao Silva',
    criadoEm: '2026-07-05T10:00:00.000Z',
  },
];

export interface UseReservasResult {
  reservas: Reserva[];
  bloqueios: Bloqueio[];
  solicitarReserva: (input: SolicitarReservaInput, solicitanteId: string, solicitante: string) => Reserva;
  aprovarReserva: (id: string) => void;
  rejeitarReserva: (id: string, motivo: string) => void;
  cancelarReserva: (id: string) => void;
  bloquearData: (espaco: EspacoId | 'todos', data: string, motivo: string | undefined, autor: string) => void;
  liberarData: (bloqueioId: string) => void;
}

export function useReservas(): UseReservasResult {
  const [reservasRaw, setReservas] = useLocalStorage<Reserva[]>(RESERVAS_KEY, SEED_RESERVAS);
  const [bloqueios, setBloqueios] = useLocalStorage<Bloqueio[]>(BLOQUEIOS_KEY, SEED_BLOQUEIOS);
  const { addNotification } = useNotifications();

  const reservas = useMemo(() => sortReservas(reservasRaw), [reservasRaw]);

  const solicitarReserva = useCallback(
    (input: SolicitarReservaInput, solicitanteId: string, solicitante: string): Reserva => {
      const nova: Reserva = {
        id: uid('res'),
        espaco: input.espaco,
        data: input.data,
        horarioInicio: input.horarioInicio,
        horarioFim: input.horarioFim,
        solicitanteId,
        solicitante,
        status: 'pendente',
        observacoes: input.observacoes,
        criadaEm: new Date().toISOString(),
      };
      setReservas((prev) => [nova, ...prev]);

      const espacoLabel = ESPACOS[input.espaco].label;
      // Notificacao in-app para acompanhamento do Sindico.
      addNotification({
        type: 'reservation',
        title: 'Nova solicitacao de reserva',
        message: `${solicitante} solicitou ${espacoLabel} em ${formatData(input.data)}.`,
        priority: 'high',
        actionUrl: 'communication',
        metadata: { reservaId: nova.id },
      });
      // Ack ao morador (solicitacao recebida) + mock de e-mail ao Sindico.
      toast.success('Solicitacao de reserva enviada!', {
        description: 'O sindico foi notificado por e-mail. Voce sera avisado quando houver decisao.',
      });
      return nova;
    },
    [setReservas, addNotification],
  );

  const aprovarReserva = useCallback(
    (id: string): void => {
      let alvo: Reserva | undefined;
      setReservas((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          alvo = r;
          return { ...r, status: 'aprovada', decididaEm: new Date().toISOString(), motivoRejeicao: undefined };
        }),
      );
      if (!alvo) return;
      const espacoLabel = ESPACOS[alvo.espaco].label;
      addNotification({
        type: 'reservation',
        title: 'Reserva aprovada',
        message: `Sua reserva do ${espacoLabel} em ${formatData(alvo.data)} foi aprovada.`,
        priority: 'medium',
        actionUrl: 'communication',
        metadata: { reservaId: alvo.id },
      });
      toast.success('Reserva aprovada!', {
        description: 'O morador foi notificado. A data foi bloqueada automaticamente.',
      });
    },
    [setReservas, addNotification],
  );

  const rejeitarReserva = useCallback(
    (id: string, motivo: string): void => {
      const motivoLimpo = motivo.trim();
      let alvo: Reserva | undefined;
      setReservas((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          alvo = r;
          return { ...r, status: 'rejeitada', motivoRejeicao: motivoLimpo, decididaEm: new Date().toISOString() };
        }),
      );
      if (!alvo) return;
      const espacoLabel = ESPACOS[alvo.espaco].label;
      addNotification({
        type: 'reservation',
        title: 'Reserva rejeitada',
        message: `Sua reserva do ${espacoLabel} em ${formatData(alvo.data)} foi rejeitada. Motivo: ${motivoLimpo}`,
        priority: 'high',
        actionUrl: 'communication',
        metadata: { reservaId: alvo.id },
      });
      toast.info('Reserva rejeitada', { description: 'O morador foi notificado com o motivo informado.' });
    },
    [setReservas, addNotification],
  );

  const cancelarReserva = useCallback(
    (id: string): void => {
      setReservas((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'cancelada', canceladaEm: new Date().toISOString() } : r,
        ),
      );
      toast.info('Reserva cancelada', { description: 'A data foi liberada para novas solicitacoes.' });
    },
    [setReservas],
  );

  const bloquearData = useCallback(
    (espaco: EspacoId | 'todos', data: string, motivo: string | undefined, autor: string): void => {
      const bloqueio: Bloqueio = {
        id: uid('blq'),
        espaco,
        data,
        motivo: motivo?.trim() || undefined,
        criadoPor: autor,
        criadoEm: new Date().toISOString(),
      };
      setBloqueios((prev) => [bloqueio, ...prev]);
      toast.success('Data bloqueada', {
        description: 'Os moradores nao poderao solicitar reservas nesta data.',
      });
    },
    [setBloqueios],
  );

  const liberarData = useCallback(
    (bloqueioId: string): void => {
      setBloqueios((prev) => prev.filter((b) => b.id !== bloqueioId));
      toast.success('Data liberada', { description: 'A data voltou a ficar disponivel para reservas.' });
    },
    [setBloqueios],
  );

  return {
    reservas,
    bloqueios,
    solicitarReserva,
    aprovarReserva,
    rejeitarReserva,
    cancelarReserva,
    bloquearData,
    liberarData,
  };
}
