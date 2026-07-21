import { useLocalStorage } from './useLocalStorage';

/**
 * Wave · Badges do Menu Lateral
 * ---------------------------------------------------------------------------
 * Cada badge reflete uma contagem real de itens que pedem atenção do
 * usuário — não são números fixos. As chaves de localStorage usadas aqui
 * precisam ficar em sincronia com as usadas pelos componentes de cada
 * módulo (Governance.tsx, Communication.tsx, Meetings.tsx, Boletos.tsx,
 * Maintenance.tsx).
 *
 * Limitação conhecida: como cada useLocalStorage lê o valor só no mount,
 * o badge pode ficar até uma navegação atrasado em relação a uma mudança
 * feita em outra aba/janela aberta ao mesmo tempo. Para uma prévia local,
 * isso é aceitável; numa versão com backend real, isso seria resolvido
 * naturalmente por uma fonte de dados compartilhada.
 */

interface MinimalProposal {
  status: string;
}

interface MinimalReserva {
  status: string;
}

interface MinimalMeeting {
  status: string;
}

interface MinimalBoleto {
  status: string;
}

interface MinimalMaintenanceRequest {
  status: string;
}

export function useMenuBadges() {
  const [proposals] = useLocalStorage<MinimalProposal[]>('wave_proposals_v2', []);
  const [reservas] = useLocalStorage<MinimalReserva[]>('wave_reservas_v2', []);
  const [meetings] = useLocalStorage<MinimalMeeting[]>('wave_meetings', []);
  const [boletos] = useLocalStorage<MinimalBoleto[]>('wave_boletos', []);
  const [maintenanceRequests] = useLocalStorage<MinimalMaintenanceRequest[]>('wave_maintenance_requests', []);

  const governanceCount = proposals.filter((p) => p.status === 'votacao_aberta').length;
  const communicationCount = reservas.filter((r) => r.status === 'pendente').length;
  const meetingsCount = meetings.filter((m) => m.status === 'scheduled').length;
  const boletosCount = boletos.filter((b) => b.status === 'pending' || b.status === 'overdue').length;
  const maintenanceCount = maintenanceRequests.filter((m) => m.status === 'pending' || m.status === 'solicitado').length;

  return {
    governanceCount,
    communicationCount,
    meetingsCount,
    boletosCount,
    maintenanceCount,
  };
}
