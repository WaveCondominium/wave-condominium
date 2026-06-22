'use client';

import { Governance } from '@/components/dao/Governance';
import { GovernanceUser } from '@/components/dao/GovernanceUser';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function GovernancePage() {
  const router = useRouter();
  const { userProfile } = useUser();

  const handleViewProposal = (proposalId: string) => {
    router.push(`/dashboard/governance/${proposalId}`);
  };

  if (userProfile.role === 'Morador') {
    return <GovernanceUser onViewProposal={handleViewProposal} userProfile={userProfile} />;
  }

  return <Governance onViewProposal={handleViewProposal} />;
}
