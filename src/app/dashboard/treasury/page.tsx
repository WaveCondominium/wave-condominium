'use client';

import { Treasury } from '@/components/treasury/Treasury';
import { useUser } from '@/contexts/UserContext';

export default function Page() {
  const { userProfile } = useUser();
  return <Treasury userProfile={userProfile} />;
}
