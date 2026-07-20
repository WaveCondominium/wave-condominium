import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface Notification {
  id: string;
  type: 'blockchain' | 'payment' | 'proposal' | 'document' | 'meeting' | 'boleto' | 'announcement' | 'reservation' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    proposalId?: string;
    blockchainHash?: string;
    boletoId?: string;
    meetingId?: string;
    documentId?: string;
    reservaId?: string;
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('wave_notifications', [
    {
      id: '1',
      type: 'blockchain',
      title: 'Pagamento Registrado na Blockchain',
      message: 'Seu boleto de Dezembro/2025 foi compensado e registrado na rede Stellar com sucesso!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high',
      metadata: {
        boletoId: '1',
        blockchainHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    },
    {
      id: '2',
      type: 'proposal',
      title: 'Nova Proposta Disponível',
      message: 'A proposta "Instalação de Painéis Solares" está disponível para votação. Sua participação é importante!',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium',
      metadata: {
        proposalId: 'prop-1'
      }
    },
    {
      id: '3',
      type: 'meeting',
      title: 'Reunião Agendada',
      message: 'Assembleia Extraordinária agendada para 20/12/2025 às 19h. Confirme sua presença!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'high',
      metadata: {
        meetingId: 'meet-1'
      }
    },
    {
      id: '4',
      type: 'boleto',
      title: 'Novo Boleto Disponível',
      message: 'Boleto de Janeiro/2026 foi emitido. Vencimento: 10/01/2026',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium',
      metadata: {
        boletoId: '2'
      }
    },
    {
      id: '5',
      type: 'document',
      title: 'Documento Aprovado',
      message: 'A Ata da Assembleia de Novembro/2025 foi aprovada e publicada.',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low',
      metadata: {
        documentId: 'doc-1'
      }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Criar nova notificação
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications([newNotification, ...notifications]);
    return newNotification;
  };

  // Marcar como lida
  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Excluir notificação
  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  // Excluir todas lidas
  const deleteAllRead = () => {
    setNotifications(notifications.filter(n => !n.read));
  };

  // Limpar todas
  const clearAll = () => {
    if (confirm('Tem certeza que deseja excluir TODAS as notificações?')) {
      setNotifications([]);
    }
  };

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notification => {
    // Filtro de lido/não lido
    if (filter === 'unread' && notification.read) return false;
    if (filter === 'read' && !notification.read) return false;

    // Filtro por tipo
    if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

    return true;
  });

  // Contadores
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => !n.read && n.priority === 'urgent').length;
  const highPriorityCount = notifications.filter(n => !n.read && (n.priority === 'high' || n.priority === 'urgent')).length;

  // Agrupar por data
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = 'Hoje';
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = 'Ontem';
    } else if (date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000) {
      key = 'Esta Semana';
    } else {
      key = 'Mais Antigas';
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(notification);
    return groups;
  }, {} as Record<string, Notification[]>);

  return {
    notifications: filteredNotifications,
    groupedNotifications,
    allNotifications: notifications,
    unreadCount,
    urgentCount,
    highPriorityCount,
    filter,
    typeFilter,
    setFilter,
    setTypeFilter,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    clearAll
  };
}
