import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Store, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { CartItems } from '@/features/cart/CartItems';
import { CartSummary } from '@/features/cart/CartSummary';
import { CartEmptyState } from '@/features/cart/CartEmptyState';
import { getCartIssue } from '@/features/cart/cartAvailability';
import { groupCartByBusiness } from '@/features/cart/cartGroups';
import { selectCartItems } from '@/features/cart/cartSelection';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import styles from './CartPage.module.css';
import buttonStyles from '@/shared/ui/Button.module.css';

export function CartPage() {
  const { cart, clearCart, removeBusinessItems } = useCart();
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [, refreshAvailability] = useState(0);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const selectedIds = cart.items.filter(item => !excludedIds.includes(item.productId)).map(item => item.productId);
  const selectedCart = selectCartItems(cart, selectedIds);
  const toggleSelection = (id: string) => setExcludedIds(ids => ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id]);

  const groups = groupCartByBusiness(cart);
  const issue = selectedIds.length ? getCartIssue(selectedCart) : 'Selecciona al menos un producto para continuar.';

  const proceed = () => {
    const freshIssue = selectedIds.length ? getCartIssue(selectedCart) : 'Selecciona un producto.';
    if (freshIssue) refreshAvailability(value => value + 1);
    const checkoutUrl = `${ROUTES.CHECKOUT}?${new URLSearchParams({ productos: JSON.stringify(selectedIds) })}`;
    if (!freshIssue) navigate(currentUser ? checkoutUrl : `${ROUTES.LOGIN}?redirect=${encodeURIComponent(checkoutUrl)}`);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <nav className={styles.navigation} aria-label="Navegación del carrito">
          <Link className={styles.backLink} to={ROUTES.CATALOG}>
            <ArrowLeft size={17} aria-hidden="true" /> Seguir explorando
          </Link>
          <Link
            className={`${buttonStyles.button} ${buttonStyles.md} ${buttonStyles.outline} ${styles.ordersLink}`}
            to={currentUser ? ROUTES.CUSTOMER_ORDERS : `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CUSTOMER_ORDERS)}`}
          >
            <ShoppingBag size={18} aria-hidden="true" /> Pedidos y compras
          </Link>
        </nav>

        {!cart.items.length ? (
          <CartEmptyState onBrowse={() => navigate(ROUTES.CATALOG)} />
        ) : (
          <>
            <header className={styles.header}>
              <div>
                <h1>Tu carrito</h1>
                <p>
                  {groups.length > 1
                    ? `Tienes productos de ${groups.length} tiendas. Selecciona cuáles quieres comprar.`
                    : 'Selecciona los productos que quieres comprar ahora.'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span>{cart.itemCount} {cart.itemCount === 1 ? 'unidad' : 'unidades'}</span>
                <button
                  className={styles.clear}
                  aria-label="Vaciar carrito"
                  onClick={() => setConfirmClear(true)}
                  title="Vaciar todo el carrito"
                >
                  <Trash2 size={16} aria-hidden="true" />
                  <span>Vaciar todo</span>
                </button>
              </div>
            </header>

            <div className={styles.layout}>
              <div className={styles.storeGroupsList}>
                <label className={styles.selectAll}><input type="checkbox" checked={selectedIds.length === cart.items.length} onChange={() => setExcludedIds(selectedIds.length === cart.items.length ? cart.items.map(item => item.productId) : [])} />Seleccionar todos los productos</label>
                {groups.map((group) => (
                  <section
                    key={group.businessId}
                    className={styles.products}
                    aria-label={`Productos de ${group.businessName}`}
                  >
                    <div className={styles.storeHeader}>
                      <span className={styles.storeIcon}>
                        <Store size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <span>Tienda</span>
                        <Link to={ROUTES.STORE_DETAIL(group.businessId)}>
                          {group.businessName}
                          <ArrowUpRight size={16} aria-hidden="true" />
                        </Link>
                        {group.business?.location && <p>{group.business.location}</p>}
                      </div>
                      <button
                        className={styles.clear}
                        aria-label={`Quitar productos de ${group.businessName}`}
                        onClick={() => removeBusinessItems(group.businessId)}
                        title="Quitar productos de esta tienda"
                      >
                        <Trash2 size={16} aria-hidden="true" />
                        <span>Quitar tienda</span>
                      </button>
                    </div>

                    <CartItems items={group.items} selectedIds={selectedIds} onSelect={toggleSelection} />

                    <div className={styles.storeFooter}>
                      <span className={styles.storeSubtotal}>
                        Subtotal tienda ({group.itemCount} unids): <strong>{formatMoney(group.totalCents)}</strong>
                      </span>
                      <Link className={styles.storeLinkSmall} to={ROUTES.STORE_DETAIL(group.businessId)}>
                        + Agregar más de esta tienda
                      </Link>
                    </div>
                  </section>
                ))}

                <p className={styles.note}>
                  Solo se comprarán los productos seleccionados. Los demás permanecerán en tu carrito. Se creará un pedido por cada tienda seleccionada.
                </p>
              </div>

              <aside className={styles.summary} aria-label="Resumen de compra">
                <CartSummary onContinue={proceed} issue={issue} selectedCart={selectedCart} />
              </aside>
            </div>
          </>
        )}

        <Modal
          isOpen={confirmClear && !!cart.items.length}
          onClose={() => setConfirmClear(false)}
          title="¿Vaciar tu carrito?"
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmClear(false)}>
                Conservar productos
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  clearCart();
                  setConfirmClear(false);
                }}
              >
                Vaciar carrito
              </Button>
            </>
          }
        >
          <p>
            Se retirarán todas las {cart.itemCount} unidades del carrito. No se cancelarán pedidos ya registrados.
          </p>
          <p className={styles.confirmNote}>Puedes volver a agregar productos desde el catálogo.</p>
        </Modal>
      </div>
    </div>
  );
}
