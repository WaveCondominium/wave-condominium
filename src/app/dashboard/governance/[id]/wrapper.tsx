'use client';

import { ProposalDetails } from '@/components/dao/ProposalDetails';
import { useRouter } from 'next/navigation';

export function ProposalDetailsWrapper({ id }: { id: string }) {
  const router = useRouter();
  return <ProposalDetails proposalId={id} onBack={() => router.back()} />;
}
