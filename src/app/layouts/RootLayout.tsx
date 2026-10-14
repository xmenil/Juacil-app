import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import { Navbar } from '@/widgets/navbar/Navbar';
import { Footer } from '@/widgets/footer/Footer';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';
import { CartDrawer } from '@/features/cart/CartDrawer';
import { MobileBottomNav } from '@/widgets/navbar/MobileBottomNav';

export const RootLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isAuthPage = ['/acceso', '/registro/cliente', '/registro/emprendimiento', '/recuperar-acceso'].includes(pathname.replace(/\/$/, ''));
  const handleOpenCategories = () => {
    window.dispatchEvent(new CustomEvent('juacil:open-categories'));
  };

  if (isAuthPage) return <Outlet />;

  return (
    <>
      <DemoUserSwitcher />
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </main>
      <Footer />
      <ReplaceCartModal />
      <CartDrawer />
      <MobileBottomNav onOpenCategories={handleOpenCategories} />
    </>
  );
};
