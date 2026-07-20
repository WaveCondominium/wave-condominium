'use client';

import { Calendar, Clock, User, MessageSquareWarning } from 'lucide-react';

import type { Reserva } from './types';
import { ESPACOS } from './constants';
import { formatData, formatHorario } from './reservaUtils';
import { StatusReservaBadge } from './StatusReservaBadge';

interface ReservaCardProps {
  reserva: Reserva;
  /** Gestor (Sindico/Admin): pode aprovar/rejeitar pendentes. */
  canManage: boolean;
  /** O usuario atual e o solicitante desta reserva. */
  isOwner: boolean;
  onAprovar: (r: Reserva) => void;
  onRejeitar: (r: Reserva) => void;
  onCancelar: (r: Reserva) => void;
}

/** Card de uma reserva com status, detalhes e acoes conforme papel. */
export function ReservaCard({
  reserva,
  canManage,
  isOwner,
  onAprovar,
  onRejeitar,
  onCancelar,
}: ReservaCardProps) {
  const meta = ESPACOS[reserva.espaco];
  const { Icon } = meta;

  const podeGerirPendente = canManage && reserva.status === 'pendente';
  const podeCancelar = isOwner && (reserva.status === 'pendente' || reserva.status === 'aprovada');

  return (
    <article className="rounded-2xl border border-wave-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${meta.accentClass}`} aria-hidden="true" />
          <h4 className="text-wave-800">{meta.label}</h4>
        </div>
        <StatusReservaBadge status={reserva.status} />
      </div>

      <div className="space-y-1.5 text-sm text-wave-500">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden="true" />
          {formatData(reserva.data)}
        </p>
        <p className="flex items-center gap-2">
          <Clock className="h-4 w-4" aria-hidden="true" />
          {formatHorario(reserva.horarioInicio, reserva.horarioFim)}
        </p>
        <p className="flex items-center gap-2">
          <User className="h-4 w-4" aria-hidden="true" />
          {reserva.solicitante}
        </p>
        {reserva.observacoes && <p className="mt-2 italic text-wave-600">&quot;{reserva.observacoes}&quot;</p>}
      </div>

      {reserva.status === 'rejeitada' && reserva.motivoRejeicao && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <MessageSquareWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Motivo da rejeicao:</strong> {reserva.motivoRejeicao}
          </span>
        </div>
      )}

      {(podeGerirPendente || podeCancelar) && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-wave-100 pt-4">
          {podeCancelar && (
            <button
              onClick={() => onCancelar(reserva)}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-200"
            >
              Cancelar
            </button>
          )}
          {podeGerirPendente && (
            <>
              <button
                onClick={() => onRejeitar(reserva)}
                className="rounded-lg bg-red-100 px-3 py-1.5 text-sm text-red-700 transition-colors hover:bg-red-200"
              >
                Rejeitar
              </button>
              <button
                onClick={() => onAprovar(reserva)}
                className="rounded-lg bg-green-100 px-3 py-1.5 text-sm text-green-700 transition-colors hover:bg-green-200"
              >
                Aprovar
              </button>
            </>
          )}
        </div>
      )}
    </article>
  );
}
