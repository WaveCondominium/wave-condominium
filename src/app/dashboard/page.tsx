'use client';

import { 
  AlertTriangle, 
  Clock,
  Wrench,
  Shield,
  DollarSign,
  Users,
  FileText,
  Vote,
  Calendar,
  Activity,
  Zap,
  Bell
} from 'lucide-react';

import Link from 'next/link';

export default function DashboardPage() {
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
      link: '/dashboard/maintenance',
      priority: 'high',
      date: '30 dias'
    },
    {
      id: '2',
      type: 'info',
      title: 'Assembleia: Instalação de Painéis Solares',
      action: 'Votar Agora',
      link: '/dashboard/governance',
      priority: 'medium',
      date: '5 dias restantes'
    },
    {
      id: '3',
      type: 'warning',
      title: 'Uso de Fundo de Reserva detectado',
      action: 'Verificar Autorização',
      link: '/dashboard/treasury',
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
      title: 'Vencimento Boleto',
      date: '10/01/2026',
      type: 'financial',
      status: 'pending'
    }
  ];

  return (
    <div className="space-y-8 relative">
      
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h1 className="text-3xl text-wave-800">Visão Geral</h1>
          <p className="text-wave-500">Bem-vindo ao painel de gestão do seu condomínio</p>
        </div>
        
        <div className="flex gap-3">
          <button className="p-2 bg-white rounded-xl shadow-sm border border-wave-100 text-wave-500 hover:bg-wave-50 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="px-4 py-2 bg-white rounded-xl shadow-sm border border-wave-100 text-wave-500 hover:bg-wave-50 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Dezembro 2025</span>
          </button>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-wave-100 shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${
                  metric.status === 'good' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                } group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-2xl font-bold ${
                  metric.status === 'good' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {metric.value}
                </span>
              </div>
              <h3 className="text-wave-800 font-medium mb-1">{metric.title}</h3>
              <p className="text-wave-500 text-sm mb-2">{metric.description}</p>
              <p className="text-wave-400 text-xs">{metric.detail}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Critical Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-xl text-wave-800">Atenção Necessária</h2>
            </div>
            
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-4 bg-wave-50/50 rounded-xl border border-wave-100 hover:border-wave-300 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.priority === 'high' ? 'bg-red-500' : 'bg-orange-500'
                    }`} />
                    <div>
                      <h3 className="text-wave-800 font-medium">{alert.title}</h3>
                      <p className="text-wave-500 text-sm flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {alert.date}
                      </p>
                    </div>
                  </div>
                  <Link 
                    href={alert.link}
                    className="px-4 py-2 bg-white text-wave-500 text-sm rounded-lg border border-wave-200 hover:bg-wave-50 hover:border-wave-300 transition-all shadow-sm"
                  >
                    {alert.action}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Chart Placeholder */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-wave-100 rounded-lg">
                  <Activity className="w-5 h-5 text-wave-500" />
                </div>
                <h2 className="text-xl text-wave-800">Atividade Recente</h2>
              </div>
              <select className="bg-wave-50 border border-wave-200 text-wave-800 text-sm rounded-lg px-3 py-1 outline-none">
                <option>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Este ano</option>
              </select>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-4 pb-2">
              {[40, 70, 45, 90, 60, 80, 50].map((height, i) => (
                <div key={i} className="w-full bg-wave-100 rounded-t-lg relative group overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-wave-700 to-wave-500 transition-all duration-500 group-hover:opacity-80"
                    style={{ height: `${height}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between px-4 mt-2 text-xs text-wave-400">
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-wave-700 to-wave-500 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/dashboard/governance" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center backdrop-blur-sm">
                <Vote className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs">Nova Votação</span>
              </Link>
              <Link href="/dashboard/maintenance" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center backdrop-blur-sm">
                <Wrench className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs">Abrir Chamado</span>
              </Link>
              <Link href="/dashboard/documents" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center backdrop-blur-sm">
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs">Documentos</span>
              </Link>
              <Link href="/dashboard/visitors" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-center backdrop-blur-sm">
                <Users className="w-6 h-6 mx-auto mb-2" />
                <span className="text-xs">Visitantes</span>
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 shadow-sm p-6">
            <h2 className="text-xl text-wave-800 mb-6">Próximos Eventos</h2>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex gap-4 items-start pb-4 border-b border-blue-50 last:border-0 last:pb-0">
                  <div className="flex-shrink-0 w-12 text-center">
                    <span className="block text-xs text-wave-500 uppercase font-bold">
                      {event.date.split('/')[1] === '01' ? 'JAN' : 'DEZ'}
                    </span>
                    <span className="block text-xl text-wave-800 font-bold">
                      {event.date.split('/')[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-wave-800 font-medium text-sm">{event.title}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] mt-1 ${
                      event.type === 'assembly' ? 'bg-purple-100 text-purple-600' :
                      event.type === 'maintenance' ? 'bg-orange-100 text-orange-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {event.type === 'assembly' ? 'Assembleia' : 
                       event.type === 'maintenance' ? 'Manutenção' : 'Financeiro'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
