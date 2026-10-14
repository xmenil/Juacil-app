import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { MerchantLayout } from '@/app/layouts/MerchantLayout';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Páginas Públicas
import { HomePage } from '@/pages/home/HomePage';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { ProductDetailPage } from '@/pages/product-detail/ProductDetailPage';
import { StoreDetailPage } from '@/pages/store-detail/StoreDetailPage';
import { HelpPage } from '@/pages/help/HelpPage';

// Páginas de Acceso
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterCustomerPage } from '@/pages/auth/RegisterCustomerPage';
import { RegisterBusinessPage } from '@/pages/auth/RegisterBusinessPage';
import { RecoverPasswordPage } from '@/pages/auth/RecoverPasswordPage';

// Páginas de Compra / Cliente
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { CustomerOrdersPage } from '@/pages/customer-orders/CustomerOrdersPage';
import { CustomerOrderDetailPage } from '@/pages/customer-orders/CustomerOrderDetailPage';
import { CustomerProfilePage } from '@/pages/customer-account/CustomerProfilePage';

// Páginas de Panel MYPE
import { MerchantDashboardPage } from '@/pages/merchant-dashboard/MerchantDashboardPage';
import { MerchantBusinessPage } from '@/pages/merchant-business/MerchantBusinessPage';
import { MerchantProductsPage } from '@/pages/merchant-products/MerchantProductsPage';
import { MerchantProductNewPage } from '@/pages/merchant-products/MerchantProductNewPage';
import { MerchantProductEditPage } from '@/pages/merchant-products/MerchantProductEditPage';
import { MerchantOrdersPage } from '@/pages/merchant-orders/MerchantOrdersPage';
import { MerchantOrderDetailPage } from '@/pages/merchant-orders/MerchantOrderDetailPage';

// Páginas de Panel Super Administrador
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';

// Errores
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';

export const router = createBrowserRouter([
  // 1. Portal de Tienda / Emprendedores MYPE (Sección Completa Dedicada con Barra a la Derecha)
  {
    path: '/panel',
    element: <ProtectedRoute requiredRole="merchant" />,
    children: [
      {
        element: <MerchantLayout />,
        children: [
          { index: true, element: <MerchantDashboardPage /> },
          { path: 'negocio', element: <MerchantBusinessPage /> },
          { path: 'productos', element: <MerchantProductsPage /> },
          { path: 'productos/nuevo', element: <MerchantProductNewPage /> },
          { path: 'productos/:id/editar', element: <MerchantProductEditPage /> },
          { path: 'pedidos', element: <MerchantOrdersPage /> },
          { path: 'pedidos/:id', element: <MerchantOrderDetailPage /> },
          { path: 'notificaciones', element: <MerchantDashboardPage /> },
        ],
      },
    ],
  },

  // 2. Portal de Super Administrador JUÁCIL (Interfaz Dedicada de Control Maestro)
  {
    path: '/admin',
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'usuarios', element: <AdminDashboardPage /> },
          { path: 'tiendas', element: <AdminDashboardPage /> },
          { path: 'pedidos', element: <AdminDashboardPage /> },
        ],
      },
    ],
  },

  // 3. Marketplace Público & Clientes (Cabecera, Navegación de Compras, Bandeja Carrito, Footer)
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Rutas Públicas
      { index: true, element: <HomePage /> },
      { path: 'catalogo', element: <CatalogPage /> },
      { path: 'productos/:id', element: <ProductDetailPage /> },
      { path: 'tiendas/:id', element: <StoreDetailPage /> },
      { path: 'ayuda', element: <HelpPage /> },

      // Rutas de Autenticación
      { path: 'acceso', element: <LoginPage /> },
      { path: 'registro/cliente', element: <RegisterCustomerPage /> },
      { path: 'registro/emprendimiento', element: <RegisterBusinessPage /> },
      { path: 'recuperar-acceso', element: <RecoverPasswordPage /> },

      // Carrito público / provisional
      { path: 'carrito', element: <CartPage /> },

      // Rutas de Compra y Cliente
      { path: 'pedido/confirmar', element: <CheckoutPage /> },
      { path: 'mis-pedidos', element: <CustomerOrdersPage /> },
      { path: 'mis-pedidos/:id', element: <CustomerOrderDetailPage /> },
      { path: 'mi-cuenta', element: <CustomerProfilePage /> },
      { path: 'perfil', element: <CustomerProfilePage /> },

      // Páginas de Error
      { path: '403', element: <ForbiddenPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
