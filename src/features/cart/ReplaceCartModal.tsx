import { useState } from 'react';
import { Store, ArrowDown } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import styles from './ReplaceCartModal.module.css';

function ReplacementDialog() {
  const { cart, pendingItem, currentBusinessName, confirmReplaceCart, cancelReplaceCart } = useCart();
  const [error, setError] = useState('');
  if (!pendingItem) return null;
  const business = LocalStoreRepository.getBusinessById(pendingItem.product.businessId);
  const replace = () => {
    const current = LocalStoreRepository.getProductById(pendingItem.product.id);
    if (!current || current.status !== 'published' || current.stock < pendingItem.quantity) {
      setError('El nuevo producto ya no está disponible en esa cantidad. Conserva tu carrito y revisa el catálogo.'); return;
    }
    confirmReplaceCart();
  };
  return <Modal isOpen onClose={cancelReplaceCart} title="¿Cambiar de tienda?"
    footer={<><Button variant="outline" onClick={cancelReplaceCart}>Conservar mi carrito</Button><Button onClick={replace}>Cambiar de tienda</Button></>}>
    <div className={styles.content}>
      <p>Cada pedido corresponde a una sola tienda. Para agregar este producto, debes reemplazar tu selección actual.</p>
      <div className={styles.current}><span>Tu carrito actual</span><strong>{currentBusinessName}</strong><p>{cart.itemCount} {cart.itemCount === 1 ? 'unidad' : 'unidades'} · {formatMoney(cart.totalCents)}</p></div>
      <ArrowDown size={20} className={styles.arrow} aria-hidden="true" />
      <div className={styles.next}><Store size={20} aria-hidden="true" /><div><span>Nueva tienda</span><strong>{business?.name || 'Tienda del producto'}</strong><p>{pendingItem.quantity} × {pendingItem.product.name}</p><p>{formatMoney(pendingItem.product.priceCents * pendingItem.quantity)}</p></div></div>
      <p className={styles.warning}>Se retirarán los productos de {currentBusinessName}. Los pedidos que ya registraste no cambiarán.</p>
      {error && <p className={styles.error} role="alert">{error}</p>}
    </div>
  </Modal>;
}

export function ReplaceCartModal() {
  const { isReplaceModalOpen, pendingItem } = useCart();
  return isReplaceModalOpen && pendingItem ? <ReplacementDialog /> : null;
}
