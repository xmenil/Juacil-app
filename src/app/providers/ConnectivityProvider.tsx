import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConnectivityContextType {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [browserOnline, setBrowserOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isOnline = browserOnline && !isSimulatedOffline;

  const toggleSimulatedOffline = () => {
    setIsSimulatedOffline((prev) => !prev);
  };

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isSimulatedOffline,
        toggleSimulatedOffline,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export function useConnectivity(): ConnectivityContextType {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity debe usarse dentro de ConnectivityProvider');
  }
  return context;
}
