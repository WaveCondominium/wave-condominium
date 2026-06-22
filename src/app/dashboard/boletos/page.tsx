'use client';

import { Boletos } from '@/components/Boletos';
import { useUser } from '@/contexts/UserContext';

export default function Page() {
  const { userProfile } = useUser();
  return <Boletos userProfile={userProfile} />;
}
