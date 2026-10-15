import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/entities/user/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

interface SessionContextType {
  currentUser: User | null;
  isClient: boolean;
  isMerchant: boolean;
  isAdmin: boolean;
  businessId: string | null;
  loginAs: (userId: string) => boolean;
  loginAsRole: (role: 'admin' | 'merchant' | 'cliente') => User | null;
  logout: () => void;
  updateCurrentUser: (user: User) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'juacil_active_user_id_v1.0';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedId) {
        const found = LocalStoreRepository.getUserById(storedId);
        if (found && found.status !== 'suspended') return found;
      }
      // Por defecto iniciamos con Lucía Ramos (cliente regular) para facilidad de prueba
      return LocalStoreRepository.getUserById('user-client-01') || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(SESSION_STORAGE_KEY, currentUser.id);
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [currentUser]);

  const loginAs = (userId: string): boolean => {
    const user = LocalStoreRepository.getUserById(userId);
    if (user) {
      if (user.status === 'suspended') {
        alert('Esta cuenta ha sido suspendida por el Administrador. Contacta a soporte.');
        return false;
      }
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginAsRole = (role: 'admin' | 'merchant' | 'cliente'): User | null => {
    const users = LocalStoreRepository.getUsers();
    const user = users.find((u) => u.role === role && u.status !== 'suspended');
    if (user) {
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateCurrentUser = (user: User) => {
    LocalStoreRepository.saveUser(user);
    setCurrentUser(user);
  };

  const isClient = currentUser?.role === 'cliente';
  const isMerchant = currentUser?.role === 'merchant';
  const isAdmin = currentUser?.role === 'admin';
  const businessId = isMerchant && currentUser?.businessId ? currentUser.businessId : null;

  return (
    <SessionContext.Provider
      value={{
        currentUser,
        isClient,
        isMerchant,
        isAdmin,
        businessId,
        loginAs,
        loginAsRole,
        logout,
        updateCurrentUser,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
}
