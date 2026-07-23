'use client';

// ---------------------------------------------------------------------------
// src/components/communication/reservas/useReservas.ts
//
// Camada de dados das Reservas — agora sobre PostgreSQL via Server Actions.
//
// Persistencia e regras (escopo por condominio, conflito, permissoes) rodam no
// servidor. As notificacoes in-app + toasts continuam no cliente. A UI
// (ReservasPanel/calendario) permanece igual.
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useNotifications } from '../../../hooks/useNotifications';
import type { Bloqueio, EspacoId, Reserva, SolicitarReservaInput } from './types';
import { ESPACOS } from './constants';
import { formatData, sortReservas } from './reservaUtils';
import {
  listReservasAction,
  solicitarReservaAction,
  aprovarReservaAction,
  rejeitarReservaAction,
  cancelarReservaAction,
  bloquearDataAction,
  liberarDataAction,
} from '@/app/actions/reservas';

export interface UseReservasResult {
  reservas: Reserva[];
  bloqueios: Bloqueio[];
  loading: boolean;
  solicitarReserva: (input: SolicitarReservaInput, solicitanteId: string, solicitante: string) => Promise<void>;
  aprovarReserva: (id: string) => Promise<void>;
  rejeitarReserva: (id: string, motivo: string) => Promise<void>;
  cancelarReserva: (id: string) => Promise<void>;
  bloquearData: (espaco: EspacoId | 'todos', data: string, motivo: string | undefined, autor: string) => Promise<void>;
  liberarData: (bloqueioId: string) => Promise<void>;
}

export function useReservas(): UseReservasResult {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const refresh = useCallback(async () => {
    const { reservas: rs, bloqueios: bs } = await listReservasAction();
    setReservas(sortReservas(rs));
    setBloqueios(bs);
  }, []);

  useEffect(() => {
    let alive = true;
    refresh()
      .catch((err) => console.error('Falha ao carregar reservas', err))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [refresh]);

  const solicitarReserva = useCallback(
    async (input: SolicitarReservaInput, _solicitanteId: string, solicitante: string) => {
      const nova = await solicitarReservaAction(input, solicitante);
      if (!nova) {
        toast.error('Espaco indisponivel', {
          description: 'Ja existe reserva aprovada ou bloqueio nesta data.',
        });
        return;
      }
      await refresh();
      const espacoLabel = ESPACOS[input.espaco].label;
      addNotification({
        type: 'reservation',
        title: 'Nova solicitacao de reserva',
        message: `${solicitante} solicitou ${espacoLabel} em ${formatData(input.data)}.`,
        priority: 'high',
        actionUrl: 'communication',
        metadata: { reservaId: nova.id },
      });
      toast.success('Solicitacao de reserva enviada!', {
        description: 'O sindico foi notificado. Voce sera avisado quando houver decisao.',
      });
    },
    [refresh, addNotification],
  );

  const aprovarReserva = useCallback(
    async (id: string) => {
      const alvo = reservas.find((r) => r.id === id);
      const res = await aprovarReservaAction(id);
      if (!res.ok) {
        toast.error('Nao foi possivel aprovar a reserva.');
        return;
      }
      await refresh();
      if (alvo) {
        addNotification({
          type: 'reservation',
          title: 'Reserva aprovada',
          message: `Sua reserva do ${ESPACOS[alvo.espaco].label} em ${formatData(alvo.data)} foi aprovada.`,
          priority: 'medium',
          actionUrl: 'communication',
          metadata: { reservaId: alvo.id },
        });
      }
      toast.success('Reserva aprovada!', {
        description: 'O morador foi notificado. A data foi bloqueada automaticamente.',
      });
    },
    [reservas, refresh, addNotification],
  );

  const rejeitarReserva = useCallback(
    async (id: string, motivo: string) => {
      const alvo = reservas.find((r) => r.id === id);
      const res = await rejeitarReservaAction(id, motivo);
      if (!res.ok) {
        toast.error('Nao foi possivel rejeitar a reserva.');
        return;
      }
      await refresh();
      if (alvo) {
        addNotification({
          type: 'reservation',
          title: 'Reserva rejeitada',
          message: `Sua reserva do ${ESPACOS[alvo.espaco].label} em ${formatData(alvo.data)} foi rejeitada. Motivo: ${motivo.trim()}`,
          priority: 'high',
          actionUrl: 'communication',
          metadata: { reservaId: alvo.id },
        });
      }
      toast.info('Reserva rejeitada', { description: 'O morador foi notificado com o motivo.' });
    },
    [reservas, refresh, addNotification],
  );

  const cancelarReserva = useCallback(
    async (id: string) => {
      const res = await cancelarReservaAction(id);
      if (!res.ok) {
        toast.error('Nao foi possivel cancelar a reserva.');
        return;
      }
      await refresh();
      toast.info('Reserva cancelada', { description: 'A data foi liberada para novas solicitacoes.' });
    },
    [refresh],
  );

  const bloquearData = useCallback(
    async (espaco: EspacoId | 'todos', data: string, motivo: string | undefined, autor: string) => {
      const res = await bloquearDataAction(espaco, data, motivo, autor);
      if (!res.ok) {
        toast.error('Nao foi possivel bloquear a data.');
        return;
      }
      await refresh();
      toast.success('Data bloqueada', {
        description: 'Os moradores nao poderao solicitar reservas nesta data.',
      });
    },
    [refresh],
  );

  const liberarData = useCallback(
    async (bloqueioId: string) => {
      const res = await liberarDataAction(bloqueioId);
      if (!res.ok) {
        toast.error('Nao foi possivel liberar a data.');
        return;
      }
      await refresh();
      toast.success('Data liberada', { description: 'A data voltou a ficar disponivel para reservas.' });
    },
    [refresh],
  );

  return {
    reservas,
    bloqueios,
    loading,
    solicitarReserva,
    aprovarReserva,
    rejeitarReserva,
    cancelarReserva,
    bloquearData,
    liberarData,
  };
}
