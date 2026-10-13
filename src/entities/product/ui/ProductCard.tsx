import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useCart } from '@/app/providers/CartProvider';
import { ShoppingBag, Store, Check } from 'lucide-react';
import styles from './ProductCard.module.css';

export interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isAddedRecently, setIsAddedRecently] = useState(false);
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

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  return (
    <article className={styles.card} aria-labelledby={`product-title-${product.id}`}>
      <Link to={ROUTES.PRODUCT_DETAIL(product.id)} className={styles.imageWrapper}>
        <img
          src={product.imageUrl}
          alt={product.imageAlt || product.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.badgeTopRight}>
          {isOutOfStock ? (
            <Badge variant="danger">Agotado</Badge>
          ) : isLowStock ? (
            <Badge variant="warning">¡Solo {product.stock} disp.!</Badge>
          ) : (
            <Badge variant="success">En stock</Badge>
          )}
        </div>
        <span className={styles.categoryTag}>{product.category.toUpperCase()}</span>
      </Link>

      <div className={styles.body}>
        {business && (
          <Link to={ROUTES.STORE_DETAIL(business.id)} className={styles.storeLink}>
            <Store size={12} />
            <span>{business.name}</span>
          </Link>
        )}

        <h3 id={`product-title-${product.id}`} className={styles.title}>
          <Link to={ROUTES.PRODUCT_DETAIL(product.id)}>{product.name}</Link>
        </h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>{formatMoney(product.priceCents)}</span>
        </div>

        {errorMessage && (
          <p style={{ color: 'var(--color-danger)', fontSize: '11px', margin: 0 }}>
            {errorMessage}
          </p>
        )}

        <div className={styles.actions}>
          <Button
            fullWidth
            size="md"
            variant={isOutOfStock ? 'outline' : isAddedRecently ? 'accent' : 'primary'}
            disabled={isOutOfStock}
            leftIcon={
              isAddedRecently ? (
                <Check size={16} />
              ) : (
                <ShoppingBag size={16} />
              )
            }
            onClick={handleAddToCart}
          >
            {isOutOfStock
              ? 'Agotado'
              : isAddedRecently
              ? '¡Agregado!'
              : 'Agregar'}
          </Button>
        </div>
      </div>
    </article>
  );
};
