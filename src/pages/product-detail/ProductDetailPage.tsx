import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { ProductCard } from '@/entities/product/ui/ProductCard';
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
  const { isMerchant, businessId, currentUser } = useSession();

  const [quantity, setQuantity] = useState(1);
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subir el scroll automáticamente cuando cambia el producto visto
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1);
    setErrorMessage(null);
  }, [id]);

  const product = id ? LocalStoreRepository.getProductById(id) : undefined;
  const business = product ? LocalStoreRepository.getBusinessById(product.businessId) : undefined;

  // Cálculo de productos similares
  const similarProducts = useMemo(() => {
    if (!product) return [];
    const all = LocalStoreRepository.getProducts();

    // 1. Misma categoría y diferente id
    const sameCategory = all.filter(
      (p) => p.category === product.category && p.id !== product.id
    );

    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }

    // 2. Si hay menos de 4, completar con otros productos de Tingo María y la misma tienda
    const others = all.filter(
      (p) => p.id !== product.id && !sameCategory.some((sc) => sc.id === p.id)
    );

    return [...sameCategory, ...others].slice(0, 4);
  }, [product]);

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

  const handleBuyNow = () => {
    setErrorMessage(null);
    const result = addItem(product, quantity);
    if (result.success) {
      if (!currentUser) {
        navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`);
      } else {
        navigate(ROUTES.CHECKOUT);
      }
    } else if (result.error) {
      setErrorMessage(result.error);
    }
  };

  const whatsAppInquiryMessage = `¡Hola ${business?.name || ''}! 👋 Tengo una consulta sobre el producto "${product.name}" que vi en la plataforma JUÁCIL (Tingo María). ¿Tienen disponibilidad para coordinar?`;
  const whatsAppInquiryLink = business
    ? createWhatsAppLink(business.whatsapp, whatsAppInquiryMessage)
    : '#';

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to={ROUTES.CATALOG} className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Volver al Catálogo de Tingo María</span>
        </Link>

        <div className={styles.grid}>
          {/* Galería de Imagen */}
          <div className={styles.gallery}>
            <img
              src={product.imageUrl}
              alt={product.imageAlt || product.name}
              className={styles.mainImage}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* Detalles del Producto */}
          <div className={styles.details}>
            {business && (
              <Link to={ROUTES.STORE_DETAIL(business.id)} className={styles.storeBadge}>
                <Store size={16} />
                <span>MYPE: {business.name} • {business.location}</span>
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

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                    <Button
                      style={{ flex: 1, minWidth: '150px' }}
                      size="lg"
                      variant={isSuccessFeedback ? 'accent' : 'outline'}
                      leftIcon={<ShoppingBag size={18} />}
                      onClick={handleAddToCart}
                    >
                      {isSuccessFeedback ? '¡Agregado!' : 'Al Carrito'}
                    </Button>

                    <Button
                      style={{ flex: 1, minWidth: '150px' }}
                      size="lg"
                      variant="accent"
                      onClick={handleBuyNow}
                    >
                      Comprar Ahora
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
                    className={styles.storeMiniLogo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{business.name}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
                      📍 {business.location}
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

        {/* 2. Sección de Productos Similares */}
        {similarProducts.length > 0 && (
          <section className={styles.similarSection} aria-labelledby="similar-title">
            <div className={styles.similarHeader}>
              <span className={styles.similarSub}>RECOMENDACIONES DE TINGO MARÍA</span>
              <h2 id="similar-title" className={styles.similarTitle}>
                Productos Similares que te pueden interesar
              </h2>
              <p className={styles.similarDesc}>
                Descubre más opciones de {product.category.toUpperCase()} y productos recomendados
                de Castillo Grande, Monzón y Naranjillo.
              </p>
            </div>

            <div className={styles.similarGrid}>
              {similarProducts.map((simProd) => (
                <ProductCard key={simProd.id} product={simProd} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
