export type OrderStatus = 'pendiente' | 'confirmado' | 'preparado' | 'entregado' | 'cancelado';

export interface OrderItem {
  productId: string;
  productName: string;
  productImageUrl: string;
  unitPriceCents: number; // Precio histórico inmutable al momento de la compra
  quantity: number;
  subtotalCents: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderCode: string; // ej. JUA-0001
  businessId: string;
  businessName: string;
  businessWhatsapp: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryType: 'pickup' | 'delivery';
  deliveryAddress?: string;
  notes?: string;
  items: OrderItem[];
  totalCents: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  stockRestoredOnCancel?: boolean;
  createdAt: string;
  updatedAt: string;
}
