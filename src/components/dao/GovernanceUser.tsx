'use client';

// Wrapper fino: morador e gestor usam a mesma GovernanceView; o RBAC interno
// controla criar proposta / encerrar votacao. Mantido para nao quebrar as
// paginas que importam GovernanceUser.
import { GovernanceView } from './GovernanceView';

interface GovernanceUserProps {
  onViewProposal: (proposalId: string) => void;
  userProfile?: unknown;
}

export function GovernanceUser({ onViewProposal }: GovernanceUserProps) {
  return <GovernanceView onViewProposal={onViewProposal} />;
}
