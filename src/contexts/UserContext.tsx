'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth, User } from '@/hooks/useAuth';

// Mantendo compatibilidade com interfaces existentes onde possível
export interface UserProfile extends User {
  avatar?: string;
}

interface UserContextType {
  userProfile: UserProfile;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const defaultProfile: UserProfile = {
  id: '',
  name: '',
  unit: '',
  role: 'Morador', // Default válido
  email: '',
  avatar: '',
  walletAddress: ''
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, login, logout, loading } = useAuth();

  const userProfile: UserProfile = user ? {
    ...user,
    avatar: getInitials(user.name)
  } : defaultProfile;

  return (
    <UserContext.Provider value={{ 
      userProfile, 
      isAuthenticated: !!user, 
      login, 
      logout,
      isLoading: loading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

function getInitials(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
