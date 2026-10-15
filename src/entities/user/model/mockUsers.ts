import { User } from './types';

export const MOCK_USERS: User[] = [
  // 1. Super Administrador JUÁCIL
  {
    id: 'user-admin-01',
    name: 'Admin General JUÁCIL',
    email: 'admin@juacil.pe',
    role: 'admin',
    phone: '962881000',
    address: 'Sede Central JUÁCIL, Av. Tito Jaime 550, Tingo María',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    dni: '45892104',
    zone: 'Tingo María (Centro)',
    createdAt: '2026-01-01T08:00:00.000Z',
  },

  // 2. Emprendedor MYPE Demo
  {
    id: 'user-merchant-01',
    name: 'Don Faustino Alania',
    email: 'faustino@cafemonzon.pe',
    role: 'merchant',
    phone: '954120883',
    businessId: 'biz-cafe-aroma',
    address: 'Valle del Monzón, Tingo María',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    dni: '22894103',
    zone: 'Valle del Monzón',
    createdAt: '2026-02-01T10:00:00.000Z',
  },

  // 3. Cliente Comprador Demo
  {
    id: 'user-client-01',
    name: 'Lucía Ramos Córdova',
    email: 'lucia.ramos@ejemplo.pe',
    role: 'cliente',
    phone: '984512301',
    address: 'Av. Tito Jaime 320, Tingo María (Centro)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    status: 'active',
    dni: '72391048',
    zone: 'Tingo María (Centro)',
    createdAt: '2026-01-10T09:15:00.000Z',
  },
];
