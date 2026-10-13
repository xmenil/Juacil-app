import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { ROUTES } from '@/shared/config/routes';

interface ProtectedRouteProps {
  requiredRole?: 'cliente' | 'merchant';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { currentUser, isMerchant, isClient } = useSession();

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiredRole === 'merchant' && !isMerchant) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  if (requiredRole === 'cliente' && !isClient) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
};
