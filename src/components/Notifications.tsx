import { Bell, CheckCircle, X, Trash2, Filter, Shield, DollarSign, Vote, FileText, Video, Receipt, Megaphone, CalendarCheck, AlertCircle, Clock } from 'lucide-react';
import { useNotifications, Notification } from '../hooks/useNotifications';

interface NotificationsProps {
  onNavigate?: (view: string) => void;
}

export function Notifications({ onNavigate }: NotificationsProps) {
  const {
    groupedNotifications,
    unreadCount,
    urgentCount,
    filter,
    typeFilter,
    setFilter,
    setTypeFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    clearAll
  } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'blockchain':
        return Shield;
      case 'payment':
        return DollarSign;
      case 'proposal':
        return Vote;
      case 'document':
        return FileText;
      case 'meeting':
        return Video;
      case 'boleto':
        return Receipt;
      case 'announcement':
        return Megaphone;
      case 'reservation':
        return CalendarCheck;
      default:
        return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'blockchain':
        return 'from-green-400 to-emerald-400';
      case 'payment':
        return 'from-wave-700 to-wave-500';
      case 'proposal':
        return 'from-purple-400 to-pink-400';
      case 'document':
        return 'from-orange-400 to-amber-400';
      case 'meeting':
        return 'from-indigo-400 to-wave-700';
      case 'boleto':
        return 'from-teal-400 to-wave-500';
      case 'announcement':
        return 'from-red-400 to-rose-400';
      case 'reservation':
        return 'from-purple-400 to-wave-500';
      default:
        return 'from-slate-400 to-gray-400';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs animate-pulse">
            Urgente
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
            Alta
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 bg-wave-100 text-wave-600 rounded-full text-xs">
            Média
          </span>
        );
      case 'low':
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
            Baixa
          </span>
        );
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      blockchain: 'Stellar',
      payment: 'Pagamento',
      proposal: 'Proposta',
      document: 'Documento',
      meeting: 'Reunião',
      boleto: 'Boleto',
      announcement: 'Comunicado',
      reservation: 'Reserva',
      system: 'Sistema'
    };
    return labels[type] || type;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navegar para a página relacionada se houver
    if (notification.metadata?.proposalId && onNavigate) {
      onNavigate('governance');
    } else if (notification.metadata?.boletoId && onNavigate) {
      onNavigate('boletos');
    } else if (notification.metadata?.meetingId && onNavigate) {
      onNavigate('meetings');
    } else if (notification.metadata?.documentId && onNavigate) {
      onNavigate('documents');
    } else if (notification.metadata?.reservaId && onNavigate) {
      onNavigate('communication');
    } else if (notification.metadata?.blockchainHash && onNavigate) {
      onNavigate('blockchain');
    }
  };

  const totalNotifications = Object.values(groupedNotifications).reduce((sum, group) => sum + group.length, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-wave-700 to-wave-500 min-h-screen relative">
      

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h1 className="text-wave-800 text-2xl sm:text-3xl mb-2 flex items-center gap-3">
              <Bell className="w-8 h-8" />
              Central de Notificações
            </h1>
            <p className="text-wave-500">
              {unreadCount > 0 ? (
                <>
                  Você tem <strong>{unreadCount}</strong> notificação{unreadCount > 1 ? 'ões' : ''} não lida{unreadCount > 1 ? 's' : ''}
                  {urgentCount > 0 && <span className="text-red-600"> ({urgentCount} urgente{urgentCount > 1 ? 's' : ''})</span>}
                </>
              ) : (
                'Todas as notificações foram lidas!'
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Marcar Todas como Lidas
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Excluir Lidas
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              Limpar Tudo
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-wave-500 text-sm">Total</p>
                <p className="text-wave-800 text-2xl">{totalNotifications}</p>
              </div>
              <Bell className="w-8 h-8 text-wave-400" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-100 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm">Não Lidas</p>
                <p className="text-orange-900 text-2xl">{unreadCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-red-100 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm">Urgentes</p>
                <p className="text-red-900 text-2xl">{urgentCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-400 animate-pulse" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-green-100 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm">Stellar</p>
                <p className="text-green-900 text-2xl">
                  {Object.values(groupedNotifications).flat().filter(n => n.type === 'blockchain').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-wave-100 mb-6 shadow-lg relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-wave-500" />
          <span className="text-wave-800">Filtros:</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'unread'
                ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
            }`}
          >
            Não Lidas ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-xl transition-all ${
              filter === 'read'
                ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
            }`}
          >
            Lidas
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all text-sm ${
              typeFilter === 'all'
                ? 'bg-slate-200 text-slate-900'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos os Tipos
          </button>
          {['blockchain', 'payment', 'proposal', 'document', 'meeting', 'boleto', 'announcement', 'reservation'].map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1 rounded-lg transition-all text-sm ${
                typeFilter === type
                  ? 'bg-slate-200 text-slate-900'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {totalNotifications === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-wave-100 shadow-lg text-center relative z-10">
          <Bell className="w-16 h-16 text-wave-300 mx-auto mb-4" />
          <h3 className="text-wave-800 text-xl mb-2">Nenhuma notificação</h3>
          <p className="text-wave-500">
            {filter === 'unread' 
              ? 'Todas as suas notificações foram lidas!' 
              : 'Você não tem notificações no momento.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          {Object.entries(groupedNotifications).map(([group, notifications]) => (
            <div key={group}>
              <h2 className="text-wave-800 text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {group}
                <span className="text-wave-500 text-sm">({notifications.length})</span>
              </h2>

              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  const isUrgent = notification.priority === 'urgent';
                  
                  return (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                        !notification.read 
                          ? isUrgent
                            ? 'border-red-300 bg-red-50/50 ring-2 ring-red-200'
                            : 'border-wave-300 bg-wave-50/50' 
                          : 'border-wave-100 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(notification.type)} shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="text-wave-800 mb-1 flex items-center gap-2">
                                {notification.title}
                                {!notification.read && (
                                  <span className="w-2 h-2 bg-wave-500 rounded-full animate-pulse" />
                                )}
                              </h3>
                              <p className="text-wave-600 text-sm">{notification.message}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              {getPriorityBadge(notification.priority)}
                              <span className="px-2 py-0.5 bg-wave-100 text-wave-600 rounded-full text-xs">
                                {getTypeLabel(notification.type)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-wave-500 text-sm flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {formatTimestamp(notification.timestamp)}
                            </span>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Metadata */}
                          {notification.metadata?.blockchainHash && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-green-700 text-xs font-mono break-all">
                                Hash: {notification.metadata.blockchainHash.substring(0, 20)}...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-r from-wave-700 to-wave-500 rounded-2xl p-6 border border-wave-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Bell className="w-6 h-6 text-wave-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-wave-800 mb-2">🔔 Como funcionam as notificações?</h3>
            <ul className="list-disc list-inside text-wave-600 text-sm space-y-1">
              <li><strong>Automáticas:</strong> Você recebe notificações sempre que algo importante acontece</li>
              <li><strong>Stellar:</strong> Notificações de registros na rede Stellar</li>
              <li><strong>Prioridades:</strong> Urgentes aparecem em destaque e no topo da lista</li>
              <li><strong>Interativas:</strong> Clique na notificação para ir direto à página relacionada</li>
              <li><strong>Controle Total:</strong> Marque como lida, exclua individualmente ou limpe tudo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
