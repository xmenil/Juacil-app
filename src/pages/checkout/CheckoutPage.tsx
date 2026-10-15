import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { selectCartItems } from '@/features/cart/cartSelection';
import { ArrowLeft, ShoppingCart, UserRound } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import type { Order } from '@/entities/order/model/types';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { CheckoutForm } from './CheckoutForm';
import { CheckoutConfirmation } from './CheckoutConfirmation';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { cart } = useCart();
  const [params] = useSearchParams();
  let selectedIds: string[] | null = null;
  if (params.has('productos')) {
    try { const value: unknown = JSON.parse(params.get('productos')!); selectedIds = Array.isArray(value) && value.every(id => typeof id === 'string') ? value : []; }
    catch { selectedIds = []; }
  }
  const selectedCart = selectCartItems(cart, selectedIds);
  const checkoutUrl = `${ROUTES.CHECKOUT}${params.size ? `?${params}` : ''}`;
  const { currentUser, loginAs } = useSession();
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  return <div className={styles.page}><div className="container">
    {completedOrders.length > 0 && completedOrders[0].customerId === currentUser?.id ? <CheckoutConfirmation orders={completedOrders} />
      : !selectedCart.items.length ? <section className={styles.gate}>
        <ShoppingCart size={36} aria-hidden="true" /><h1>No hay productos para confirmar</h1><p>Agrega o selecciona productos en tu carrito para preparar un pedido.</p><Link className={styles.primaryLink} to={ROUTES.CATALOG}>Explorar productos</Link><Link className={styles.backLink} to={ROUTES.CART}>Volver al carrito</Link>
      </section>
      : !currentUser || currentUser.role !== 'cliente' ? <section className={styles.gate}>
        <UserRound size={36} aria-hidden="true" /><h1>{currentUser ? 'Usa un perfil de cliente para comprar' : 'Inicia sesión para registrar tu pedido'}</h1>
        <p>Tu carrito{cart.businessName ? <> de <strong>{cart.businessName}</strong></> : ` (${cart.itemCount} unidades)`} se conserva mientras eliges una cuenta de cliente.</p>
        <Link className={styles.primaryLink} to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(checkoutUrl)}`}>Ir al acceso</Link>
        <Button variant="outline" onClick={() => loginAs('user-client-01')}>Probar como Lucía (cliente demo)</Button>
        <Link className={styles.backLink} to={ROUTES.CART}><ArrowLeft size={17} aria-hidden="true" />Volver al carrito</Link>
      </section>
      : <CheckoutForm key={`${currentUser.id}:${params}`} user={currentUser} selectedIds={selectedIds} onCompleted={setCompletedOrders} />}
  </div></div>;
}
