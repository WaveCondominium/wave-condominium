'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import type { EspacoId, SolicitarReservaInput } from './types';
import { ESPACO_OPTIONS, ESPACOS } from './constants';
import { formatData, validarHorario } from './reservaUtils';

interface SolicitarReservaModalProps {
  espacoInicial: EspacoId;
  dataInicial: string;
  /** Retorna true se o espaco+dia ja esta indisponivel (reservado/bloqueado). */
  checkConflito: (espaco: EspacoId, data: string) => boolean;
  onClose: () => void;
  onSubmit: (input: SolicitarReservaInput) => void;
}

/** Modal do morador para solicitar reserva de um espaco comum. */
export function SolicitarReservaModal({
  espacoInicial,
  dataInicial,
  checkConflito,
  onClose,
  onSubmit,
}: SolicitarReservaModalProps) {
  const [espaco, setEspaco] = useState<EspacoId>(espacoInicial);
  const [data, setData] = useState(dataInicial);
  const [horarioInicio, setHorarioInicio] = useState('');
  const [horarioFim, setHorarioFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const conflito = data ? checkConflito(espaco, data) : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!data) return setErro('Selecione uma data.');
    if (conflito) return setErro('Este espaco ja esta reservado ou bloqueado nesta data.');
    const erroHorario = validarHorario(horarioInicio, horarioFim);
    if (erroHorario) return setErro(erroHorario);

    onSubmit({ espaco, data, horarioInicio, horarioFim, observacoes: observacoes.trim() || undefined });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Solicitar reserva"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl text-wave-800">Solicitar Reserva</h2>
          <button onClick={onClose} aria-label="Fechar" className="text-wave-500 hover:text-wave-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="espaco" className="mb-2 block text-sm text-wave-800">
              Espaco
            </label>
            <select
              id="espaco"
              value={espaco}
              onChange={(e) => setEspaco(e.target.value as EspacoId)}
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            >
              {ESPACO_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {ESPACOS[id].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="data" className="mb-2 block text-sm text-wave-800">
              Data
            </label>
            <input
              id="data"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
            {data && conflito && (
              <p className="mt-1.5 text-xs text-red-600">
                {ESPACOS[espaco].label} indisponivel em {formatData(data)}.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="inicio" className="mb-2 block text-sm text-wave-800">
                Inicio
              </label>
              <input
                id="inicio"
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
                className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
              />
            </div>
            <div>
              <label htmlFor="fim" className="mb-2 block text-sm text-wave-800">
                Fim
              </label>
              <input
                id="fim"
                type="time"
                value={horarioFim}
                onChange={(e) => setHorarioFim(e.target.value)}
                className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
              />
            </div>
          </div>

          <div>
            <label htmlFor="obs" className="mb-2 block text-sm text-wave-800">
              Observacoes (opcional)
            </label>
            <textarea
              id="obs"
              rows={3}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Motivo da reserva, numero de pessoas, etc."
              className="w-full resize-none rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          {erro && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {erro}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-wave-100 py-3 text-wave-600 transition-colors hover:bg-wave-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={conflito}
              className="flex-1 rounded-xl bg-gradient-to-r from-wave-700 to-wave-500 py-3 text-white shadow-lg transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Solicitar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
