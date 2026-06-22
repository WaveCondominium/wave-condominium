'use client';

import { Meetings } from '@/components/Meetings';
import { useUser } from '@/contexts/UserContext';

export default function Page() {
  const { userProfile } = useUser();
  return <Meetings userProfile={userProfile} />;
}
