import { toast } from 'sonner';
import { useState } from 'react';
import { Wrench, CheckCircle, AlertCircle, Calendar, Shield, Bell, Plus } from 'lucide-react';

import { CreateMaintenanceModal } from './maintenance/CreateMaintenanceModal';
import { InspectionOrderModal } from './maintenance/InspectionOrderModal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMaintenanceOrders } from '../hooks/useMaintenanceOrders';

export function Maintenance() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'progress' | 'completed'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [maintenanceRequests, setMaintenanceRequests] = useLocalStorage<any[]>('wave_maintenance_requests', []);

  // Extraído para src/hooks/useMaintenanceOrders.ts — mesma lógica de merge
  // OS + Vistorias que existia aqui antes, agora reutilizável pelo Dashboard.
  const {
    allOrders,
    maintenanceOrders,
    setMaintenanceOrders,
    inspectionOrders,
    setInspectionOrders,
  } = useMaintenanceOrders();

  const warranties = [
    {
      id: '1',
      system: 'Bomba D\'água Principal',
      type: 'Equipamento',
      startDate: '15/01/2023',
      endDate: '15/01/2026',
      daysRemaining: 28,
      status: 'warning',
      supplier: 'Construtora XYZ'
    },
    {
      id: '2',
      system: 'Impermeabilização Piscina',
      type: 'Estrutural',
      startDate: '01/03/2023',
      endDate: '01/03/2028',
      daysRemaining: 754,
      status: 'good',
      supplier: 'Construtora XYZ'
    },
    {
      id: '3',
      system: 'Sistema de CFTV',
      type: 'Eletrônico',
      startDate: '10/06/2024',
      endDate: '10/06/2026',
      daysRemaining: 187,
      status: 'good',
      supplier: 'SecurityTech Ltda'
    }
  ];

  const compliance = [
    {
      name: 'AVCB - Auto de Vistoria do Corpo de Bombeiros',
      status: 'valid',
      validUntil: '15/08/2026',
      daysRemaining: 253,
      authority: 'Corpo de Bombeiros SP'
    },
    {
      name: 'Seguro Predial Integral',
      status: 'valid',
      validUntil: '20/05/2026',
      daysRemaining: 166,
      authority: 'Porto Seguro'
    },
    {
      name: 'Laudo Técnico SPDA (Para-raios)',
      status: 'warning',
      validUntil: '10/02/2026',
      daysRemaining: 67,
      authority: 'Eng. Silva'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">Pendente</span>;
      case 'progress':
        return <span className="px-3 py-1 bg-wave-100 text-wave-600 rounded-full text-sm">Em Andamento</span>;
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Concluída</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Alta</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">Média</span>;
      case 'low':
        return <span className="px-2 py-1 bg-wave-100 text-wave-600 rounded text-xs">Baixa</span>;
      default:
        return null;
    }
  };

  const getWarrantyStatus = (daysRemaining: number) => {
    if (daysRemaining <= 30) return 'critical';
    if (daysRemaining <= 90) return 'warning';
    return 'good';
  };

  const filteredOrders = allOrders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const handleCreateOrder = (newOrder: any) => {
    setMaintenanceOrders([...maintenanceOrders, newOrder]);
    setShowCreateModal(false);
  };

  const handleOpenInspectionModal = (warranty: any) => {
    setSelectedWarranty(warranty);
    setShowInspectionModal(true);
  };

  const handleCreateInspectionOrder = (newOrder: any) => {
    setInspectionOrders([...inspectionOrders, newOrder]);
    setShowInspectionModal(false);
  };

  const handleCreateRequest = (requestData: any) => {
    const newRequest = {
      id: `REQ-${Date.now()}`,
      ...requestData,
      status: 'solicitado',
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    setMaintenanceRequests([...maintenanceRequests, newRequest]);
    setShowRequestModal(false);
    alert('✅ Solicitação enviada ao síndico!');
  };

  const handleConvertToOS = (requestId: string) => {
    const request = maintenanceRequests.find((r: any) => r.id === requestId);
    if (!request) return;

    const newOS = {
      id: `OS-${Date.now().toString().slice(-3)}`,
      title: request.title,
      priority: request.priority,
      status: 'pending' as const,
      openedDate: new Date().toLocaleDateString('pt-BR'),
      assignedTo: null,
      category: request.category,
      hasDocument: false,
      fromRequest: true
    };

    setMaintenanceOrders([...maintenanceOrders, newOS]);
    setMaintenanceRequests(maintenanceRequests.filter((r: any) => r.id !== requestId));
    alert('✅ Ordem de Serviço criada!');
  };

  return (
    <div className="p-8 bg-gradient-to-br from-wave-700 to-wave-500 min-h-screen relative">
      

      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h1 className="text-wave-800 text-3xl mb-2">Manutenção Preditiva</h1>
          <p className="text-wave-500">Gestão inteligente de garantias, manutenções e conformidade</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-3 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:from-wave-700 hover:to-wave-500 transition-all shadow-lg flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova OS
        </button>
      </div>

      {/* Warranties Section */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-xl">Garantias Construtivas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warranties.map((warranty) => {
            const statusType = getWarrantyStatus(warranty.daysRemaining);
            return (
              <div
                key={warranty.id}
                className={`bg-white/80 backdrop-blur-sm rounded-2xl border-2 p-6 shadow-lg ${
                  statusType === 'critical' ? 'border-red-300' : 
                  statusType === 'warning' ? 'border-orange-300' : 
                  'border-wave-100'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-wave-800 flex-1">{warranty.system}</h3>
                  {statusType === 'critical' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : statusType === 'warning' ? (
                    <Bell className="w-5 h-5 text-orange-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-wave-500">Tipo:</span>
                    <span className="text-wave-800">{warranty.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wave-500">Vencimento:</span>
                    <span className="text-wave-800">{warranty.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-wave-500">Fornecedor:</span>
                    <span className="text-wave-800 text-xs">{warranty.supplier}</span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl text-center ${
                  statusType === 'critical' ? 'bg-red-100 text-red-900' :
                  statusType === 'warning' ? 'bg-orange-100 text-orange-900' :
                  'bg-green-100 text-green-900'
                }`}>
                  <p className="text-2xl font-bold mb-1">{warranty.daysRemaining}</p>
                  <p className="text-sm">dias restantes</p>
                </div>

                {statusType !== 'good' && (
                  <button
                    className="w-full mt-4 py-2 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-lg hover:from-wave-700 hover:to-wave-500 transition-all text-sm shadow-lg"
                    onClick={() => handleOpenInspectionModal(warranty)}
                  >
                    Abrir OS de Vistoria
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance Section */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-xl">Conformidade Legal</h2>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-wave-100 p-6 shadow-lg">
          <div className="space-y-4">
            {compliance.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-wave-50 rounded-xl">
                <div className="flex-1">
                  <h3 className="text-wave-800 mb-2">{item.name}</h3>
                  <div className="flex gap-4 text-sm text-wave-500">
                    <span>Válido até: {item.validUntil}</span>
                    <span>•</span>
                    <span>{item.authority}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold mb-1 ${
                    item.status === 'warning' ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {item.daysRemaining}
                  </p>
                  <p className="text-sm text-wave-500">dias</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Orders */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-wave-500" />
          <h2 className="text-wave-800 text-xl">Ordens de Serviço</h2>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-wave-100 mb-6 shadow-lg">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                  : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              Todas ({allOrders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'pending'
                  ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                  : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              Pendentes
            </button>
            <button
              onClick={() => setFilter('progress')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'progress'
                  ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                  : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              Em Andamento
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-xl transition-all ${
                filter === 'completed'
                  ? 'bg-gradient-to-r from-wave-700 to-wave-500 text-white shadow-lg'
                  : 'bg-wave-50 text-wave-500 hover:bg-wave-100'
              }`}
            >
              Concluídas
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white/80 backdrop-blur-sm rounded-2xl border p-6 shadow-lg hover:shadow-xl transition-all ${
              order.isInspection ? 'border-2 border-wave-200 bg-gradient-to-br from-white to-wave-500/50' : 'border border-wave-100'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-wave-800 text-lg">{order.title}</h3>
                    {getPriorityBadge(order.priority)}
                    {order.isInspection && (
                      <span className="px-3 py-1 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-full text-xs flex items-center gap-1 shadow-lg">
                        <Shield className="w-3 h-3" />
                        Vistoria
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-wave-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {order.openedDate}
                    </span>
                    <span>•</span>
                    <span>{order.category}</span>
                    {order.assignedTo && (
                      <>
                        <span>•</span>
                        <span>{order.assignedTo}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {order.hasDocument && (
                    <span className="px-3 py-1 bg-wave-100 text-wave-600 rounded-full text-xs">
                      Com Laudo
                    </span>
                  )}
                  {getStatusBadge(order.status)}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2 bg-wave-100 text-wave-600 rounded-xl hover:bg-wave-200 transition-all">
                  Ver Detalhes
                </button>
                {order.status !== 'completed' && (
                  <button
                    onClick={() => {
                      const nextStatus = order.status === 'pending' ? 'progress' : 'completed';
                      const label = nextStatus === 'progress' ? 'Em Andamento' : 'Concluída';
                      setMaintenanceOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: nextStatus } : o));
                      toast.success(`OS ${order.id} atualizada para: ${label}`);
                    }}
                    className="flex-1 py-2 bg-gradient-to-r from-wave-700 to-wave-500 text-white rounded-xl hover:opacity-90 transition-all shadow-lg text-sm"
                  >
                    {order.status === 'pending' ? 'Iniciar OS' : 'Concluir OS'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Blockchain Info */}
      <div className="mt-8 bg-gradient-to-r from-wave-700 to-wave-500 rounded-2xl p-6 border border-wave-200 shadow-lg relative z-10">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-wave-500 shrink-0 mt-1" />
          <div>
            <h3 className="text-wave-800 mb-2">Registro Imutável</h3>
            <p className="text-wave-600 text-sm">
              Todas as vistoria de garantias e ordens de serviço críticas são registradas 
              automaticamente na rede Stellar, criando prova irrefutável de diligência e boa-fé.
            </p>
          </div>
        </div>
      </div>

      {/* Create Maintenance Modal */}
      {showCreateModal && (
        <CreateMaintenanceModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateOrder}
        />
      )}

      {/* Inspection Order Modal */}
      {showInspectionModal && selectedWarranty && (
        <InspectionOrderModal
          isOpen={showInspectionModal}
          onClose={() => setShowInspectionModal(false)}
          onSubmit={handleCreateInspectionOrder}
          warranty={selectedWarranty}
        />
      )}
    </div>
  );
}
