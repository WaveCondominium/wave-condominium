import { 
  AlertTriangle, 
  CheckCircle, 
  Wrench,
  Shield,
  DollarSign,
  Users,
  FileText,
  Vote,
  Calendar,
  Activity,
  Bell
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  status: 'scheduled' | 'ongoing' | 'completed';
}

interface Proposal {
  id: string;
  title: string;
  daysLeft: number;
  status: string;
}

interface DashboardProps {
  onViewProposal: (proposalId: string) => void;
  onNavigate?: (view: string) => void;
}

export function Dashboard({ onViewProposal, onNavigate }: DashboardProps) {
  const [meetings] = useLocalStorage<Meeting[]>('wave_meetings', []);
  const [proposals] = useLocalStorage<Proposal[]>('wave_proposals', []);

  // Próximas reuniões agendadas (ordenadas por data)
  const upcomingMeetings = meetings
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map(m => ({
      title: m.title,
      date: new Date(m.date).toLocaleDateString('pt-BR'),
      type: 'assembly',
      status: 'scheduled',
      time: m.time,
    }));

  // Propostas ativas em votação
  const activeProposals = proposals
    .filter(p => p.status === 'active')
    .slice(0, 2);
  const healthMetrics = [
    {
      title: 'Saúde Financeira',
      value: '92%',
      status: 'good',
      icon: DollarSign,
      description: 'Saldo: R$ 127.450,00',
      detail: 'Inadimplência: 8%'
    },
    {
      title: 'Manutenções Críticas',
      value: '2',
      status: 'warning',
      icon: Wrench,
      description: 'Requerem atenção',
      detail: 'Garantias próximas do vencimento'
    },
    {
      title: 'Conformidade',
      value: '100%',
      status: 'good',
      icon: Shield,
      description: 'AVCB e Seguros',
      detail: 'Documentação em dia'
    },
    {
      title: 'Participação',
      value: '78%',
      status: 'good',
      icon: Users,
      description: 'Última assembleia',
      detail: 'Quórum atingido'
    }
  ];

  const criticalAlerts = [
    {
      id: '1',
      type: 'warning',
      title: 'Garantia da Bomba D\'água vence em 28 dias',
      action: 'Abrir OS de Vistoria',
      priority: 'high',
      date: '30 dias'
    },
    {
      id: '2',
      type: 'info',
      title: 'Assembleia: Instalação de Painéis Solares',
      action: 'Votar Agora',
      priority: 'medium',
      date: '5 dias restantes'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Uso de Fundo de Reserva detectado',
      action: 'Verificar Autorização',
      priority: 'high',
      date: 'Hoje'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Assembleia Ordinária',
      date: '15/01/2026',
      type: 'assembly',
      status: 'scheduled'
    },
    {
      title: 'Vistoria Anual Elevadores',
      date: '20/01/2026',
      type: 'maintenance',
      status: 'pending'
    },
    {
      title: 'Renovação AVCB',
      date: '10/02/2026',
      type: 'compliance',
      status: 'scheduled'
    }
  ];

  const recentActivity = [
    {
      type: 'vote',
      description: 'Proposta "Painéis Solares" recebeu 12 novos votos',
      time: '2h atrás',
      icon: Vote
    },
    {
      type: 'payment',
      description: 'Despesa: Conta de Luz - R$ 3.245,00',
      time: '5h atrás',
      icon: DollarSign
    },
    {
      type: 'document',
      description: 'Ata da Assembleia de Nov/2025 publicada',
      time: '1 dia atrás',
      icon: FileText
    },
    {
      type: 'maintenance',
      description: 'OS #234 concluída - Reparo Interfone',
      time: '2 dias atrás',
      icon: Wrench
    }
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'good') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    return <Activity className="w-4 h-4 text-wave-400" />;
  };

  const getAlertBorder = (type: string) => {
    if (type === 'warning') return 'border-l-amber-400';
    if (type === 'critical') return 'border-l-red-400';
    return 'border-l-wave-400';
  };

  return (
    <div className="p-8 min-h-screen bg-wave-50">

      {/* Header */}
      <div className="mb-8">
        <p className="text-wave-400 text-sm italic font-serif mb-1">Visão geral</p>
        <h1 className="font-serif text-3xl text-wave-800 font-normal">Residencial Aurora</h1>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-2xl border border-wave-100 p-5 hover:border-wave-300 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-wave-50">
                  <Icon className="w-4 h-4 text-wave-500" />
                </div>
                {getStatusIcon(metric.status)}
              </div>
              <p className="text-wave-400 text-xs mb-1">{metric.title}</p>
              <p className="font-serif text-2xl text-wave-800 font-normal leading-none mb-1">{metric.value}</p>
              <p className="text-wave-400 text-xs italic font-serif">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Alertas e Próximos Eventos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Alertas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-wave-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-wave-400 text-xs italic font-serif">Atenção necessária</p>
              <h2 className="font-serif text-lg text-wave-800 font-normal">Alertas</h2>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs">
              {criticalAlerts.length} pendentes
            </span>
          </div>
          <div className="space-y-3">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 ${getAlertBorder(alert.type)} pl-4 py-3 bg-wave-50 rounded-r-xl`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-wave-700 text-sm font-medium mb-1">{alert.title}</p>
                    <p className="text-wave-400 text-xs italic font-serif">{alert.date}</p>
                  </div>
                  {alert.priority === 'high' && (
                    <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded text-xs flex-shrink-0 ml-2">
                      urgente
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (alert.id === '1') onNavigate?.('maintenance');
                    else if (alert.id === '2') onNavigate?.('governance');
                    else if (alert.id === '3') onNavigate?.('treasury');
                  }}
                  className="mt-3 px-3 py-1.5 bg-wave-500 text-white rounded-lg text-xs hover:bg-wave-600 transition-colors"
                >
                  {alert.action}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Próximos eventos */}
        <div className="bg-white rounded-2xl border border-wave-100 p-6">
          <div className="mb-5">
            <p className="text-wave-400 text-xs italic font-serif">Agenda</p>
            <h2 className="font-serif text-lg text-wave-800 font-normal">Próximos eventos</h2>
          </div>
          <div className="space-y-4">
            {upcomingMeetings.length === 0 && activeProposals.length === 0 ? (
              <p className="text-wave-400 text-sm italic font-serif text-center py-6">Nenhum evento agendado</p>
            ) : (
              <>
                {upcomingMeetings.map((event, index) => (
                  <div key={`meeting-${index}`} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-wave-50 border border-wave-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-wave-500" />
                    </div>
                    <div>
                      <p className="text-wave-700 text-sm font-medium leading-tight">{event.title}</p>
                      <p className="text-wave-400 text-xs italic font-serif mt-0.5">{event.date} às {event.time}</p>
                    </div>
                  </div>
                ))}
                {activeProposals.map((p, index) => (
                  <div key={`proposal-${index}`} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-wave-50 border border-wave-100 flex items-center justify-center flex-shrink-0">
                      <Vote className="w-4 h-4 text-wave-500" />
                    </div>
                    <div>
                      <p className="text-wave-700 text-sm font-medium leading-tight">{p.title}</p>
                      <p className="text-wave-400 text-xs italic font-serif mt-0.5">Votação · {p.daysLeft} dias restantes</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Atividade recente */}
      <div className="bg-white rounded-2xl border border-wave-100 p-6 mb-8">
        <div className="mb-5">
          <p className="text-wave-400 text-xs italic font-serif">Histórico</p>
          <h2 className="font-serif text-lg text-wave-800 font-normal">Atividade recente</h2>
        </div>
        <div className="divide-y divide-wave-50">
          {recentActivity.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <div key={index} className="flex items-center gap-4 py-3">
                <div className="w-8 h-8 rounded-lg bg-wave-50 border border-wave-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-wave-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-wave-700 text-sm truncate">{activity.description}</p>
                </div>
                <p className="text-wave-400 text-xs italic font-serif flex-shrink-0">{activity.time}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Nova proposta',    icon: Vote,     action: 'governance' },
          { label: 'Abrir OS',         icon: Wrench,   action: 'maintenance' },
          { label: 'Ver documentos',   icon: FileText, action: 'documents' },
          { label: 'Registro Stellar', icon: Shield, action: 'blockchain' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate?.(item.action)}
              className="p-4 bg-white rounded-xl border border-wave-100 hover:border-wave-300 hover:bg-wave-50 transition-all text-left"
            >
              <Icon className="w-5 h-5 text-wave-400 mb-2" />
              <p className="text-wave-600 text-sm">{item.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

}
