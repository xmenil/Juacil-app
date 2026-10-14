import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, ArrowUpRight, Trash2 } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ROUTES } from '@/shared/config/routes';
import { CartItems } from './CartItems';
import { CartSummary } from './CartSummary';
import { CartEmptyState } from './CartEmptyState';
import { getCartIssue } from './cartAvailability';
import styles from './CartDrawer.module.css';

function DrawerContent() {
  const { cart, clearCart, closeDrawer } = useCart();
  const { currentUser } = useSession();
  const navigate = useNavigate();
  const [confirmClear, setConfirmClear] = useState(false);
  const [, refreshAvailability] = useState(0);
  const issue = getCartIssue(cart);
  const goTo = (path: string) => { closeDrawer(); navigate(path); };
  const proceed = () => {
    const freshIssue = getCartIssue(cart);
    if (freshIssue) refreshAvailability(value => value + 1);
    if (!freshIssue) goTo(currentUser ? ROUTES.CHECKOUT : `${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
  };
  return <Modal isOpen onClose={closeDrawer} title={confirmClear ? '¿Vaciar tu carrito?' : 'Tu carrito'} variant="drawer"
    footer={cart.items.length && !confirmClear ? <><CartSummary compact onContinue={proceed} issue={issue} /><Button fullWidth variant="ghost" className={styles.fullCart} onClick={() => goTo(ROUTES.CART)}>Ver carrito completo</Button></> : undefined}>
    {confirmClear ? <div className={styles.confirm}>
      <Trash2 size={28} aria-hidden="true" /><h3>Retirar todos los productos</h3><p>Se quitarán las {cart.itemCount} unidades de <strong>{cart.businessName}</strong>. Los pedidos registrados se conservarán.</p>
      <Button autoFocus variant="outline" onClick={() => setConfirmClear(false)}>Conservar productos</Button>
      <Button variant="danger" onClick={() => { clearCart(); setConfirmClear(false); }}>Vaciar carrito</Button>
    </div> : !cart.items.length ? <CartEmptyState compact onBrowse={() => goTo(ROUTES.CATALOG)} /> : <>
      <div className={styles.storeHeader}><Store size={20} aria-hidden="true" /><div><span>Productos de</span><Link to={ROUTES.STORE_DETAIL(cart.businessId!)} onClick={closeDrawer}>{cart.businessName}<ArrowUpRight size={15} aria-hidden="true" /></Link></div><button onClick={() => setConfirmClear(true)} className={styles.clear} aria-label="Vaciar carrito"><Trash2 size={18} aria-hidden="true" /></button></div>
      <CartItems onNavigate={closeDrawer} />
    </>}
  </Modal>;
}

export function CartDrawer() {
  const { isDrawerOpen, isReplaceModalOpen } = useCart();
  return isDrawerOpen && !isReplaceModalOpen ? <DrawerContent /> : null;
}
