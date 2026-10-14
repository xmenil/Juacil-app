import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { ROUTES } from '@/shared/config/routes';

interface ProtectedRouteProps {
  requiredRole?: 'cliente' | 'merchant' | 'admin';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { currentUser, isMerchant, isClient, isAdmin } = useSession();
  const location = useLocation();

  if (!currentUser) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirectUrl}`} replace />;
  }

  if (requiredRole === 'merchant' && !isMerchant && !isAdmin) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  if (requiredRole === 'cliente' && !isClient && !isAdmin) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
};
