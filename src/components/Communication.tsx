import { useState } from 'react';
import { MessageSquare, Calendar, Plus, User, Clock, MapPin, CheckCircle, X, AlertCircle, Mail } from 'lucide-react';

import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from 'sonner';
import { ReservasCalendar } from './ReservasCalendar';

export interface Aviso {
  id: string;
  tipo: 'urgente' | 'info' | 'evento' | 'manutencao';
  titulo: string;
  conteudo: string;
  autor: string;
  dataPublicacao: Date;
  comentariosAtivos: boolean;
  comentarios?: Comentario[];
  enviarEmail?: boolean;
  dataEvento?: string;
  horarioEvento?: string;
  localEvento?: string;
}

interface Comentario {
  id: string;
  autor: string;
  conteudo: string;
  data: Date;
}

interface Reserva {
  id: string;
  espaco: 'salao' | 'churrasqueira' | 'quadra';
  data: string;
  horario: string;
  solicitante: string;
  status: 'pendente' | 'aprovada' | 'recusada';
  observacoes?: string;
}

export function Communication() {
  const [activeTab, setActiveTab] = useState<'avisos' | 'reservas'>('avisos');
  const [showCreateAvisoModal, setShowCreateAvisoModal] = useState(false);
  const [showCreateReservaModal, setShowCreateReservaModal] = useState(false);
  const [selectedAviso, setSelectedAviso] = useState<Aviso | null>(null);
  const [comentarioTexto, setComentarioTexto] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [tipoAvisoSelecionado, setTipoAvisoSelecionado] = useState<Aviso['tipo']>('info');

  const [avisos, setAvisos] = useLocalStorage<Aviso[]>('wave_avisos', [
    {
      id: '1',
      tipo: 'urgente',
      titulo: 'Manutenção Programada do Elevador A',
      conteudo: 'O elevador A passará por manutenção preventiva obrigatória no dia 20/07/2026 das 8h às 17h. Por favor, utilizem o elevador B durante este período.',
      autor: 'Síndico João Silva',
      dataPublicacao: new Date('2026-07-10'),
      comentariosAtivos: true,
      comentarios: [
        {
          id: 'c1',
          autor: 'Maria Santos - Apto 302',
          conteudo: 'Obrigada pelo aviso! Vou programar minhas atividades.',
          data: new Date('2026-07-10T10:30:00')
        }
      ]
    },
    {
      id: '2',
      tipo: 'evento',
      titulo: 'Confraternização de Fim de Ano',
      conteudo: 'Convite para todos os moradores! Nossa confraternização anual será no dia 23/12/2026 às 19h no salão de festas. Haverá ceia e amigo secreto (valor sugerido: R$ 50).',
      autor: 'Comissão de Eventos',
      dataPublicacao: new Date('2026-07-05'),
      comentariosAtivos: true,
      comentarios: [],
      dataEvento: '2026-12-23',
      horarioEvento: '19:00',
      localEvento: 'Salão de festas'
    },
    {
      id: '3',
      tipo: 'info',
      titulo: 'Novos Horários da Coleta Seletiva',
      conteudo: 'A partir de janeiro/2026, a coleta seletiva passará a ser realizada às terças e quintas-feiras. Lembre-se de separar corretamente seus resíduos.',
      autor: 'Síndico João Silva',
      dataPublicacao: new Date('2026-07-01'),
      comentariosAtivos: false
    }
  ]);

  const [reservas, setReservas] = useLocalStorage<Reserva[]>('wave_reservas', [
    {
      id: 'r1',
      espaco: 'salao',
      data: '25/12/2025',
      horario: '14:00 - 22:00',
      solicitante: 'Carlos Mendes - Apto 504',
      status: 'aprovada',
      observacoes: 'Festa de Natal familiar'
    },
    {
      id: 'r2',
      espaco: 'churrasqueira',
      data: '28/12/2025',
      horario: '12:00 - 18:00',
      solicitante: 'Ana Paula - Apto 201',
      status: 'pendente',
      observacoes: 'Aniversário'
    },
    {
      id: 'r3',
      espaco: 'quadra',
      data: '30/12/2025',
      horario: '16:00 - 20:00',
      solicitante: 'Pedro Lima - Apto 103',
      status: 'aprovada'
    }
  ]);

  const getTipoAvisoBadge = (tipo: string) => {
    switch (tipo) {
      case 'urgente':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Urgente
        </span>;
      case 'evento':
        return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Evento
        </span>;
      case 'manutencao':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">Manutenção</span>;
      default:
        return <span className="px-3 py-1 bg-wave-100 text-wave-600 rounded-full text-xs">Informação</span>;
    }
  };

  const getStatusReservaBadge = (status: string) => {
    switch (status) {
      case 'aprovada':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Aprovada
        </span>;
      case 'recusada':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">Recusada</span>;
      default:
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pendente
        </span>;
    }
  };

  const getEspacoNome = (espaco: string) => {
    const espacos: Record<string, string> = {
      'salao': 'Salão de Festas',
      'churrasqueira': 'Churrasqueira',
      'quadra': 'Quadra Poliesportiva'
    };
    return espacos[espaco] || espaco;
  };

  const handleAdicionarComentario = () => {
    if (!selectedAviso || !comentarioTexto.trim()) return;

    const novoComentario: Comentario = {
      id: `c${Date.now()}`,
      autor: 'Você - Apto 401',
      conteudo: comentarioTexto,
      data: new Date()
    };

    const avisosAtualizados = avisos.map(aviso =>
      aviso.id === selectedAviso.id
        ? { ...aviso, comentarios: [...(aviso.comentarios || []), novoComentario] }
        : aviso
    );

    setAvisos(avisosAtualizados);
    setSelectedAviso({
      ...selectedAviso,
      comentarios: [...(selectedAviso.comentarios || []), novoComentario]
    });
    setComentarioTexto('');
    toast.success('Comentário adicionado!');
  };

  const handleCreateReserva = (novaReserva: Omit<Reserva, 'id' | 'status'>) => {
    const reserva: Reserva = {
      ...novaReserva,
      id: `r${Date.now()}`,
      status: 'pendente'
    };
    setReservas([reserva, ...reservas]);
    setShowCreateReservaModal(false);
    toast.success('Solicitação de reserva enviada!', {
      description: 'Aguarde aprovação do síndico.'
    });
  };

  const handleCreateAviso = (novoAviso: Omit<Aviso, 'id' | 'dataPublicacao'>) => {
    const aviso: Aviso = {
      ...novoAviso,
      id: `av${Date.now()}`,
      dataPublicacao: new Date()
    };
    
    setAvisos([aviso, ...avisos]);
    setShowCreateAvisoModal(false);
    setTipoAvisoSelecionado('info');
    
    if (novoAviso.enviarEmail) {
      toast.success('Aviso publicado e emails enviados!', {
        description: 'Todos os moradores cadastrados foram notificados por email.'
      });
    } else {
      toast.success('Aviso publicado com sucesso!');
    }
  };

  const handleAprovarReserva = (reservaId: string) => {
    setReservas(reservas.map(r =>
      r.id === reservaId ? { ...r, status: 'aprovada' } : r
    ));
    toast.success('Reserva aprovada!', {
      description: 'O solicitante foi notificado por email.'
    });
  };

  const handleRecusarReserva = (reservaId: string) => {
    setReservas(reservas.map(r =>
      r.id === reservaId ? { ...r, status: 'recusada' } : r
    ));
    toast.info('Reserva recusada', {
      description: 'O solicitante foi notificado por email.'
    });
  };

  return (
    <div className="p-8 bg-gradient-to-br from-wave-700 to-wave-500 min-h-screen relative">
      

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-wave-800 text-3xl mb-2">Comunicação</h1>
          <p className="text-wave-500">Avisos, eventos e reservas de espaços</p>
        </div>
        <button
          onClick={() => activeTab === 'avisos' ? setShowCreateAvisoModal(true) : setShowCreateReservaModal(true)}
          className="px-4 py-3 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'avisos' ? 'Novo Aviso' : 'Nova Reserva'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-wave-100 mb-6 shadow-lg relative z-10 flex gap-2">
        <button
          onClick={() => setActiveTab('avisos')}
          className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'avisos'
              ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
              : 'bg-transparent text-wave-500 hover:bg-wave-50'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          Avisos ({avisos.length})
        </button>
        <button
          onClick={() => setActiveTab('reservas')}
          className={`flex-1 px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'reservas'
              ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
              : 'bg-transparent text-wave-500 hover:bg-wave-50'
          }`}
        >
          <Calendar className="w-5 h-5" />
          Reservas ({reservas.length})
        </button>
      </div>

      {/* Avisos Tab */}
      {activeTab === 'avisos' && (
        <div className="space-y-4 relative z-10">
          {avisos.map((aviso) => (
            <div
              key={aviso.id}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                aviso.tipo === 'urgente' ? 'border-red-300' : 'border-wave-100'
              }`}
              onClick={() => setSelectedAviso(aviso)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-wave-800 text-lg">{aviso.titulo}</h3>
                    {getTipoAvisoBadge(aviso.tipo)}
                  </div>
                  <p className="text-wave-600 mb-3">{aviso.conteudo}</p>
                  <div className="flex items-center gap-4 text-sm text-wave-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {aviso.autor}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(aviso.dataPublicacao).toLocaleDateString('pt-BR')}
                    </span>
                    {aviso.tipo === 'evento' && aviso.dataEvento && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-purple-600">
                          <Calendar className="w-4 h-4" />
                          Evento em {aviso.dataEvento.split('-').reverse().join('/')}
                          {aviso.horarioEvento ? ` às ${aviso.horarioEvento}` : ''}
                        </span>
                      </>
                    )}
                    {aviso.comentariosAtivos && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {aviso.comentarios?.length || 0} comentários
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {aviso.comentariosAtivos && (
                <button className="w-full mt-4 py-2 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all">
                  Ver Detalhes e Comentar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reservas Tab */}
      {activeTab === 'reservas' && (
        <div className="space-y-6 relative z-10">
          {/* Calendar View */}
          <ReservasCalendar
            reservas={reservas}
            currentDate={new Date()}
            onDateSelect={(date) => setSelectedDate(date)}
          />

          {/* Lista de Reservas */}
          <div>
            <h3 className="text-wave-800 text-xl mb-4">Todas as Reservas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reservas.map((reserva) => (
                <div
                  key={reserva.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 shadow-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-wave-500" />
                        <h3 className="text-wave-800 text-lg">{getEspacoNome(reserva.espaco)}</h3>
                      </div>
                      <div className="space-y-2 text-sm text-wave-500">
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {reserva.data}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {reserva.horario}
                        </p>
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {reserva.solicitante}
                        </p>
                        {reserva.observacoes && (
                          <p className="text-wave-600 italic mt-2">"{reserva.observacoes}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-wave-100">
                    {getStatusReservaBadge(reserva.status)}
                    {reserva.status === 'pendente' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRecusarReserva(reserva.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm"
                        >
                          Recusar
                        </button>
                        <button
                          onClick={() => handleAprovarReserva(reserva.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm"
                        >
                          Aprovar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Aviso */}
      {selectedAviso && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-wave-800 text-2xl">{selectedAviso.titulo}</h2>
              <button
                onClick={() => setSelectedAviso(null)}
                className="text-wave-500 hover:text-wave-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-4">
              {getTipoAvisoBadge(selectedAviso.tipo)}
            </div>

            {selectedAviso.tipo === 'evento' && selectedAviso.dataEvento && (
              <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-wrap gap-4 text-sm text-purple-800">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {selectedAviso.dataEvento.split('-').reverse().join('/')}
                </span>
                {selectedAviso.horarioEvento && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {selectedAviso.horarioEvento}
                  </span>
                )}
                {selectedAviso.localEvento && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {selectedAviso.localEvento}
                  </span>
                )}
              </div>
            )}

            <p className="text-wave-700 mb-6">{selectedAviso.conteudo}</p>

            <div className="flex items-center gap-4 text-sm text-wave-500 mb-6 pb-6 border-b border-wave-100">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {selectedAviso.autor}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(selectedAviso.dataPublicacao).toLocaleDateString('pt-BR')}
              </span>
            </div>

            {selectedAviso.comentariosAtivos && (
              <div>
                <h3 className="text-wave-800 mb-4">Comentários ({selectedAviso.comentarios?.length || 0})</h3>
                
                <div className="space-y-4 mb-6">
                  {selectedAviso.comentarios?.map((comentario) => (
                    <div key={comentario.id} className="bg-wave-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-wave-500" />
                        <span className="text-sm text-wave-800">{comentario.autor}</span>
                        <span className="text-xs text-wave-500">
                          • {new Date(comentario.data).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(comentario.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-wave-700">{comentario.conteudo}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={comentarioTexto}
                    onChange={(e) => setComentarioTexto(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    className="flex-1 px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdicionarComentario()}
                  />
                  <button
                    onClick={handleAdicionarComentario}
                    className="px-6 py-3 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Criar Reserva */}
      {showCreateReservaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-wave-800 text-2xl">Nova Reserva</h2>
              <button
                onClick={() => setShowCreateReservaModal(false)}
                className="text-wave-500 hover:text-wave-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateReserva({
                  espaco: formData.get('espaco') as any,
                  data: formData.get('data') as string,
                  horario: formData.get('horario') as string,
                  solicitante: 'Você - Apto 401',
                  observacoes: formData.get('observacoes') as string
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-wave-800 mb-2">Espaço</label>
                <select
                  name="espaco"
                  required
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                >
                  <option value="salao">Salão de Festas</option>
                  <option value="churrasqueira">Churrasqueira</option>
                  <option value="quadra">Quadra Poliesportiva</option>
                </select>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Data</label>
                <input
                  type="date"
                  name="data"
                  required
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Horário</label>
                <input
                  type="text"
                  name="horario"
                  placeholder="Ex: 14:00 - 20:00"
                  required
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Observações (opcional)</label>
                <textarea
                  name="observacoes"
                  rows={3}
                  placeholder="Motivo da reserva, número de pessoas, etc."
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateReservaModal(false)}
                  className="flex-1 py-3 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg"
                >
                  Solicitar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar Aviso */}
      {showCreateAvisoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-wave-800 text-2xl">Novo Aviso</h2>
              <button
                onClick={() => {
                  setShowCreateAvisoModal(false);
                  setTipoAvisoSelecionado('info');
                }}
                className="text-wave-500 hover:text-wave-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleCreateAviso({
                  tipo: formData.get('tipo') as any,
                  titulo: formData.get('titulo') as string,
                  conteudo: formData.get('conteudo') as string,
                  autor: 'Síndico João Silva',
                  comentariosAtivos: formData.get('comentarios') === 'on',
                  enviarEmail: formData.get('enviarEmail') === 'on',
                  dataEvento: (formData.get('dataEvento') as string) || undefined,
                  horarioEvento: (formData.get('horarioEvento') as string) || undefined,
                  localEvento: (formData.get('localEvento') as string) || undefined,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-wave-800 mb-2">Tipo de Aviso</label>
                <select
                  name="tipo"
                  required
                  value={tipoAvisoSelecionado}
                  onChange={(e) => setTipoAvisoSelecionado(e.target.value as Aviso['tipo'])}
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                >
                  <option value="info">Informação</option>
                  <option value="urgente">Urgente</option>
                  <option value="evento">Evento</option>
                  <option value="manutencao">Manutenção</option>
                </select>
              </div>

              <div>
                <label className="block text-wave-800 mb-2">Título</label>
                <input
                  type="text"
                  name="titulo"
                  required
                  placeholder="Ex: Manutenção no Elevador"
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800"
                />
              </div>

              {tipoAvisoSelecionado === 'evento' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
                  <p className="text-purple-800 text-xs font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Detalhes do evento
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-wave-700 text-sm mb-1.5">Data do evento</label>
                      <input
                        type="date"
                        name="dataEvento"
                        required
                        className="w-full px-3 py-2 bg-white border border-wave-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-wave-700 text-sm mb-1.5">Horário (opcional)</label>
                      <input
                        type="time"
                        name="horarioEvento"
                        className="w-full px-3 py-2 bg-white border border-wave-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-wave-700 text-sm mb-1.5">Local (opcional)</label>
                    <input
                      type="text"
                      name="localEvento"
                      placeholder="Ex: Salão de festas"
                      className="w-full px-3 py-2 bg-white border border-wave-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-wave-800 mb-2">Conteúdo</label>
                <textarea
                  name="conteudo"
                  rows={4}
                  required
                  placeholder="Descreva o aviso..."
                  className="w-full px-4 py-3 bg-wave-50 border border-wave-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-wave-300 text-wave-800 resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="comentarios"
                  id="comentarios"
                  defaultChecked
                  className="w-4 h-4 text-wave-500 rounded"
                />
                <label htmlFor="comentarios" className="text-wave-800 text-sm">
                  Permitir comentários
                </label>
              </div>

              <div className="flex items-center gap-2 bg-wave-50 p-3 rounded-xl">
                <input
                  type="checkbox"
                  name="enviarEmail"
                  id="enviarEmail"
                  defaultChecked
                  className="w-4 h-4 text-wave-500 rounded"
                />
                <label htmlFor="enviarEmail" className="text-wave-800 text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Enviar email para todos os moradores
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAvisoModal(false);
                    setTipoAvisoSelecionado('info');
                  }}
                  className="flex-1 py-3 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg"
                >
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
