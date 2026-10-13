import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import { Navbar } from '@/widgets/navbar/Navbar';
import { Footer } from '@/widgets/footer/Footer';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';

export const RootLayout: React.FC = () => {
  return (
    <>
      <DemoUserSwitcher />
      <Navbar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Outlet />
      </main>
      <Footer />
      <ReplaceCartModal />
    </>
  );
};
