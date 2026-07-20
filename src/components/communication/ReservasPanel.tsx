'use client';

import { useMemo, useState } from 'react';
import { Plus, Ban, CalendarX2, Inbox } from 'lucide-react';
import { toast } from 'sonner';

import { useUser } from '../../contexts/UserContext';
import { isManager } from '../../lib/rbac';
import type { DiaStatus, EspacoId, Reserva, StatusReserva } from './reservas/types';
import { ESPACOS, STATUS_OPTIONS, STATUS_RESERVA } from './reservas/constants';
import { useReservas } from './reservas/useReservas';
import { findBloqueio, hasConflito, todayKey, formatData } from './reservas/reservaUtils';
import { ReservaCalendar } from './reservas/ReservaCalendar';
import { ReservaCard } from './reservas/ReservaCard';
import { SolicitarReservaModal } from './reservas/SolicitarReservaModal';
import { RejeitarReservaModal } from './reservas/RejeitarReservaModal';
import { BloquearDataModal } from './reservas/BloquearDataModal';

/**
 * Painel de Reservas de espacos comuns.
 * - Morador: solicita reservas, acompanha e cancela as proprias.
 * - Sindico/Admin: gere disponibilidade (bloquear/liberar datas) e aprova ou
 *   rejeita solicitacoes. Ve todas as reservas.
 */
