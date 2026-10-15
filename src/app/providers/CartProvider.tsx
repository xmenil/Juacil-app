import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '@/entities/cart/model/types';
import { Product } from '@/entities/product/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

interface AddItemResult {
  success: boolean;
  error?: string;
}

/** Señal que cambia cada vez que se agrega un producto; la usa el navbar para animar el contador. */
export interface CartAddSignal {
  id: number;
  productName: string;
  quantity: number;
}

interface CartContextType {
  cart: Cart;
  itemCount: number;
  totalCents: number;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  removeItem: (productId: string) => void;
  /** Retira del carrito los productos de una tienda (p. ej. después de registrar su pedido). */
  removeBusinessItems: (businessId: string) => void;
  clearCart: () => void;
  lastAdded: CartAddSignal | null;
  // Estado para la bandeja deslizante del carrito
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'juacil_cart_store_v1.0';

const EMPTY_CART: Cart = {
  businessId: null,
  businessName: null,
  items: [],
  totalCents: 0,
  itemCount: 0,
};

/**
 * Recalcula totales y la tienda única del carrito.
 * El carrito admite productos de varias tiendas: al confirmar se registra un pedido por tienda.
 * `businessId` / `businessName` solo se completan cuando todos los productos son de la misma tienda.
 */
function buildCart(items: CartItem[]): Cart {
  if (!items.length) return EMPTY_CART;
  let totalCents = 0;
  let itemCount = 0;
  for (const item of items) {
    totalCents += item.subtotalCents;
    itemCount += item.quantity;
  }
  const businessIds = new Set(items.map((item) => item.product.businessId));
  const singleId = businessIds.size === 1 ? items[0].product.businessId : null;
  const singleName = singleId ? LocalStoreRepository.getBusinessById(singleId)?.name || 'Tienda aliada' : null;
  return { businessId: singleId, businessName: singleName, items, totalCents, itemCount };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Cart;
        if (parsed && Array.isArray(parsed.items)) return buildCart(parsed.items);
      }
    } catch {
      // Ignorar error y usar vacío
    }
    return EMPTY_CART;
  });

  const [lastAdded, setLastAdded] = useState<CartAddSignal | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Error al persistir carrito en localStorage', e);
    }
  }, [cart]);

  const addItem = (product: Product, quantity = 1): AddItemResult => {
    // 1. Validar disponibilidad
    if (product.stock <= 0) {
      return { success: false, error: 'Este producto se encuentra agotado.' };
    }

    // 2. Agregar o sumar (se permiten productos de varias tiendas en el mismo carrito)
    const existingIndex = cart.items.findIndex((it) => it.productId === product.id);
    let newItems: CartItem[] = [];

    if (existingIndex >= 0) {
      const currentItem = cart.items[existingIndex];
      const newQty = currentItem.quantity + quantity;

      if (newQty > product.stock) {
        return {
          success: false,
          error: `Solo hay ${product.stock} unidades disponibles en inventario.`,
        };
      }

      newItems = cart.items.map((it, idx) =>
        idx === existingIndex
          ? {
              ...it,
              quantity: newQty,
              subtotalCents: it.unitPriceCents * newQty,
            }
          : it
      );
    } else {
      if (quantity > product.stock) {
        return {
          success: false,
          error: `Solo hay ${product.stock} unidades disponibles en inventario.`,
        };
      }

      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        unitPriceCents: product.priceCents,
        subtotalCents: product.priceCents * quantity,
      };
      newItems = [...cart.items, newItem];
    }

    setCart(buildCart(newItems));
    setLastAdded({ id: Date.now(), productName: product.name, quantity });

    return { success: true };
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return { success: true };
    }

    const item = cart.items.find((it) => it.productId === productId);
    if (!item) return { success: false, error: 'Producto no encontrado en carrito.' };

    const freshProd = LocalStoreRepository.getProductById(productId);
    const availableStock = freshProd ? freshProd.stock : item.product.stock;

    if (quantity > availableStock) {
      return {
        success: false,
        error: `Solo quedan ${availableStock} unidades disponibles en inventario.`,
      };
    }

    const newItems = cart.items.map((it) =>
      it.productId === productId
        ? {
            ...it,
            quantity,
            subtotalCents: it.unitPriceCents * quantity,
          }
        : it
    );

    setCart(buildCart(newItems));

    return { success: true };
  };

  const removeItem = (productId: string) => {
    setCart((current) => buildCart(current.items.filter((it) => it.productId !== productId)));
  };

  const removeBusinessItems = (businessId: string) => {
    setCart((current) => buildCart(current.items.filter((it) => it.product.businessId !== businessId)));
  };

  const clearCart = () => {
    setCart(EMPTY_CART);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.itemCount,
        totalCents: cart.totalCents,
        addItem,
        updateQuantity,
        removeItem,
        removeBusinessItems,
        clearCart,
        lastAdded,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
