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

  // Si se está cambiando de perfil explícitamente, navegar directamente al destino solicitado
  const switchingTo =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('juacil_switching_to')
      : null;

  if (switchingTo) {
    sessionStorage.removeItem('juacil_switching_to');
    return <Navigate to={switchingTo} replace />;
  }

  if (!currentUser) {
    const redirectUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`${ROUTES.LOGIN}?redirect=${redirectUrl}`} replace />;
  }

  // Si un emprendedor está en una ruta exclusiva de admin, redirigir a su panel
  if (requiredRole === 'admin' && !isAdmin) {
    if (isMerchant) {
      return <Navigate to={ROUTES.MERCHANT_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  // Si un cliente o admin está en el panel de tienda sin permiso, redirigir al inicio
  if (requiredRole === 'merchant' && !isMerchant && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (requiredRole === 'cliente' && !isClient && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <Outlet />;
};
