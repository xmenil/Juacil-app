import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { useCart } from '@/app/providers/CartProvider';
import { Heart, Plus, Check, Package, MapPin } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface ProductCardProps { product: Product; }
export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const titleId = useId();
  const [favorite, setFavorite] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [added, setAdded] = useState(false);
  const [message, setMessage] = useState({ text: '', error: false });
  const timeout = useRef<number | null>(null);
  useEffect(() => () => { if (timeout.current !== null) window.clearTimeout(timeout.current); }, []);
  const business = LocalStoreRepository.getBusinessById(product.businessId);
  const unavailable = product.stock <= 0 || product.status !== 'published' || !business || (business.status && business.status !== 'active');
  const add = () => {
    if (timeout.current !== null) window.clearTimeout(timeout.current);
    const fresh = LocalStoreRepository.getProductById(product.id);
    const freshBusiness = LocalStoreRepository.getBusinessById(product.businessId);
    if (!fresh || fresh.status !== 'published' || !freshBusiness || (freshBusiness.status && freshBusiness.status !== 'active')) {
      setMessage({ text: 'Este producto ya no está disponible para agregar.', error: true }); return;
    }
    const result = addItem(fresh);
    setAdded(!!result.success);
    setMessage({ text: result.success ? 'Producto agregado al carrito.' : result.error || '', error: !result.success && !!result.error });
    if (result.success) timeout.current = window.setTimeout(() => setAdded(false), 1600);
  };
  return <article className={styles.card} aria-labelledby={titleId}>
    <div className={styles.media}>
      <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className={styles.imageLink} aria-label={`Ver ${product.name}`}>
        {product.imageUrl && !imageFailed ? <img src={product.imageUrl} alt={product.imageAlt || product.name} loading="lazy" onError={() => setImageFailed(true)} /> : <span className={styles.placeholder}><Package size={32} aria-hidden="true" /><span>Imagen no disponible</span></span>}
      </Link>
      <button className={favorite ? styles.favoriteActive : styles.favorite} aria-label={`${favorite ? 'Quitar' : 'Marcar'} ${product.name} ${favorite ? 'de favoritos' : 'como favorito'}`} aria-pressed={favorite} onClick={() => setFavorite(value => !value)}><Heart size={18} aria-hidden="true" /></button>
      {product.stock <= 3 && <span className={product.stock <= 0 ? styles.soldOut : styles.lowStock}>{product.stock <= 0 ? 'Agotado' : `Quedan ${product.stock}`}</span>}
    </div>
    <div className={styles.body}>
      {business && <Link className={styles.business} to={ROUTES.STORE_DETAIL(business.id)} title={business.name}>{business.name}</Link>}
      <h3 id={titleId}><Link to={ROUTES.PRODUCT_DETAIL(product.id)} title={product.name}>{product.name}</Link></h3>
      {business && <span className={styles.location}><MapPin size={13} aria-hidden="true" />{business.location}</span>}
      <div className={styles.footer}>
        <strong className={styles.price}>{formatMoney(product.priceCents)}</strong>
        <button className={added ? styles.added : styles.add} disabled={!!unavailable} onClick={add} aria-label={`Agregar ${product.name} al carrito`}>
          {added ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}<span>{added ? 'Agregado' : product.stock <= 0 ? 'Agotado' : unavailable ? 'No disponible' : 'Agregar'}</span>
        </button>
      </div>
      {message.text && <p className={message.error ? styles.error : styles.feedback} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
    </div>
  </article>;
}
