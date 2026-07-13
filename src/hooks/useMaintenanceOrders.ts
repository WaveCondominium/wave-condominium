'use client';

import { useLocalStorage } from './useLocalStorage';
import type { InspectionOrder } from '@/components/maintenance/InspectionOrderModal';

export interface MaintenanceOrder {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'progress' | 'completed';
  openedDate: string;
  assignedTo: string | null;
  category: string;
  hasDocument: boolean;
}

export interface UnifiedMaintenanceOrder extends MaintenanceOrder {
  isInspection: boolean;
  inspectionData?: InspectionOrder;
}

const DEFAULT_MAINTENANCE_ORDERS: MaintenanceOrder[] = [
  {
    id: 'OS-001',
    title: 'Reparo Interfone Apto 504',
    priority: 'medium',
    status: 'completed',
    openedDate: '28/11/2025',
    assignedTo: 'João Técnico',
    category: 'Elétrica',
    hasDocument: true
  },
  {
    id: 'OS-002',
    title: 'Vistoria Preventiva Elevador A',
    priority: 'high',
    status: 'progress',
    openedDate: '01/12/2025',
    assignedTo: 'Atlas Elevadores',
    category: 'Equipamento',
    hasDocument: false
  },
  {
    id: 'OS-003',
    title: 'Troca de Lâmpadas Garagem',
    priority: 'low',
    status: 'pending',
    openedDate: '03/12/2025',
    assignedTo: null,
    category: 'Iluminação',
    hasDocument: false
  }
];

function convertInspectionStatus(status: string): 'pending' | 'progress' | 'completed' {
  if (status === 'em_andamento') return 'progress';
  if (status === 'concluida') return 'completed';
  return 'pending';
}

// ---------------------------------------------------------------------------
// Responsabilidade única: ler e unificar as Ordens de Serviço normais com as
// Ordens de Vistoria de Garantia, retornando uma lista única e ordenada, mais
// as contagens por status. Extraído de Maintenance.tsx para ser reutilizado
// pelo Dashboard sem duplicar a lógica de merge/conversão — se essa lógica
// mudar um dia, muda num lugar só.
// ---------------------------------------------------------------------------
export function useMaintenanceOrders() {
  const [maintenanceOrders, setMaintenanceOrders] = useLocalStorage<MaintenanceOrder[]>(
    'wave_maintenance_orders',
    DEFAULT_MAINTENANCE_ORDERS
  );
  const [inspectionOrders, setInspectionOrders] = useLocalStorage<InspectionOrder[]>(
    'wave_inspection_orders_v2',
    []
  );

  const convertedInspectionOrders: UnifiedMaintenanceOrder[] = inspectionOrders.map((inspection) => ({
    id: inspection.id,
    title: `Vistoria: ${inspection.system}`,
    priority: inspection.inspectionType === 'urgente' ? 'high' : 'medium',
    status: convertInspectionStatus(inspection.status),
    openedDate: new Date(inspection.createdAt).toLocaleDateString('pt-BR'),
    assignedTo: inspection.responsible,
    category: 'Vistoria de Garantia',
    hasDocument: false,
    isInspection: true,
    inspectionData: inspection,
  }));

  const allOrders: UnifiedMaintenanceOrder[] = [
    ...maintenanceOrders.map((o) => ({ ...o, isInspection: false })),
    ...convertedInspectionOrders,
  ].sort((a, b) => {
    const dateA = new Date(a.openedDate.split('/').reverse().join('-'));
    const dateB = new Date(b.openedDate.split('/').reverse().join('-'));
    return dateB.getTime() - dateA.getTime();
  });

  const abertas = allOrders.filter((o) => o.status === 'pending').length;
  const emAndamento = allOrders.filter((o) => o.status === 'progress').length;
  const concluidas = allOrders.filter((o) => o.status === 'completed').length;

  return {
    allOrders,
    maintenanceOrders,
    setMaintenanceOrders,
    inspectionOrders,
    setInspectionOrders,
    abertas,
    emAndamento,
    concluidas,
  };
}
