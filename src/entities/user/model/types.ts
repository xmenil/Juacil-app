export type UserRole = 'cliente' | 'merchant' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  businessId?: string; // Solo si role === 'merchant'
  address?: string;    // Opcional para clientes
  avatarUrl?: string;
  status?: 'active' | 'suspended';
  dni?: string;
  zone?: string;       // Zona de Tingo María / Selva Central
  createdAt?: string;
}
