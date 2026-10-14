import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Store, Trash2 } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { CartItems } from '@/features/cart/CartItems';
import { CartSummary } from '@/features/cart/CartSummary';
import { CartEmptyState } from '@/features/cart/CartEmptyState';
import { getCartIssue } from '@/features/cart/cartAvailability';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import styles from './CartPage.module.css';

export function CartPage() {
  const { cart, clearCart } = useCart();
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [, refreshAvailability] = useState(0);
  const business = cart.businessId ? LocalStoreRepository.getBusinessById(cart.businessId) : undefined;
  const issue = getCartIssue(cart);
  const proceed = () => {
    const freshIssue = getCartIssue(cart);
    if (freshIssue) refreshAvailability(value => value + 1);
    if (!freshIssue) navigate(currentUser ? ROUTES.CHECKOUT : `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
  };
  return <div className={styles.page}><div className="container">
    <Link className={styles.backLink} to={ROUTES.CATALOG}><ArrowLeft size={17} aria-hidden="true" />Seguir explorando</Link>
    {!cart.items.length ? <CartEmptyState onBrowse={() => navigate(ROUTES.CATALOG)} /> : <>
      <header className={styles.header}><div><h1>Tu carrito</h1><p>Revisa tus productos antes de preparar el pedido.</p></div><span>{cart.itemCount} {cart.itemCount === 1 ? 'unidad' : 'unidades'}</span></header>
      <div className={styles.layout}>
        <section className={styles.products} aria-label="Productos seleccionados">
          <div className={styles.storeHeader}>
            <span className={styles.storeIcon}><Store size={22} aria-hidden="true" /></span>
            <div><span>Tu pedido es de</span><Link to={ROUTES.STORE_DETAIL(cart.businessId!)}>{cart.businessName}<ArrowUpRight size={16} aria-hidden="true" /></Link>{business?.location && <p>{business.location}</p>}</div>
            <button className={styles.clear} aria-label="Vaciar carrito" onClick={() => setConfirmClear(true)}><Trash2 size={17} aria-hidden="true" /><span>Vaciar carrito</span></button>
          </div>
          <CartItems />
          <p className={styles.note}>Un negocio por pedido. Si eliges productos de otra tienda, te pediremos confirmar el cambio.</p>
        </section>
        <aside className={styles.summary} aria-label="Resumen de compra"><CartSummary onContinue={proceed} issue={issue} /><Link className={styles.storeLink} to={ROUTES.STORE_DETAIL(cart.businessId!)}>Agregar más de esta tienda <ArrowUpRight size={16} aria-hidden="true" /></Link></aside>
      </div>
    </>}
    <Modal isOpen={confirmClear && !!cart.items.length} onClose={() => setConfirmClear(false)} title="¿Vaciar tu carrito?"
      footer={<><Button variant="outline" onClick={() => setConfirmClear(false)}>Conservar productos</Button><Button variant="danger" onClick={() => { clearCart(); setConfirmClear(false); }}>Vaciar carrito</Button></>}>
      <p>Se retirarán las {cart.itemCount} unidades de <strong>{cart.businessName}</strong>. No se cancelarán pedidos ya registrados.</p>
      <p className={styles.confirmNote}>Puedes volver a agregar productos desde el catálogo.</p>
    </Modal>
  </div></div>;
}
