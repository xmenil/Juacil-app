import { User } from '@/entities/user/model/types';
import { Business } from '@/entities/business/model/types';
import { Product } from '@/entities/product/model/types';
import { Order, OrderStatus } from '@/entities/order/model/types';
import { canTransitionOrder } from '@/entities/order/model/orderStateMachine';
import { MOCK_USERS } from '@/entities/user/model/mockUsers';
import { MOCK_BUSINESSES } from '@/entities/business/model/mockBusinesses';
import { MOCK_PRODUCTS } from '@/entities/product/model/mockProducts';
import { MOCK_ORDERS } from '@/entities/order/model/mockOrders';
import { generateId, generateOrderCode } from './id';

const STORAGE_KEY = 'juacil_app_store_v2.5';

export interface StorageSchema {
  version: string;
  users: User[];
  businesses: Business[];
  products: Product[];
  orders: Order[];
  orderCounter: number;
}

function getInitialData(): StorageSchema {
  return {
    version: '2.5.0',
    users: [...MOCK_USERS],
    businesses: [...MOCK_BUSINESSES],
    products: [...MOCK_PRODUCTS],
    orders: [...MOCK_ORDERS],
    orderCounter: 4, // 1 a 3 ya usados en mock
  };
}

export class LocalStoreRepository {
  private static load(): StorageSchema {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) {
        const initial = getInitialData();
        this.save(initial);
        return initial;
      }
      const parsed = JSON.parse(serialized) as StorageSchema;
      if (!parsed || parsed.version !== '2.5.0' || !Array.isArray(parsed.products)) {
        console.warn('Almacenamiento local incompatible o corrupto. Restaurando estado seguro.');
        const initial = getInitialData();
        this.save(initial);
        return initial;
      }
      return parsed;
    } catch (e) {
      console.error('Error al leer de localStorage. Autorecuperación a datos iniciales.', e);
      const initial = getInitialData();
      this.save(initial);
      return initial;
    }
  }

  public static resetToInitial(): void {
    const initial = getInitialData();
    this.save(initial);
  }

  private static save(data: StorageSchema): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error al persistir en localStorage:', e);
    }
  }

  // --- Reset de Datos Demo ---
  public static resetToFactoryDefaults(): StorageSchema {
    const fresh = getInitialData();
    this.save(fresh);
    return fresh;
  }

  // --- Usuarios ---
  public static getUsers(): User[] {
    return this.load().users;
  }

  public static getUserById(id: string): User | undefined {
    return this.load().users.find((u) => u.id === id);
  }

  public static saveUser(user: User): User {
    const data = this.load();
    const index = data.users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      data.users[index] = user;
    } else {
      data.users.push(user);
    }
    this.save(data);
    return user;
  }

  public static deleteUser(id: string): boolean {
    const data = this.load();
    const initialLen = data.users.length;
    data.users = data.users.filter((u) => u.id !== id);
    if (data.users.length !== initialLen) {
      this.save(data);
      return true;
    }
    return false;
  }

  public static updateUserStatus(id: string, status: 'active' | 'suspended'): boolean {
    const data = this.load();
    const user = data.users.find((u) => u.id === id);
    if (user) {
      user.status = status;
      this.save(data);
      return true;
    }
    return false;
  }

  // --- Negocios (MYPES) ---
  public static getBusinesses(): Business[] {
    return this.load().businesses;
  }

  public static getBusinessById(id: string): Business | undefined {
    return this.load().businesses.find((b) => b.id === id);
  }

  public static saveBusiness(business: Business): Business {
    const data = this.load();
    const index = data.businesses.findIndex((b) => b.id === business.id);
    if (index >= 0) {
      data.businesses[index] = business;
    } else {
      data.businesses.push(business);
    }
    this.save(data);
    return business;
  }

  public static deleteBusiness(id: string): boolean {
    const data = this.load();
    const initialLen = data.businesses.length;
    data.businesses = data.businesses.filter((b) => b.id !== id);
    if (data.businesses.length !== initialLen) {
      this.save(data);
      return true;
    }
    return false;
  }

  public static updateBusinessStatus(
    id: string,
    status: 'active' | 'pending' | 'suspended'
  ): boolean {
    const data = this.load();
    const business = data.businesses.find((b) => b.id === id);
    if (business) {
      business.status = status;
      this.save(data);
      return true;
    }
    return false;
  }

  // --- Productos ---
  public static getProducts(includeDrafts = false): Product[] {
    const prods = this.load().products;
    if (includeDrafts) return prods;
    return prods.filter((p) => p.status === 'published');
  }

  public static getProductById(id: string): Product | undefined {
    return this.load().products.find((p) => p.id === id);
  }

  public static getProductsByBusiness(businessId: string): Product[] {
    return this.load().products.filter((p) => p.businessId === businessId);
  }

  public static saveProduct(product: Product): Product {
    const data = this.load();
    const index = data.products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      data.products[index] = { ...product, updatedAt: new Date().toISOString() };
    } else {
      data.products.push({
        ...product,
        id: product.id || generateId('prod'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.save(data);
    return product;
  }

  public static deleteProduct(id: string): boolean {
    const data = this.load();
    const initialLen = data.products.length;
    data.products = data.products.filter((p) => p.id !== id);
    if (data.products.length !== initialLen) {
      this.save(data);
      return true;
    }
    return false;
  }

  // --- Pedidos (Orders) e Inventario ---
  public static getOrders(): Order[] {
    return this.load().orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getOrderById(id: string): Order | undefined {
    return this.load().orders.find((o) => o.id === id);
  }

  public static getOrdersByCustomer(customerId: string): Order[] {
    return this.load().orders
      .filter((o) => o.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getOrdersByBusiness(businessId: string): Order[] {
    return this.load().orders
      .filter((o) => o.businessId === businessId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Crea un pedido con validación de stock atómica y reserva en inventario
   * Prevención de sobreventa P05
   */
  public static createOrder(params: {
    businessId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    deliveryType: 'pickup' | 'delivery';
    deliveryAddress?: string;
    notes?: string;
    items: Array<{ productId: string; quantity: number }>;
  }): { success: true; order: Order } | { success: false; error: string } {
    const data = this.load();
    const business = data.businesses.find((b) => b.id === params.businessId);
    if (!business) {
      return { success: false, error: 'Negocio no encontrado.' };
    }

    // 1. Validar stock de cada ítem
    const orderItems: Order['items'] = [];
    let totalCents = 0;

    for (const itemReq of params.items) {
      const prod = data.products.find((p) => p.id === itemReq.productId);
      if (!prod) {
        return { success: false, error: `El producto ID "${itemReq.productId}" ya no está disponible.` };
      }
      if (prod.stock < itemReq.quantity) {
        return {
          success: false,
          error: `Stock insuficiente para "${prod.name}". Disponibles: ${prod.stock}, solicitados: ${itemReq.quantity}.`,
        };
      }
      const subtotalCents = prod.priceCents * itemReq.quantity;
      totalCents += subtotalCents;
      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        productImageUrl: prod.imageUrl,
        unitPriceCents: prod.priceCents,
        quantity: itemReq.quantity,
        subtotalCents,
      });
    }

    // 2. Descontar stock (reserva atómica única)
    for (const itemReq of params.items) {
      const prod = data.products.find((p) => p.id === itemReq.productId)!;
      prod.stock -= itemReq.quantity;
      prod.updatedAt = new Date().toISOString();
    }

    // 3. Generar número correlativo
    data.orderCounter += 1;
    const orderCode = generateOrderCode(data.orderCounter);
    const nowIso = new Date().toISOString();

    const newOrder: Order = {
      id: generateId('ord'),
      orderCode,
      businessId: business.id,
      businessName: business.name,
      businessWhatsapp: business.whatsapp,
      customerId: params.customerId,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      deliveryType: params.deliveryType,
      deliveryAddress: params.deliveryAddress,
      notes: params.notes,
      items: orderItems,
      totalCents,
      status: 'pendiente',
      statusHistory: [
        {
          status: 'pendiente',
          timestamp: nowIso,
          note: 'Pedido registrado en plataforma JUÁCIL.',
        },
      ],
      stockRestoredOnCancel: false,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    data.orders.push(newOrder);
    this.save(data);

    return { success: true, order: newOrder };
  }

  /**
   * Cambia el estado del pedido validando máquina de estados
   */
  public static updateOrderStatus(
    orderId: string,
    targetStatus: OrderStatus,
    note?: string
  ): { success: boolean; error?: string; order?: Order } {
    const data = this.load();
    const order = data.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Pedido no encontrado.' };
    }

    if (!canTransitionOrder(order.status, targetStatus)) {
      return {
        success: false,
        error: `No es posible pasar del estado "${order.status}" a "${targetStatus}".`,
      };
    }

    const nowIso = new Date().toISOString();
    order.status = targetStatus;
    order.updatedAt = nowIso;
    order.statusHistory.push({
      status: targetStatus,
      timestamp: nowIso,
      note: note || `Estado actualizado a ${targetStatus}`,
    });

    // Si cancela, reponer stock exactamente una vez
    if (targetStatus === 'cancelado' && !order.stockRestoredOnCancel) {
      for (const item of order.items) {
        const prod = data.products.find((p) => p.id === item.productId);
        if (prod) {
          prod.stock += item.quantity;
          prod.updatedAt = nowIso;
        }
      }
      order.stockRestoredOnCancel = true;
    }

    this.save(data);
    return { success: true, order };
  }

  /**
   * Cancelación explícita con restauración de stock
   */
  public static cancelOrder(orderId: string, reason?: string): { success: boolean; error?: string } {
    return this.updateOrderStatus(orderId, 'cancelado', reason || 'Cancelado por el usuario.');
  }
}
