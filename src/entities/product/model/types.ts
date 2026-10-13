export type ProductStatus = 'published' | 'draft' | 'archived';

export interface Product {
  id: string;
  businessId: string;
  name: string;
  category: string;
  priceCents: number; // En céntimos enteros (ej. S/ 25.00 -> 2500)
  stock: number;      // Entero no negativo (0 = agotado)
  description: string;
  features: string[]; // Características clave (ej. "Tueste medio", "100% puro")
  imageUrl: string;
  imageAlt: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
