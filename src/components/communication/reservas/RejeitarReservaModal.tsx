'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import type { Reserva } from './types';
import { ESPACOS } from './constants';
import { formatData } from './reservaUtils';

interface RejeitarReservaModalProps {
  reserva: Reserva;
  onClose: () => void;
  onConfirm: (motivo: string) => void;
}

/**
 * Modal do sindico para rejeitar uma reserva. O motivo e OBRIGATORIO e sera
 * enviado ao morador junto com a notificacao (regra de negocio 4).
 */
export function RejeitarReservaModal({ reserva, onClose, onConfirm }: RejeitarReservaModalProps) {
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motivo.trim()) {
      setErro('Informe o motivo da rejeicao. Ele sera enviado ao morador.');
      return;
    }
    onConfirm(motivo.trim());
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Rejeitar reserva"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-wave-800">Rejeitar Reserva</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-wave-500 hover:text-wave-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <p className="mb-4 text-sm text-wave-500">
          {ESPACOS[reserva.espaco].label} • {formatData(reserva.data)} • {reserva.solicitante}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="motivo" className="mb-2 block text-sm text-wave-800">
              Motivo da rejeicao <span className="text-red-500">*</span>
            </label>
            <textarea
              id="motivo"
              rows={4}
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                if (erro) setErro(null);
              }}
              placeholder="Ex: espaco reservado para manutencao nesta data."
              className="w-full resize-none rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
              autoFocus
            />
            {erro && (
              <p role="alert" className="mt-1.5 text-xs text-red-600">
                {erro}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-wave-100 py-2.5 text-wave-600 transition-colors hover:bg-wave-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-red-600 py-2.5 text-white transition-colors hover:bg-red-700"
            >
              Rejeitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
