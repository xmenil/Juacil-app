import React, { useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import {
  Search,
  RotateCcw,
  PackageX,
  Filter,
  MapPin,
  Store,
  Package,
  Tag,
  Clock,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import styles from './CatalogPage.module.css';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('categoria') || '';
  const location = searchParams.get('ubicacion') || '';
  const sort = searchParams.get('orden') || 'nuevos';
  const filtro = searchParams.get('filtro') || '';
  const isTiendasView = filtro === 'tiendas';
  const isOfertasView = searchParams.get('ofertas') === 'true';

  const allProducts = useMemo(() => LocalStoreRepository.getProducts(), []);
  const allBusinesses = useMemo(() => LocalStoreRepository.getBusinesses(), []);

  // Mapeo de productos por negocio
  const businessProductsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allProducts.forEach((p) => {
      map.set(p.businessId, (map.get(p.businessId) || 0) + 1);
    });
    return map;
  }, [allProducts]);

  const businessLocationMap = useMemo(() => {
    const map = new Map<string, string>();
    allBusinesses.forEach((b) => map.set(b.id, b.location));
    return map;
  }, [allBusinesses]);

  // Filtrado de Negocios / Tiendas cuando está en modo directorio
  const filteredBusinesses = useMemo(() => {
    return allBusinesses.filter((biz) => {
      if (query) {
        const q = query.toLowerCase();
        const matchName = biz.name.toLowerCase().includes(q);
        const matchDesc = biz.description.toLowerCase().includes(q);
        const matchLoc = biz.location.toLowerCase().includes(q);
        const matchCat = biz.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchLoc && !matchCat) return false;
      }

      if (category && biz.category.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      if (location) {
        if (!biz.location.toLowerCase().includes(location.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [allBusinesses, query, category, location]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((prod) => {
        // Búsqueda por texto (nombre, descripción, características)
        if (query) {
          const q = query.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description.toLowerCase().includes(q);
          const matchFeat = prod.features.some((f) => f.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchFeat) return false;
        }

        // Filtro por categoría
        if (category && prod.category !== category) {
          return false;
        }

        // Filtro por ubicación de la MYPE
        if (location) {
          const bizLoc = businessLocationMap.get(prod.businessId) || '';
          if (!bizLoc.toLowerCase().includes(location.toLowerCase())) {
            return false;
          }
        }

        // Si es vista de ofertas, priorizar artículos clave o con stock activo
        if (isOfertasView) {
          return prod.status === 'published';
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'precio_asc') return a.priceCents - b.priceCents;
        if (sort === 'precio_desc') return b.priceCents - a.priceCents;
        if (sort === 'nombre_asc') return a.name.localeCompare(b.name);
        // Por defecto: más recientes
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allProducts, query, category, location, sort, isOfertasView, businessLocationMap]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    const next = new URLSearchParams();
    if (isTiendasView) {
      next.set('filtro', 'tiendas');
    }
    setSearchParams(next);
  };

  const hasActiveFilters = Boolean(query || category || location || sort !== 'nuevos');

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Encabezado */}
        <div className={styles.header}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-primary-100)',
              color: 'var(--color-primary-800)',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <MapPin size={13} />
            <span>Leoncio Prado, Huánuco • Selva Central</span>
          </div>

          <h1 className={styles.title}>
            {isTiendasView
              ? 'Tiendas & MYPES de Tingo María'
              : isOfertasView
              ? 'Ofertas y Precios Especiales de Tingo María'
              : 'Catálogo de Tingo María y Alrededores'}
          </h1>
          <p className={styles.subtitle}>
            {isTiendasView
              ? 'Conoce directamente los productores, bodegas, cooperativas y emprendimientos locales de Leoncio Prado. Compra seguro o coordina por WhatsApp.'
              : isOfertasView
              ? 'Abarrotes de primera necesidad, canasta básica familiar, cafés de altura y chocolates finos a precios accesibles.'
              : 'Productos representativos de Rupa-Rupa, Castillo Grande, Naranjillo, Valle del Monzón, Las Palmas y la Bella Durmiente directos de sus productores.'}
          </p>

          {/* Selector de Pestañas Superiores (Productos vs Tiendas vs Ofertas) */}
          <div className={styles.sectionTabsContainer} role="tablist" aria-label="Secciones del catálogo">
            <button
              type="button"
              role="tab"
              aria-selected={!isTiendasView && !isOfertasView}
              className={`${styles.sectionTab} ${!isTiendasView && !isOfertasView ? styles.sectionTabActive : ''}`}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('filtro');
                next.delete('ofertas');
                setSearchParams(next);
              }}
            >
              <Package size={16} />
              <span>Productos</span>
              <span className={styles.tabBadge}>{allProducts.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={isTiendasView}
              className={`${styles.sectionTab} ${isTiendasView ? styles.sectionTabActive : ''}`}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('filtro', 'tiendas');
                next.delete('ofertas');
                setSearchParams(next);
              }}
            >
              <Store size={16} />
              <span>Tiendas & MYPES</span>
              <span className={styles.tabBadge}>{allBusinesses.length}</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={isOfertasView}
              className={`${styles.sectionTab} ${isOfertasView ? styles.sectionTabActive : ''}`}
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.set('ofertas', 'true');
                next.delete('filtro');
                setSearchParams(next);
              }}
            >
              <Tag size={16} />
              <span>Ofertas</span>
            </button>
          </div>

          {/* Chips de Zonas Rápidas de Tingo María */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
            <button
              type="button"
              style={{
                backgroundColor: !location ? 'var(--color-primary-800)' : 'var(--color-surface)',
                color: !location ? '#ffffff' : 'var(--color-text-main)',
                border: '1px solid var(--color-border)',
                borderRadius: '999px',
                padding: '5px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              onClick={() => updateParam('ubicacion', '')}
            >
              📍 Todo Tingo María y aledaños
            </button>
            {LOCATIONS.slice(0, 6).map((loc) => (
              <button
                key={loc}
                type="button"
                style={{
                  backgroundColor: location === loc ? 'var(--color-primary-800)' : 'var(--color-surface)',
                  color: location === loc ? '#ffffff' : 'var(--color-text-main)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '999px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                onClick={() => updateParam('ubicacion', loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.layout}>
          {/* Barra Lateral de Filtros */}
          <aside className={styles.sidebar} aria-label="Filtros del catálogo">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className={styles.filterLabel}>
                <Filter size={16} />
                <span>{isTiendasView ? 'Filtros de Tiendas' : 'Filtros de Búsqueda'}</span>
              </h2>
              {hasActiveFilters && (
                <Button size="sm" variant="ghost" onClick={handleClearFilters} leftIcon={<RotateCcw size={12} />}>
                  Limpiar
                </Button>
              )}
            </div>

            {/* Búsqueda */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-search" className={styles.filterLabel}>
                {isTiendasView ? 'Buscar tienda o rubro' : 'Buscar producto'}
              </label>
              <Input
                id="catalog-search"
                placeholder={isTiendasView ? 'Ej. Café Monzón, Durmiente, Bodega...' : 'Ej. Cacao, café, chifles, arroz...'}
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Categoría */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-category" className={styles.filterLabel}>
                Rubro / Categoría
              </label>
              <Select
                id="catalog-category"
                value={category}
                onChange={(e) => updateParam('categoria', e.target.value)}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {/* Ubicación en Tingo María y aledaños */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-location" className={styles.filterLabel}>
                Zona / Distrito
              </label>
              <Select
                id="catalog-location"
                value={location}
                onChange={(e) => updateParam('ubicacion', e.target.value)}
                options={[
                  { value: '', label: 'Todo Tingo María y aledaños' },
                  ...LOCATIONS.map((loc) => ({ value: loc, label: loc })),
                ]}
              />
            </div>
          </aside>

          {/* Contenido Principal y Listado */}
          <main className={styles.mainContent}>
            {/* Barra Superior con Contador y Ordenamiento */}
            <div className={styles.topBar}>
              <div className={styles.counter}>
                {isTiendasView ? (
                  <>
                    Mostrando <strong className={styles.counterStrong}>{filteredBusinesses.length}</strong>{' '}
                    {filteredBusinesses.length === 1 ? 'tienda o MYPE' : 'tiendas y MYPES de Tingo María'}
                  </>
                ) : (
                  <>
                    Mostrando <strong className={styles.counterStrong}>{filteredProducts.length}</strong>{' '}
                    {filteredProducts.length === 1 ? 'producto de Tingo María' : 'productos de Tingo María y aledaños'}
                  </>
                )}
              </div>

              {!isTiendasView && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label htmlFor="catalog-sort" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Ordenar por:
                  </label>
                  <Select
                    id="catalog-sort"
                    value={sort}
                    onChange={(e) => updateParam('orden', e.target.value)}
                    options={[
                      { value: 'nuevos', label: 'Más recientes' },
                      { value: 'precio_asc', label: 'Menor precio' },
                      { value: 'precio_desc', label: 'Mayor precio' },
                      { value: 'nombre_asc', label: 'Nombre A-Z' },
                    ]}
                    style={{ width: 'auto' }}
                  />
                </div>
              )}
            </div>

            {/* VISTA 1: Directorio de Tiendas & MYPES */}
            {isTiendasView ? (
              filteredBusinesses.length > 0 ? (
                <div className={styles.storesGrid}>
                  {filteredBusinesses.map((biz) => {
                    const prodCount = businessProductsCountMap.get(biz.id) || 0;
                    const whatsAppMsg = `¡Hola ${biz.name}! 👋 Encontré su tienda en JUÁCIL (Tingo María) y me gustaría consultar sobre sus productos y envíos.`;
                    const waLink = createWhatsAppLink(biz.whatsapp, whatsAppMsg);

                    return (
                      <article key={biz.id} className={styles.storeCard}>
                        <div className={styles.storeCardBannerWrapper}>
                          <img
                            src={biz.bannerUrl}
                            alt={`Portada de ${biz.name}`}
                            className={styles.storeCardBanner}
                            loading="lazy"
                          />
                          <div className={styles.storeCardLocationBadge}>
                            <MapPin size={11} />
                            <span>{biz.location}</span>
                          </div>
                        </div>

                        <div className={styles.storeCardBody}>
                          <div className={styles.storeCardLogoWrapper}>
                            <img
                              src={biz.logoUrl}
                              alt={`Logo de ${biz.name}`}
                              className={styles.storeCardLogo}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80';
                              }}
                            />
                            <span className={styles.storeCategoryPill}>{biz.category}</span>
                          </div>

                          <h3 className={styles.storeCardTitle}>
                            <Link
                              to={ROUTES.STORE_DETAIL(biz.id)}
                              style={{ color: 'inherit', textDecoration: 'none' }}
                            >
                              {biz.name}
                            </Link>
                          </h3>

                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#166534',
                              fontWeight: 700,
                              marginBottom: '8px',
                            }}
                          >
                            <ShieldCheck size={13} color="#16a34a" />
                            <span>MYPE Verificada de Selva Central</span>
                          </div>

                          <p className={styles.storeCardDesc}>{biz.description}</p>

                          <div className={styles.storeCardMeta}>
                            <div className={styles.storeCardMetaRow}>
                              <Clock size={13} color="#15803d" />
                              <span>{biz.schedule || 'Lunes a Sábado: 8:00 am - 7:00 pm'}</span>
                            </div>
                            <div className={styles.storeCardMetaRow}>
                              <Package size={13} color="#0b4526" />
                              <span>
                                <strong>{prodCount}</strong> {prodCount === 1 ? 'producto activo' : 'productos activos'} en catálogo
                              </span>
                            </div>
                          </div>

                          <div className={styles.storeCardActions}>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.storeCardWhatsAppBtn}
                              title={`Contactar a ${biz.name} por WhatsApp`}
                              aria-label={`Contactar por WhatsApp a ${biz.name}`}
                            >
                              <MessageCircle size={18} />
                            </a>

                            <Button
                              fullWidth
                              variant="primary"
                              size="md"
                              onClick={() => navigate(ROUTES.STORE_DETAIL(biz.id))}
                              rightIcon={<ArrowRight size={14} />}
                            >
                              Ver Tienda y Catálogo
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <Store size={32} />
                  </div>
                  <h3 className={styles.emptyTitle}>No hay tiendas con estos criterios</h3>
                  <p className={styles.emptyText}>
                    Prueba cambiando el término de búsqueda o limpia los filtros de ubicación para ver todas las
                    MYPES de Leoncio Prado.
                  </p>
                  <Button variant="primary" onClick={handleClearFilters} leftIcon={<RotateCcw size={16} />}>
                    Ver todas las tiendas
                  </Button>
                </div>
              )
            ) : (
              /* VISTA 2: Catálogo de Productos */
              filteredProducts.length > 0 ? (
                <div className={styles.grid}>
                  {filteredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIconBox}>
                    <PackageX size={32} />
                  </div>
                  <h3 className={styles.emptyTitle}>No hay productos con estos filtros</h3>
                  <p className={styles.emptyText}>
                    Intenta cambiar el término de búsqueda o limpia los filtros para explorar otras zonas de Tingo
                    María y Leoncio Prado.
                  </p>
                  <Button variant="primary" onClick={handleClearFilters} leftIcon={<RotateCcw size={16} />}>
                    Limpiar filtros
                  </Button>
                </div>
              )
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
