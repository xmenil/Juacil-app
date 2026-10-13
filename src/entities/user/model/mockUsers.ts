import { User } from './types';

export const MOCK_USERS: User[] = [
  // Clientes Demo
  {
    id: 'user-client-01',
    name: 'Lucía Ramos Córdova',
    email: 'lucia.ramos@ejemplo.pe',
    role: 'cliente',
    phone: '984512301',
    address: 'Av. Tito Jaime 320, Tingo María (Centro)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-client-02',
    name: 'Carlos Mendoza Silva',
    email: 'carlos.mendoza@ejemplo.pe',
    role: 'cliente',
    phone: '992345678',
    address: 'Jr. Los Cedros 145, Castillo Grande, Tingo María',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  },

  // Emprendedores MYPE Demo de Tingo María y Alrededores
  {
    id: 'user-merchant-01',
    name: 'Don Faustino Alania',
    email: 'faustino@cafemonzon.pe',
    role: 'merchant',
    phone: '954120883',
    businessId: 'biz-cafe-aroma',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-merchant-02',
    name: 'María Inés Huamán',
    email: 'mariaines@belladurmiente.pe',
    role: 'merchant',
    phone: '962881234',
    businessId: 'biz-cacao-miel',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  },
  {
    id: 'user-merchant-03',
    name: 'Wilson Shimbo',
    email: 'wilson@artesaniasnaranjillo.pe',
    role: 'merchant',
    phone: '989012345',
    businessId: 'biz-yanesha-arte',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  },
];
