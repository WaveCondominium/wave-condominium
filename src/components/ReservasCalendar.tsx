import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, User, CheckCircle } from 'lucide-react';

interface Reserva {
  id: string;
  espaco: 'salao' | 'churrasqueira' | 'quadra';
  data: string;
  horario: string;
  solicitante: string;
  status: 'pendente' | 'aprovada' | 'recusada';
  observacoes?: string;
}

interface ReservasCalendarProps {
  reservas: Reserva[];
  currentDate: Date;
  onDateSelect?: (date: string) => void;
}

export function ReservasCalendar({
  reservas,
  currentDate,
  onDateSelect
}: ReservasCalendarProps) {
  const [viewDate, setViewDate] = useState(currentDate || new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getDaysInMonth(viewDate);

  const previousMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const formatDateKey = (day: number): string => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return date.toLocaleDateString('pt-BR');
  };

  const getReservasForDay = (day: number) => {
    const dateKey = formatDateKey(day);
    return reservas.filter(r => r.data === dateKey && r.status === 'aprovada');
  };

  const getEspacoIcon = (espaco: string) => {
    switch (espaco) {
      case 'salao': return '🎉';
      case 'churrasqueira': return '🍖';
      case 'quadra': return '⚽';
      default: return '📍';
    }
  };

  const getEspacoName = (espaco: string) => {
    switch (espaco) {
      case 'salao': return 'Salão de Festas';
      case 'churrasqueira': return 'Churrasqueira';
      case 'quadra': return 'Quadra Poliesportiva';
      default: return espaco;
    }
  };

  const monthName = viewDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-blue-900 text-xl flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Names */}
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="text-center text-sm text-blue-600 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const reservasDay = getReservasForDay(day);
          const hasReservas = reservasDay.length > 0;
          const isSelected = selectedDay === day;

          return (
            <div
              key={day}
              onClick={() => {
                setSelectedDay(day);
                onDateSelect && onDateSelect(formatDateKey(day));
              }}
              className={`border rounded-lg p-1 transition-all cursor-pointer min-h-[100px] ${
                isSelected
                  ? 'bg-wave-500 border-blue-600 shadow-lg ring-2 ring-blue-400'
                  : hasReservas
                  ? 'bg-wave-100 border-blue-300 hover:shadow-lg'
                  : 'bg-blue-50 border-blue-100 hover:bg-blue-100'
              }`}
            >
              <div className={`text-center text-sm mb-1 ${isSelected ? 'text-white font-bold' : 'text-blue-900 font-semibold'}`}>{day}</div>
              {hasReservas && (
                <div className="space-y-1 px-0.5">
                  {reservasDay.map(r => (
                    <div key={r.id} className={`text-xs rounded p-1 ${isSelected ? 'bg-white/20' : 'bg-white/60'}`}>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{getEspacoIcon(r.espaco)}</span>
                        <span className={`text-[10px] leading-tight ${isSelected ? 'text-white' : 'text-blue-800'}`}>
                          {r.horario.split(' - ')[0]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details */}
      {selectedDay && getReservasForDay(selectedDay).length > 0 && (
        <div className="mt-6 pt-4 border-t border-blue-100">
          <h4 className="text-blue-900 mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Reservas para {formatDateKey(selectedDay)}
          </h4>
          <div className="space-y-3">
            {getReservasForDay(selectedDay).map(reserva => (
              <div 
                key={reserva.id}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getEspacoIcon(reserva.espaco)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-blue-900">{getEspacoName(reserva.espaco)}</h5>
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Aprovada
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{reserva.horario}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{reserva.solicitante}</span>
                      </div>
                      {reserva.observacoes && (
                        <div className="flex items-start gap-2 mt-2 pt-2 border-t border-blue-200">
                          <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                          <span className="text-xs">{reserva.observacoes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-blue-100">
        <h4 className="text-blue-900 mb-3 text-sm">Legenda:</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span>🎉</span>
            <span className="text-blue-700">Salão de Festas</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🍖</span>
            <span className="text-blue-700">Churrasqueira</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⚽</span>
            <span className="text-blue-700">Quadra Poliesportiva</span>
          </div>
        </div>
      </div>
    </div>
  );
}