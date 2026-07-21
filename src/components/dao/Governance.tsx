'use client';

// Wrapper fino: a tela de Governanca foi unificada em GovernanceView, que
// serve tanto o gestor quanto o morador (capacidades liberadas por RBAC).
import { GovernanceView } from './GovernanceView';

interface GovernanceProps {
  onViewProposal: (proposalId: string) => void;
}

export function Governance({ onViewProposal }: GovernanceProps) {
  return <GovernanceView onViewProposal={onViewProposal} />;
}
