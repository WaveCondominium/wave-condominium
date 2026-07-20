'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Ban } from 'lucide-react';

import type { Bloqueio, DiaStatus, EspacoId, Reserva } from './types';
import { ESPACO_OPTIONS, ESPACOS } from './constants';
import { dateKey, getDiaStatus, hasPendente, todayKey } from './reservaUtils';

interface ReservaCalendarProps {
  espaco: EspacoId;
  onEspacoChange: (espaco: EspacoId) => void;
  reservas: Reserva[];
  bloqueios: Bloqueio[];
  /** Clique num dia nao-passado. O painel decide a acao conforme o papel. */
  onDayClick: (data: string, status: DiaStatus) => void;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const CELL_STYLES: Record<DiaStatus, string> = {
  disponivel: 'bg-white border-green-200 text-wave-800 hover:bg-green-50 hover:border-green-300 cursor-pointer',
  reservada: 'bg-purple-50 border-purple-300 text-purple-700 cursor-pointer',
  bloqueada: 'bg-slate-100 border-slate-300 text-slate-400 cursor-pointer',
  passado: 'bg-transparent border-transparent text-slate-300 cursor-default',
};

/**
 * Calendario de disponibilidade de um espaco. Destaca datas disponiveis,
 * reservadas e bloqueadas; emite onDayClick para dias nao-passados.
 */
export function ReservaCalendar({
  espaco,
  onEspacoChange,
  reservas,
  bloqueios,
  onDayClick,
}: ReservaCalendarProps) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = todayKey();

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const goPrev = () => setViewDate(new Date(year, month - 1, 1));
  const goNext = () => setViewDate(new Date(year, month + 1, 1));

  const cells: Array<{ day: number; data: string; status: DiaStatus; pendente: boolean } | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const data = dateKey(year, month, d);
    cells.push({
      day: d,
      data,
      status: getDiaStatus(data, espaco, reservas, bloqueios),
      pendente: hasPendente(data, espaco, reservas),
    });
  }

  return (
    <div className="rounded-2xl border border-wave-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      {/* Seletor de espaco */}
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Selecionar espaco">
        {ESPACO_OPTIONS.map((id) => {
          const meta = ESPACOS[id];
          const active = id === espaco;
          const { Icon } = meta;
          return (
            <button
              key={id}
              role="tab"
              aria-selected={active}
              onClick={() => onEspacoChange(id)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm transition-all ${
                active
                  ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow'
                  : 'bg-wave-50 text-wave-600 hover:bg-wave-100'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{meta.label}</span>
            </button>
          );
        })}
      </div>

      {/* Navegacao de mes */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          aria-label="Mes anterior"
          className="rounded-lg p-2 text-wave-600 transition-colors hover:bg-wave-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-wave-800">
          {MONTHS[month]} {year}
        </h3>
        <button
          onClick={goNext}
          aria-label="Proximo mes"
          className="rounded-lg p-2 text-wave-600 transition-colors hover:bg-wave-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Cabecalho de dias da semana */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-xs font-medium text-wave-400">
            {w}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} />;
          const isToday = cell.data === today;
          const clickable = cell.status !== 'passado';
          return (
            <button
              key={cell.data}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onDayClick(cell.data, cell.status)}
              aria-label={`${cell.day} — ${cell.status}`}
              className={`relative flex min-h-[38px] flex-col items-center justify-center rounded-lg border text-sm transition-colors ${CELL_STYLES[cell.status]} ${
                isToday ? 'ring-2 ring-wave-400' : ''
              }`}
            >
              <span>{cell.day}</span>
              {cell.status === 'bloqueada' && <Ban className="mt-0.5 h-3 w-3" aria-hidden="true" />}
              {cell.status === 'disponivel' && cell.pendente && (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-400"
                  title="Solicitacao pendente"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-4 flex flex-wrap gap-4 border-t border-wave-100 pt-4 text-xs text-wave-500">
        <LegendItem className="border-green-300 bg-white" label="Disponivel" />
        <LegendItem className="border-purple-300 bg-purple-50" label="Reservada" />
        <LegendItem className="border-slate-300 bg-slate-100" label="Bloqueada" />
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Pendente
        </span>
      </div>
    </div>
  );
}

function LegendItem({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded border ${className}`} />
      {label}
    </span>
  );
}
