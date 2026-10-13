import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import { Navbar } from '@/widgets/navbar/Navbar';
import { Footer } from '@/widgets/footer/Footer';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';
import { MobileBottomNav } from '@/widgets/navbar/MobileBottomNav';

export const RootLayout: React.FC = () => {
  const handleOpenCategories = () => {
    window.dispatchEvent(new CustomEvent('juacil:open-categories'));
  };

  return (
    <>
      <DemoUserSwitcher />
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'var(--bottom-nav-height)' }}>
        <Outlet />
      </main>
      <Footer />
      <ReplaceCartModal />
      <MobileBottomNav onOpenCategories={handleOpenCategories} />
    </>
  );
};
