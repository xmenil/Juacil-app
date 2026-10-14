import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, UserRound } from 'lucide-react';
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
  const { currentUser, loginAs } = useSession();
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  return <div className={styles.page}><div className="container">
    {completedOrder && completedOrder.customerId === currentUser?.id ? <CheckoutConfirmation order={completedOrder} />
      : !cart.items.length ? <section className={styles.gate}>
        <ShoppingBag size={36} aria-hidden="true" /><h1>No hay productos para confirmar</h1><p>Agrega productos a tu carrito para preparar un pedido.</p><Link className={styles.primaryLink} to={ROUTES.CATALOG}>Explorar productos</Link>
      </section>
      : !currentUser || currentUser.role !== 'cliente' ? <section className={styles.gate}>
        <UserRound size={36} aria-hidden="true" /><h1>{currentUser ? 'Usa un perfil de cliente para comprar' : 'Inicia sesión para registrar tu pedido'}</h1>
        <p>Tu carrito de <strong>{cart.businessName}</strong> se conserva mientras eliges una cuenta de cliente.</p>
        <Link className={styles.primaryLink} to={`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`}>Ir al acceso</Link>
        <Button variant="outline" onClick={() => loginAs('user-client-01')}>Probar como Lucía (cliente demo)</Button>
        <Link className={styles.backLink} to={ROUTES.CART}><ArrowLeft size={17} aria-hidden="true" />Volver al carrito</Link>
      </section>
      : <CheckoutForm key={currentUser.id} user={currentUser} onCompleted={setCompletedOrder} />}
  </div></div>;
}