export function ReservasPanel() {
  const { userProfile } = useUser();
  const canManage = isManager(userProfile.role);
  const userId = userProfile.id || 'morador-demo';
  const solicitante = userProfile.name + (userProfile.unit ? ` - ${userProfile.unit}` : '');

  const {
    reservas,
    bloqueios,
    solicitarReserva,
    aprovarReserva,
    rejeitarReserva,
    cancelarReserva,
    bloquearData,
    liberarData,
  } = useReservas();

  const [espaco, setEspaco] = useState<EspacoId>('salao');
  const [filtro, setFiltro] = useState<StatusReserva | 'todas'>('todas');

  const [solicitarModal, setSolicitarModal] = useState<{ espaco: EspacoId; data: string } | null>(null);
  const [bloquearModal, setBloquearModal] = useState<{ espaco: EspacoId; data: string } | null>(null);
  const [rejeitarAlvo, setRejeitarAlvo] = useState<Reserva | null>(null);

  // Sindico ve todas; morador so as proprias.
  const minhasReservas = useMemo(
    () => (canManage ? reservas : reservas.filter((r) => r.solicitanteId === userId)),
    [reservas, canManage, userId],
  );

  const reservasFiltradas = useMemo(
    () => (filtro === 'todas' ? minhasReservas : minhasReservas.filter((r) => r.status === filtro)),
    [minhasReservas, filtro],
  );

  const pendentesCount = useMemo(
    () => minhasReservas.filter((r) => r.status === 'pendente').length,
    [minhasReservas],
  );

  const checkConflito = (esp: EspacoId, data: string) => hasConflito(data, esp, reservas, bloqueios);

  const handleDayClick = (data: string, status: DiaStatus) => {
    if (canManage) {
      if (status === 'disponivel') {
        setBloquearModal({ espaco, data });
      } else if (status === 'bloqueada') {
        const b = findBloqueio(data, espaco, bloqueios);
        if (b) liberarData(b.id);
      } else if (status === 'reservada') {
        toast.info('Data reservada', { description: `${ESPACOS[espaco].label} ja tem reserva aprovada em ${formatData(data)}.` });
      }
      return;
    }
    // Morador
    if (status === 'disponivel') {
      setSolicitarModal({ espaco, data });
    } else {
      toast.info('Data indisponivel', { description: 'Escolha uma data marcada como disponivel.' });
    }
  };

  return (
    <section className="relative z-10 space-y-6">
      {/* Barra de acao */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-wave-600">
          {canManage ? (
            pendentesCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
                <Inbox className="h-4 w-4" />
                {pendentesCount} {pendentesCount === 1 ? 'solicitacao pendente' : 'solicitacoes pendentes'}
              </span>
            ) : (
              'Nenhuma solicitacao pendente'
            )
          ) : (
            'Selecione uma data disponivel no calendario para solicitar.'
          )}
        </div>

        {canManage ? (
          <button
            onClick={() => setBloquearModal({ espaco, data: todayKey() })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm text-white shadow-lg transition-all hover:bg-slate-800"
          >
            <Ban className="h-4 w-4" />
            Bloquear data
          </button>
        ) : (
          <button
            onClick={() => setSolicitarModal({ espaco, data: '' })}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 px-4 py-2.5 text-sm text-white shadow-lg transition-all hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            Solicitar reserva
          </button>
        )}
      </div>

      {/* Calendario de disponibilidade */}
      <ReservaCalendar
        espaco={espaco}
        onEspacoChange={setEspaco}
        reservas={reservas}
        bloqueios={bloqueios}
        onDayClick={handleDayClick}
      />

      {/* Lista de reservas + filtros */}
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl text-wave-800">
            {canManage ? 'Todas as reservas' : 'Minhas reservas'}
          </h3>
          <div className="flex flex-wrap gap-2">
            <FiltroChip label="Todas" active={filtro === 'todas'} onClick={() => setFiltro('todas')} />
            {STATUS_OPTIONS.map((s) => (
              <FiltroChip
                key={s}
                label={STATUS_RESERVA[s].label}
                active={filtro === s}
                onClick={() => setFiltro(s)}
              />
            ))}
          </div>
        </div>

        {reservasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-wave-200 bg-white/70 px-6 py-14 text-center backdrop-blur-sm">
            <CalendarX2 className="mb-3 h-10 w-10 text-wave-300" aria-hidden="true" />
            <p className="text-wave-600">
              {filtro === 'todas'
                ? canManage
                  ? 'Nenhuma reserva registrada ainda.'
                  : 'Voce ainda nao tem reservas. Escolha uma data no calendario.'
                : `Nenhuma reserva ${STATUS_RESERVA[filtro as StatusReserva].label.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {reservasFiltradas.map((r) => (
              <ReservaCard
                key={r.id}
                reserva={r}
                canManage={canManage}
                isOwner={r.solicitanteId === userId}
                onAprovar={(res) => aprovarReserva(res.id)}
                onRejeitar={(res) => setRejeitarAlvo(res)}
                onCancelar={(res) => cancelarReserva(res.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {solicitarModal && (
        <SolicitarReservaModal
          espacoInicial={solicitarModal.espaco}
          dataInicial={solicitarModal.data}
          checkConflito={checkConflito}
          onClose={() => setSolicitarModal(null)}
          onSubmit={(input) => {
            solicitarReserva(input, userId, solicitante || 'Morador');
            setSolicitarModal(null);
          }}
        />
      )}

      {bloquearModal && canManage && (
        <BloquearDataModal
          espacoInicial={bloquearModal.espaco}
          dataInicial={bloquearModal.data}
          onClose={() => setBloquearModal(null)}
          onConfirm={(esp, data, motivo) => {
            bloquearData(esp, data, motivo, userProfile.name || 'Sindico');
            setBloquearModal(null);
          }}
        />
      )}

      {rejeitarAlvo && canManage && (
        <RejeitarReservaModal
          reserva={rejeitarAlvo}
          onClose={() => setRejeitarAlvo(null)}
          onConfirm={(motivo) => {
            rejeitarReserva(rejeitarAlvo.id, motivo);
            setRejeitarAlvo(null);
          }}
        />
      )}
    </section>
  );
}

interface FiltroChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FiltroChip({ label, active, onClick }: FiltroChipProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm transition-all ${
        active ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow' : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
      }`}
    >
      {label}
    </button>
  );
}
