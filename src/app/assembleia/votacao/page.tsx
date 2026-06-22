'use client';

import { GovernanceUser } from '@/components/dao/GovernanceUser';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AssembleiaVotacaoPage() {
  const { userProfile, isAuthenticated } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleViewProposal = (proposalId: string) => {
    // Redirect to the detailed view which is currently under dashboard/governance
    router.push(`/dashboard/governance/${proposalId}`);
  };

  if (!isAuthenticated || !userProfile) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">Assembleia Virtual</h1>
        <GovernanceUser onViewProposal={handleViewProposal} userProfile={userProfile} />
      </div>
    </div>
  );
}
