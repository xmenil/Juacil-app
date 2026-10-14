export type BusinessStatus = 'active' | 'pending' | 'suspended';

export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  whatsapp: string;
  ruc?: string;
  logoUrl: string;
  bannerUrl: string;
  ownerId: string;
  onboardingStep: 1 | 2 | 3 | 4; // 1: Datos, 2: Producto, 3: Órdenes, 4: Completado
  createdAt: string;
  status?: BusinessStatus;
  schedule?: string;
}
