import React, { createContext, useContext, useState, useEffect } from 'react';
import { Cart, CartItem } from '@/entities/cart/model/types';
import { Product } from '@/entities/product/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';

interface AddItemResult {
  success: boolean;
  needsConfirmation?: boolean;
  otherBusinessName?: string;
  error?: string;
}

interface CartContextType {
  cart: Cart;
  itemCount: number;
  totalCents: number;
  addItem: (product: Product, quantity?: number) => AddItemResult;
  confirmReplaceCart: () => void;
  cancelReplaceCart: () => void;
  updateQuantity: (productId: string, quantity: number) => { success: boolean; error?: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;
  // Estado para el modal de confirmación de reemplazo
  isReplaceModalOpen: boolean;
  pendingItem: { product: Product; quantity: number } | null;
  currentBusinessName: string;
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

function calculateCartTotals(items: CartItem[]): { totalCents: number; itemCount: number } {
  let totalCents = 0;
  let itemCount = 0;
  for (const item of items) {
    totalCents += item.subtotalCents;
    itemCount += item.quantity;
  }
  return { totalCents, itemCount };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Cart;
        if (parsed && Array.isArray(parsed.items)) return parsed;
      }
    } catch {
      // Ignorar error y usar vacío
    }
    return EMPTY_CART;
  });

  const [pendingItem, setPendingItem] = useState<{ product: Product; quantity: number } | null>(null);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);

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

    const business = LocalStoreRepository.getBusinessById(product.businessId);
    const businessName = business?.name || 'Tienda aliada';

    // 2. Si el carrito ya tiene artículos de OTRO negocio -> Solicitar confirmación obligatoria (P02)
    if (cart.businessId && cart.businessId !== product.businessId && cart.items.length > 0) {
      setPendingItem({ product, quantity });
      setIsReplaceModalOpen(true);
      return {
        success: false,
        needsConfirmation: true,
        otherBusinessName: cart.businessName || 'otra tienda',
      };
    }

    // 3. Mismo negocio o carrito vacío: agregar o sumar
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

    const { totalCents, itemCount } = calculateCartTotals(newItems);

    setCart({
      businessId: product.businessId,
      businessName,
      items: newItems,
      totalCents,
      itemCount,
    });

    return { success: true };
  };

  const confirmReplaceCart = () => {
    if (!pendingItem) return;

    const { product, quantity } = pendingItem;
    const business = LocalStoreRepository.getBusinessById(product.businessId);
    const businessName = business?.name || 'Tienda aliada';

    const newItem: CartItem = {
      productId: product.id,
      product,
      quantity,
      unitPriceCents: product.priceCents,
      subtotalCents: product.priceCents * quantity,
    };

    setCart({
      businessId: product.businessId,
      businessName,
      items: [newItem],
      totalCents: newItem.subtotalCents,
      itemCount: quantity,
    });

    setPendingItem(null);
    setIsReplaceModalOpen(false);
  };

  const cancelReplaceCart = () => {
    setPendingItem(null);
    setIsReplaceModalOpen(false);
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

    const { totalCents, itemCount } = calculateCartTotals(newItems);

    setCart({
      ...cart,
      items: newItems,
      totalCents,
      itemCount,
    });

    return { success: true };
  };

  const removeItem = (productId: string) => {
    const newItems = cart.items.filter((it) => it.productId !== productId);
    if (newItems.length === 0) {
      clearCart();
    } else {
      const { totalCents, itemCount } = calculateCartTotals(newItems);
      setCart({
        ...cart,
        items: newItems,
        totalCents,
        itemCount,
      });
    }
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
        confirmReplaceCart,
        cancelReplaceCart,
        updateQuantity,
        removeItem,
        clearCart,
        isReplaceModalOpen,
        pendingItem,
        currentBusinessName: cart.businessName || 'la tienda actual',
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
