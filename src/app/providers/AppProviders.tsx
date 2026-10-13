import React from 'react';
import { ConnectivityProvider } from './ConnectivityProvider';
import { SessionProvider } from './SessionProvider';
import { CartProvider } from './CartProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConnectivityProvider>
      <SessionProvider>
        <CartProvider>{children}</CartProvider>
      </SessionProvider>
    </ConnectivityProvider>
  );
};
