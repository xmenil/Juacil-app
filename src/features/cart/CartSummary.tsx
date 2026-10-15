import { ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { formatMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import styles from './CartSummary.module.css';
import type { Cart } from '@/entities/cart/model/types';

export function CartSummary({ onContinue, compact = false, issue, selectedCart }: { onContinue: () => void; compact?: boolean; issue: string | null; selectedCart?: Cart }) {
  const { cart: fullCart } = useCart();
  const cart = selectedCart ?? fullCart;
  const { currentUser } = useSession();
  const { isOnline } = useConnectivity();
  return <div className={compact ? styles.compact : styles.summary}>
    {!compact && <h2>{selectedCart ? 'Productos seleccionados' : 'Resumen de tu pedido'}</h2>}
    <div className={styles.total}><div><span>Total de productos</span><small>{cart.itemCount} {cart.itemCount === 1 ? 'unidad' : 'unidades'} · {cart.items.length} {cart.items.length === 1 ? 'producto' : 'productos'}</small></div><strong>{formatMoney(cart.totalCents)}</strong></div>
    <p className={styles.delivery}>Entrega o recojo por coordinar con la tienda. El total no incluye un costo de envío.</p>
    {!compact && <p className={styles.payment}>El pago se acuerda directamente con el vendedor. Aquí registrarás un pedido de demostración.</p>}
    {issue && <p className={styles.issue} role="alert">{issue}</p>}
    {!isOnline && <p className={styles.issue}>Estás sin conexión. Puedes revisar el carrito; para confirmar el pedido necesitarás conexión.</p>}
    {!currentUser && <p className={styles.account}>Tu carrito se conserva al iniciar sesión.</p>}
    <Button fullWidth size="lg" className={styles.continue} disabled={!!issue} rightIcon={currentUser ? <ArrowRight size={18} /> : <LogIn size={18} />} onClick={onContinue}>{currentUser ? 'Continuar con mi pedido' : 'Iniciar sesión para continuar'}</Button>
  </div>;
}
