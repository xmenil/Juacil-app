import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/app/providers/CartProvider';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { ShoppingBag, Trash2, Minus, Plus, Store, ArrowRight } from 'lucide-react';
import styles from './CartPage.module.css';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.emptyBox}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-subtle)' }}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Tu carrito está vacío</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Aún no has agregado productos de la Selva Central. Explora cafés, mieles, chocolates o
              artesanías disponibles.
            </p>
            <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.CATALOG)}>
              Ir al Catálogo de Productos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Carrito de Compras</h1>

        <div className={styles.layout}>
          {/* Listado de Artículos */}
          <div className={styles.itemsList}>
            <div className={styles.storeNotice}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={18} color="var(--color-primary-700)" />
                <span>
                  Pedido para: <strong>{cart.businessName}</strong>
                </span>
              </div>
              <Button size="sm" variant="ghost" onClick={clearCart}>
                Vaciar carrito
              </Button>
            </div>

            {cart.items.map((item) => (
              <div key={item.productId} className={styles.cartItem}>
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className={styles.itemImage}
                />

                <div className={styles.itemInfo}>
                  <Link
                    to={ROUTES.PRODUCT_DETAIL(item.productId)}
                    className={styles.itemName}
                  >
                    {item.product.name}
                  </Link>
                  <span className={styles.itemPrice}>
                    {formatMoney(item.unitPriceCents)} c/u
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                    Disponibles: {item.product.stock} unids.
                  </span>
                </div>

                <div className={styles.itemActions}>
                  <span className={styles.subtotal}>{formatMoney(item.subtotalCents)}</span>

                  <div className={styles.qtyControl}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Disminuir"
                    >
                      <Minus size={12} />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      aria-label="Aumentar"
                    >
                      <Plus size={12} />
                    </button>

                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => removeItem(item.productId)}
                      style={{ color: 'var(--color-danger)', marginLeft: '4px' }}
                      title="Eliminar producto"
                      aria-label={`Eliminar ${item.product.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del Pedido */}
          <aside className={styles.summaryCard} aria-label="Resumen de compra">
            <h2 className={styles.summaryTitle}>Resumen del Pedido</h2>

            <div className={styles.summaryRow}>
              <span>Subtotal ({cart.itemCount} productos):</span>
              <strong>{formatMoney(cart.totalCents)}</strong>
            </div>

            <div className={styles.summaryRow}>
              <span>Costo de envío:</span>
              <span style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
                Por coordinar con la MYPE
              </span>
            </div>

            <div className={styles.summaryTotalRow}>
              <span>Total Estimado:</span>
              <span>{formatMoney(cart.totalCents)}</span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', lineHeight: 1.4 }}>
              📌 El pago se coordina directamente con el vendedor por Yape, Plin o contraentrega.
            </div>

            <Button
              fullWidth
              size="lg"
              variant="accent"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate(ROUTES.CHECKOUT)}
            >
              Continuar con el Pedido
            </Button>
          </aside>
        </div>
      </div>
    </div>
  );
};
