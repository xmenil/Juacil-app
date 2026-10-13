import { Product } from '@/entities/product/model/types';

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface Cart {
  businessId: string | null;
  businessName: string | null;
  items: CartItem[];
  totalCents: number;
  itemCount: number;
}
