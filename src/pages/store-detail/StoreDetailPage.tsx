import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { MapPin, MessageCircle, FileText, ArrowLeft } from 'lucide-react';
import styles from './StoreDetailPage.module.css';

export const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const business = id ? LocalStoreRepository.getBusinessById(id) : undefined;
  const products = id ? LocalStoreRepository.getProductsByBusiness(id).filter((p) => p.status === 'published') : [];

  if (!business) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Tienda no encontrada</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          El emprendimiento solicitado no existe o ha sido desactivado.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.CATALOG)}>
          Explorar otras tiendas
        </Button>
      </div>
    );
  }

  const whatsAppLink = createWhatsAppLink(
    business.whatsapp,
    `¡Hola ${business.name}! 👋 Encontré su tienda en JUÁCIL y me gustaría hacer una consulta sobre sus productos.`
  );

  return (
    <div className={styles.page}>
      <img src={business.bannerUrl} alt={`Portada de ${business.name}`} className={styles.banner} />

      <div className="container">
        <Link to={ROUTES.CATALOG} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: '16px 0', fontSize: '13px', fontWeight: 600 }}>
          <ArrowLeft size={14} /> Volver al Catálogo
        </Link>

        <header className={styles.header}>
          <div className={styles.brandGroup}>
            <img src={business.logoUrl} alt={`Logo de ${business.name}`} className={styles.logo} />
            <div className={styles.brandInfo}>
              <h1 className={styles.name}>{business.name}</h1>
              <div className={styles.meta}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {business.location}
                </span>
                {business.ruc && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={13} /> RUC: {business.ruc}
                  </span>
                )}
                <Badge variant="lime">MYPE Verificada</Badge>
              </div>
            </div>
          </div>

          <div>
            <a href={whatsAppLink} target="_blank" rel="noopener noreferrer">
              <Button variant="accent" leftIcon={<MessageCircle size={16} color="#062413" />}>
                Contactar por WhatsApp
              </Button>
            </a>
          </div>
        </header>

        <div className={styles.desc}>
          <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--color-primary-900)' }}>
            Sobre este emprendimiento:
          </strong>
          {business.description}
        </div>

        <section aria-labelledby="store-catalog-title">
          <h2 id="store-catalog-title" className={styles.catalogTitle}>
            Catálogo de {business.name} ({products.length} productos)
          </h2>

          {products.length > 0 ? (
            <div className={styles.grid}>
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-muted)' }}>
              Esta tienda aún no tiene productos publicados disponibles.
            </p>
          )}
        </section>
      </div>
    </div>
  );
};
