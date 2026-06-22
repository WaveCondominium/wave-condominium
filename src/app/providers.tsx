'use client';

import { UserProvider } from '../contexts/UserContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <Toaster position="top-right" richColors />
      {children}
    </UserProvider>
  );
}
