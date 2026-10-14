import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import {
  ShoppingBag,
  X,
  Trash2,
  Minus,
  Plus,
  Store,
  ArrowRight,
  Lock,
} from 'lucide-react';
import styles from './CartDrawer.module.css';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    itemCount,
    totalCents,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { currentUser } = useSession();
  const navigate = useNavigate();

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  // Prevenir scroll de fondo cuando la bandeja está abierta
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    closeDrawer();
    if (!currentUser) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
    } else {
      navigate(ROUTES.CHECKOUT);
    }
  };

  const handleGoToFullCart = () => {
    closeDrawer();
    navigate(ROUTES.CART);
  };

  return (
    <div className={styles.overlay} onClick={closeDrawer} role="dialog" aria-modal="true">
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleWrap}>
            <ShoppingBag size={20} color="#0b4526" />
            <h2 className={styles.drawerTitle}>Bandeja de Compras</h2>
            {itemCount > 0 && <span className={styles.drawerBadge}>{itemCount}</span>}
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={closeDrawer}
            aria-label="Cerrar bandeja"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tienda activa */}
        {cart.businessName && (
          <div className={styles.storeNotice}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={14} />
              <span>
                Pedido para: <strong>{cart.businessName}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={clearCart}
              style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              Vaciar
            </button>
          </div>
        )}

        {/* Lista de Artículos */}
        {cart.items.length > 0 ? (
          <div className={styles.itemsList}>
            {cart.items.map((item) => (
              <div key={item.productId} className={styles.itemRow}>
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className={styles.itemThumb}
                />

                <div className={styles.itemInfo}>
                  <span className={styles.itemName} title={item.product.name}>
                    {item.product.name}
                  </span>
                  <span className={styles.itemPrice}>
                    {formatMoney(item.subtotalCents)}
                  </span>

                  <div className={styles.qtyRow}>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      aria-label="Disminuir"
                    >
                      <Minus size={11} />
                    </button>
                    <span className={styles.qtyCount}>{item.quantity}</span>
                    <button
                      type="button"
                      className={styles.qtyBtn}
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      aria-label="Aumentar"
                    >
                      <Plus size={11} />
                    </button>

                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      onClick={() => removeItem(item.productId)}
                      title="Eliminar producto"
                      aria-label={`Eliminar ${item.product.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrap}>
              <ShoppingBag size={32} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 6px 0', color: '#0f172a' }}>
              Tu bandeja está vacía
            </h3>
            <p style={{ fontSize: '13px', margin: '0 0 16px 0' }}>
              Agrega productos de las bodegas y emprendimientos de Tingo María y la Selva Central.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                closeDrawer();
                navigate(ROUTES.CATALOG);
              }}
            >
              Explorar Catálogo
            </Button>
          </div>
        )}

        {/* Footer */}
        {cart.items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.subtotalRow}>
              <span>Subtotal:</span>
              <span style={{ color: '#0b4526' }}>{formatMoney(totalCents)}</span>
            </div>

            <p className={styles.shippingNote}>
              🛵 El flete o recojo se coordina directamente con el vendedor por WhatsApp.
            </p>

            {!currentUser && (
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  marginBottom: '12px',
                  lineHeight: 1.4,
                }}
              >
                <Lock size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  <strong>Exploración libre:</strong> Puedes ver todo el catálogo y agregar artículos sin cuenta. Para completar tu orden te pediremos iniciar sesión.
                </span>
              </div>
            )}

            <div className={styles.btnGroup}>
              <Button
                fullWidth
                size="lg"
                variant="accent"
                rightIcon={currentUser ? <ArrowRight size={16} /> : <Lock size={16} />}
                onClick={handleProceedToCheckout}
              >
                {currentUser ? 'Continuar con el Pedido' : 'Iniciar Sesión y Comprar'}
              </Button>

              <Button
                fullWidth
                size="sm"
                variant="ghost"
                onClick={handleGoToFullCart}
              >
                Ver Carrito Detallado
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
