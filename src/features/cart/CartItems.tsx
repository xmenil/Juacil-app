import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, Package } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import type { CartItem } from '@/entities/cart/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import styles from './CartItems.module.css';

function CartItemRow({ item, onNavigate, onFeedback, selected, onSelect }: { item: CartItem; onNavigate?: () => void; onFeedback: (message: string, error?: boolean) => void; selected?: boolean; onSelect?: (id: string) => void }) {
  const { updateQuantity, removeItem } = useCart();
  const [imageFailed, setImageFailed] = useState(false);
  const current = LocalStoreRepository.getProductById(item.productId);
  const available = current?.status === 'published';
  const stock = available ? current.stock : 0;
  const needsAdjustment = item.quantity > stock;
  const changeQuantity = (quantity: number) => {
    const result = updateQuantity(item.productId, quantity);
    onFeedback(result.success ? `Cantidad de ${item.product.name}: ${quantity}.` : result.error || 'No se pudo cambiar la cantidad.', !result.success);
  };
  return <li className={styles.item}>
    <div className={styles.image}>
      {item.product.imageUrl && !imageFailed ? <img src={item.product.imageUrl} alt={item.product.imageAlt || item.product.name} loading="lazy" onError={() => setImageFailed(true)} /> : <Package size={26} aria-label="Producto sin imagen" />}
    </div>
    <div className={styles.info}>
      {onSelect && <label className={styles.selection}><input type="checkbox" checked={selected} onChange={() => onSelect(item.productId)} aria-label={`Comprar ${item.product.name}`} />Seleccionar para comprar</label>}
      <Link to={ROUTES.PRODUCT_DETAIL(item.productId)} onClick={onNavigate} className={styles.name}>{item.product.name}</Link>
      <span className={styles.unitPrice}>{formatMoney(item.unitPriceCents)} por unidad</span>
      <span className={needsAdjustment ? styles.stockWarning : styles.stock}>{!available ? 'Producto no disponible' : stock === 0 ? 'Agotado' : `${stock} unidades disponibles`}</span>
      {current && current.priceCents !== item.unitPriceCents && <span className={styles.stockWarning}>El precio actual es {formatMoney(current.priceCents)}. Se verificará al confirmar.</span>}
    </div>
    <strong className={styles.subtotal}>{formatMoney(item.subtotalCents)}</strong>
    <div className={styles.controls} role="group" aria-label={`Cantidad de ${item.product.name}`}>
      <button disabled={item.quantity <= 1 || !stock} onClick={() => changeQuantity(item.quantity - 1)} aria-label={`Disminuir cantidad de ${item.product.name}`}><Minus size={16} aria-hidden="true" /></button>
      <span className={styles.quantity} aria-label={`${item.quantity} unidades`}>{item.quantity}</span>
      <button disabled={item.quantity >= stock} onClick={() => changeQuantity(item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.product.name}`}><Plus size={16} aria-hidden="true" /></button>
    </div>
    <button className={styles.remove} aria-label={`Eliminar ${item.product.name}`} onClick={() => { removeItem(item.productId); onFeedback(`Se retiró ${item.product.name} del carrito.`); }}><Trash2 size={17} aria-hidden="true" /><span>Quitar</span></button>
    {needsAdjustment && stock > 0 && <button className={styles.adjust} onClick={() => changeQuantity(stock)}>Ajustar a {stock} unidades disponibles</button>}
  </li>;
}

export function CartItems({ onNavigate, items, selectedIds, onSelect }: { onNavigate?: () => void; items?: CartItem[]; selectedIds?: string[]; onSelect?: (id: string) => void }) {
  const { cart } = useCart();
  const [feedback, setFeedback] = useState({ message: '', error: false });
  return <div className={styles.listArea}>
    {feedback.message && <p className={feedback.error ? styles.error : styles.feedback} role={feedback.error ? 'alert' : 'status'}>{feedback.message}</p>}
    <ul className={styles.list} aria-label="Productos del carrito">
      {(items ?? cart.items).map(item => <CartItemRow key={item.productId} item={item} onNavigate={onNavigate} selected={selectedIds?.includes(item.productId)} onSelect={onSelect} onFeedback={(message, error = false) => setFeedback({ message, error })} />)}
    </ul>
  </div>;
}
