export type UserRole = 'cliente' | 'merchant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  businessId?: string; // Solo si role === 'merchant'
  address?: string;    // Opcional para clientes
  avatarUrl?: string;
}
