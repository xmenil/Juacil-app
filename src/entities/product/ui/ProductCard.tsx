import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Badge } from '@/shared/ui/Badge';
import { useCart } from '@/app/providers/CartProvider';
import { ShoppingBag, Check, MapPin, Heart } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isAddedRecently, setIsAddedRecently] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const business = LocalStoreRepository.getBusinessById(product.businessId);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setErrorMessage(null);

    const result = addItem(product, 1);
    if (result.success) {
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 1600);
    } else if (result.error) {
      setErrorMessage(result.error);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  return (
    <article className={styles.card} aria-labelledby={`product-title-${product.id}`}>
      <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className={styles.imageWrapper}>
        <img
          src={product.imageUrl}
          alt={product.imageAlt || product.name}
          className={styles.image}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Botón de Favorito Flotante */}
        <button
          type="button"
          className={styles.favoriteButton}
          onClick={handleToggleFavorite}
          aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart
            size={16}
            color={isFavorite ? '#ef4444' : '#4b5563'}
            fill={isFavorite ? '#ef4444' : 'none'}
          />
        </button>

        {/* Badge de Stock si es necesario */}
        {(isOutOfStock || isLowStock) && (
          <div className={styles.badgeTopLeft}>
            {isOutOfStock ? (
              <Badge variant="danger">Agotado</Badge>
            ) : (
              <Badge variant="warning">¡Solo {product.stock}!</Badge>
            )}
          </div>
        )}
      </Link>

      <div className={styles.body}>
        <h3 id={`product-title-${product.id}`} className={styles.title}>
          <Link to={ROUTES.PRODUCT_DETAIL(product.id)}>{product.name}</Link>
        </h3>

        {/* Ubicación y Negocio */}
        <div className={styles.locationSubtitle}>
          <MapPin size={13} className={styles.locationIcon} />
          <span>{business ? business.location : 'Tingo María'}</span>
        </div>

        {errorMessage && (
          <p style={{ color: 'var(--color-danger)', fontSize: '11px', margin: '0 0 6px 0' }}>
            {errorMessage}
          </p>
        )}

        {/* Fila inferior: Precio a la izquierda y Botón Agregar a la derecha */}
        <div className={styles.footerRow}>
          <span className={styles.price}>{formatMoney(product.priceCents)}</span>
          <button
            type="button"
            className={`${styles.addButton} ${isOutOfStock ? styles.disabled : ''} ${isAddedRecently ? styles.added : ''}`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {isAddedRecently ? (
              <>
                <Check size={14} />
                <span>¡Agregado!</span>
              </>
            ) : isOutOfStock ? (
              <span>Agotado</span>
            ) : (
              <>
                <ShoppingBag size={14} />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
