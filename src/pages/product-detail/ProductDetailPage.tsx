import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import {
  ArrowLeft,
  Store,
  CheckCircle2,
  ShoppingBag,
  MessageCircle,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';
import styles from './ProductDetailPage.module.css';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isMerchant, businessId } = useSession();

  const [quantity, setQuantity] = useState(1);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const product = id ? LocalStoreRepository.getProductById(id) : undefined;
  const business = product ? LocalStoreRepository.getBusinessById(product.businessId) : undefined;

  if (!product) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          El producto solicitado no existe o ha sido retirado del catálogo.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.CATALOG)}>
          Volver al Catálogo
        </Button>
      </div>
    );
  }

  // Si es un borrador y el usuario actual no es el dueño de la MYPE, no permitir acceso público
  const isOwner = isMerchant && businessId === product.businessId;
  if (product.status === 'draft' && !isOwner) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Producto en Revisión (Borrador Privado)</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          Este producto aún no ha sido publicado por su emprendimiento.
        </p>
        <Button variant="outline" onClick={() => navigate(ROUTES.CATALOG)}>
          Explorar Catálogo Público
        </Button>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 4;

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = () => {
    setErrorMessage(null);
    const result = addItem(product, quantity);
    if (result.success) {
      setIsSuccessFeedback(true);
      setTimeout(() => setIsSuccessFeedback(false), 2000);
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const whatsAppInquiryMessage = `¡Hola ${business?.name || ''}! 👋 Tengo una consulta sobre el producto "${product.name}" que vi en la plataforma JUÁCIL. ¿Tienen disponibilidad para coordinar?`;
  const whatsAppInquiryLink = business
    ? createWhatsAppLink(business.whatsapp, whatsAppInquiryMessage)
    : '#';

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to={ROUTES.CATALOG} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Volver al Catálogo de la Selva</span>
        </Link>

        <div className={styles.grid}>
          {/* Galería de Imagen */}
          <div className={styles.gallery}>
            <img
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              className={styles.mainImage}
            />
          </div>

          {/* Detalles del Producto */}
          <div className={styles.details}>
            {business && (
              <Link to={ROUTES.STORE_DETAIL(business.id)} className={styles.storeBadge}>
                <Store size={16} />
                <span>MYPE: {business.name} ({business.location})</span>
              </Link>
            )}

            <h1 className={styles.title}>{product.name}</h1>

            <div className={styles.priceBox}>
              <span className={styles.price}>{formatMoney(product.priceCents)}</span>
              <div className={styles.stockStatus}>
                {isOutOfStock ? (
                  <Badge variant="danger">Agotado temporalmente</Badge>
                ) : isLowStock ? (
                  <Badge variant="warning">¡Solo quedan {product.stock} unidades!</Badge>
                ) : (
                  <Badge variant="success">Stock disponible: {product.stock} unids.</Badge>
                )}
              </div>
            </div>

            <p className={styles.desc}>{product.description}</p>

            {/* Características Destacadas */}
            {product.features.length > 0 && (
              <div className={styles.featuresList}>
                <strong style={{ fontSize: '13px', color: 'var(--color-primary-950)' }}>
                  Detalles y Origen:
                </strong>
                {product.features.map((feat, idx) => (
                  <div key={idx} className={styles.featureItem}>
                    <CheckCircle2 size={16} color="var(--color-primary-600)" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Caja de Compra */}
            <div className={styles.purchaseBox}>
              {!isOutOfStock ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Cantidad a solicitar:</span>
                    <div className={styles.quantitySelector}>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={handleDecrease}
                        disabled={quantity <= 1}
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyButton}
                        onClick={handleIncrease}
                        disabled={quantity >= product.stock}
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {errorMessage && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--color-danger)', fontSize: '12px' }}>
                      <AlertTriangle size={14} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <Button
                      fullWidth
                      size="lg"
                      variant={isSuccessFeedback ? 'accent' : 'primary'}
                      leftIcon={<ShoppingBag size={18} />}
                      onClick={handleAddToCart}
                    >
                      {isSuccessFeedback ? '¡Agregado al carrito!' : 'Agregar al Carrito'}
                    </Button>
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Este producto se encuentra agotado actualmente. Puedes contactar directamente al
                  productor por WhatsApp para consultar la fecha de la próxima cosecha o lote.
                </div>
              )}

              {/* Contacto Directo WhatsApp */}
              {business && (
                <a
                  href={whatsAppInquiryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', marginTop: '4px' }}
                >
                  <Button
                    fullWidth
                    size="md"
                    variant="outline"
                    leftIcon={<MessageCircle size={18} color="#25D366" />}
                  >
                    Consultar al productor por WhatsApp
                  </Button>
                </a>
              )}
            </div>

            {/* Tarjeta Resumen de la Tienda */}
            {business && (
              <div className={styles.storeCardMini}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={business.logoUrl}
                    alt=""
                    style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{business.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                      {business.location}
                    </p>
                  </div>
                </div>
                <Link to={ROUTES.STORE_DETAIL(business.id)}>
                  <Button size="sm" variant="outline">
                    Ver Tienda
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
