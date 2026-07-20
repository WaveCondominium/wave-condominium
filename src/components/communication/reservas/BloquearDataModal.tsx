'use client';

import { useState } from 'react';
import { X, Ban } from 'lucide-react';

import type { EspacoId } from './types';
import { ESPACO_OPTIONS, ESPACOS } from './constants';
import { todayKey } from './reservaUtils';

interface BloquearDataModalProps {
  espacoInicial: EspacoId;
  dataInicial: string;
  onClose: () => void;
  onConfirm: (espaco: EspacoId | 'todos', data: string, motivo: string | undefined) => void;
}

/** Modal do sindico para bloquear uma data (manutencao, evento interno...). */
export function BloquearDataModal({
  espacoInicial,
  dataInicial,
  onClose,
  onConfirm,
}: BloquearDataModalProps) {
  const [espaco, setEspaco] = useState<EspacoId | 'todos'>(espacoInicial);
  const [data, setData] = useState(dataInicial);
  const [motivo, setMotivo] = useState('');
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return setErro('Selecione a data a bloquear.');
    onConfirm(espaco, data, motivo.trim() || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bloquear data"
      onClick={onClose}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl text-wave-800">
            <Ban className="h-5 w-5 text-slate-500" />
            Bloquear Data
          </h2>
          <button onClick={onClose} aria-label="Fechar" className="text-wave-500 hover:text-wave-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="blq-espaco" className="mb-2 block text-sm text-wave-800">
              Espaco
            </label>
            <select
              id="blq-espaco"
              value={espaco}
              onChange={(e) => setEspaco(e.target.value as EspacoId | 'todos')}
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            >
              <option value="todos">Todos os espacos</option>
              {ESPACO_OPTIONS.map((id) => (
                <option key={id} value={id}>
                  {ESPACOS[id].label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="blq-data" className="mb-2 block text-sm text-wave-800">
              Data
            </label>
            <input
              id="blq-data"
              type="date"
              value={data}
              min={todayKey()}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
            />
          </div>

          <div>
            <label htmlFor="blq-motivo" className="mb-2 block text-sm text-wave-800">
              Motivo (opcional)
            </label>
            <input
              id="blq-motivo"
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ex: manutencao, evento interno, reforma."
              className="w-full rounded-xl border border-wave-200 bg-wave-50 px-4 py-3 text-wave-800 focus:outline-none focus:ring-2 focus:ring-wave-300"
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
              className="flex-1 rounded-xl bg-wave-100 py-2.5 text-wave-600 transition-colors hover:bg-wave-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-slate-700 py-2.5 text-white transition-colors hover:bg-slate-800"
            >
              Bloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
