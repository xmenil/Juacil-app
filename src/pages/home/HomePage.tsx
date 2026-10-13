import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ROUTES } from '@/shared/config/routes';
import {
  Search,
  ChevronRight,
  Sprout,
  Users,
  Truck,
  ArrowRight,
  Store,
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Productos y negocios desde el almacenamiento local
  const allProducts = LocalStoreRepository.getProducts();
  const featuredProducts = allProducts.slice(0, 8);
  const businesses = LocalStoreRepository.getBusinesses();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.CATALOG}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.CATALOG);
    }
  };

  const handleQuickLocation = (loc: string) => {
    navigate(`${ROUTES.CATALOG}?ubicacion=${encodeURIComponent(loc)}`);
  };

  const categories = [
    {
      id: 'cafe',
      title: 'Café',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'cacao',
      title: 'Cacao',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'miel',
      title: 'Miel',
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=200&q=80',
    },
    {
      id: 'artesania',
      title: 'Artesanías',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=200&q=80',
    },
  ];

  return (
    <div className={styles.homePage}>
      <div className="container">
        {/* 1. Barra de Búsqueda Superior */}
        <section className={styles.searchSection} aria-label="Buscador de productos">
          <div className={styles.searchBarWrapper}>
            <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
              <Search size={20} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="¿Qué estás buscando? (ej. café Villa Rica, chocolate, miel...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Buscar productos"
              />
              <button type="submit" className={styles.searchButton}>
                Buscar
              </button>
            </form>

            {/* Chips de ubicaciones en Tingo María y zonas aledañas */}
            <div className={styles.locationChipsRow}>
              <span className={styles.locationChipLabel}>Zonas destacadas:</span>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Tingo María (Centro / Rupa-Rupa)')}
              >
                📍 Tingo María Centro
              </button>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Castillo Grande')}
              >
                📍 Castillo Grande
              </button>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Valle del Monzón')}
              >
                📍 Valle del Monzón
              </button>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Naranjillo / Luyando')}
              >
                📍 Naranjillo / Luyando
              </button>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Mariano Dámaso Beraún / Las Palmas')}
              >
                📍 Las Palmas
              </button>
              <button
                type="button"
                className={styles.locationChip}
                onClick={() => handleQuickLocation('Aucayacu')}
              >
                📍 Aucayacu
              </button>
            </div>
          </div>
        </section>

        {/* 2. Banner Principal con Verde de Fondo en las Letras e Imagen a la Derecha */}
        <section className={styles.heroBannerSection} aria-labelledby="banner-heading">
          <div className={styles.heroBannerCard}>
            {/* Lado Izquierdo con fondo verde y textos */}
            <div className={styles.heroBannerText}>
              <span className={styles.heroEyebrow}>PRODUCTOS DE LA AMAZONÍA PERUANA</span>
              <h1 id="banner-heading" className={styles.heroTitle}>
                Compra local. Descubre la Selva.
              </h1>
              <p className={styles.heroSubtitle}>
                Productos de pequeños negocios, cerca de ti en Tingo María y la Selva Central.
              </p>

              <div className={styles.heroFeaturesRow}>
                <div className={styles.heroFeatureItem}>
                  <Sprout size={18} className={styles.heroFeatureIcon} />
                  <span>Apoyas negocios locales</span>
                </div>
                <div className={styles.heroFeatureItem}>
                  <Users size={18} className={styles.heroFeatureIcon} />
                  <span>Productos auténticos</span>
                </div>
                <div className={styles.heroFeatureItem}>
                  <Truck size={18} className={styles.heroFeatureIcon} />
                  <span>Envíos a todo el Perú</span>
                </div>
              </div>
            </div>

            {/* Lado Derecho con fotografía de productos de la Selva */}
            <div className={styles.heroBannerMedia}>
              <img
                src="/images/hero-amazon-products.jpg"
                alt="Café de especialidad, miel pura, chocolate amazónico y cestería indígena"
                className={styles.heroBannerImage}
              />
            </div>
          </div>
        </section>

        {/* 3. Sección "Explora por categoría" */}
        <section className={styles.sectionBlock} aria-labelledby="categories-heading">
          <div className={styles.sectionHeaderRow}>
            <h2 id="categories-heading" className={styles.sectionHeading}>
              Explora por categoría
            </h2>
            <Link to={ROUTES.CATALOG} className={styles.sectionViewAllLink}>
              Ver todo el catálogo <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`${ROUTES.CATALOG}?categoria=${cat.id}`}
                className={styles.categoryCard}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  className={styles.categoryImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <span className={styles.categoryTitle}>{cat.title}</span>
                <ChevronRight size={18} className={styles.categoryArrow} />
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Sección "Productos destacados" */}
        <section className={styles.sectionBlock} aria-labelledby="featured-products-heading">
          <div className={styles.sectionHeaderRow}>
            <h2 id="featured-products-heading" className={styles.sectionHeading}>
              Productos destacados
            </h2>
            <Link to={ROUTES.CATALOG} className={styles.sectionViewAllLink}>
              Ver más productos <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.productsGrid}>
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* 5. Emprendimientos y MYPES de la Región */}
        <section className={styles.sectionBlock} aria-labelledby="businesses-heading" style={{ marginTop: '20px' }}>
          <div className={styles.sectionHeaderRow}>
            <h2 id="businesses-heading" className={styles.sectionHeading}>
              Emprendimientos de la Selva Central
            </h2>
            <Link to={ROUTES.CATALOG} className={styles.sectionViewAllLink}>
              Ver todas las tiendas <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.businessesGrid}>
            {businesses.slice(0, 3).map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        </section>

        {/* 6. Banner para Vendedores / Registrar Emprendimiento */}
        <div className={styles.registerBanner}>
          <Store size={36} color="#84cc16" />
          <h2 className={styles.registerBannerTitle}>
            ¿Tienes un emprendimiento en Tingo María o la Selva?
          </h2>
          <p className={styles.registerBannerText}>
            Crea tu tienda virtual en minutos, digitaliza tu catálogo y recibe pedidos directamente
            en tu WhatsApp personal sin intermediarios ni comisiones abusivas.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="accent"
              size="lg"
              leftIcon={<Store size={18} />}
              onClick={() => navigate(ROUTES.REGISTER_BUSINESS)}
            >
              Registrar mi Tienda Gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.HELP)}
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Conocer Cómo Funciona
            </Button>
          </div>
        </div>
      </div>

      {/* 7. Cómo comprar en JUÁCIL en 3 pasos */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proceso Simple y Transparente
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', color: 'var(--color-primary-950)' }}>
              ¿Cómo comprar en JUÁCIL en 3 pasos?
            </h2>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>1</div>
              <h3 className={styles.stepTitle}>Explora y Elige</h3>
              <p className={styles.stepText}>
                Navega por las categorías de café, cacao, miel y artesanías de Tingo María y agrega productos al carrito de compras.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>2</div>
              <h3 className={styles.stepTitle}>Confirma tu Pedido</h3>
              <p className={styles.stepText}>
                Ingresa tus datos de contacto y entrega. Se generará un código único (JUA-XXXX) y se reservará el stock automáticamente.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepBadge}>3</div>
              <h3 className={styles.stepTitle}>Coordina por WhatsApp</h3>
              <p className={styles.stepText}>
                Habla directamente con la MYPE para definir el pago seguro (Yape, Plin o efectivo) y coordinar el recojo o despacho.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modales Informativos */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Experiencia de Compra JUÁCIL"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} color="var(--color-primary-700)" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              Garantía de Trato Directo
            </h4>
          </div>
          <p style={{ color: 'var(--color-text-main)', fontSize: '14px', lineHeight: 1.5 }}>
            JUÁCIL conecta a los productores de la Selva Central directamente contigo. Sin intermediarios,
            cada sol apoya el sustento de las familias y preserva la biodiversidad de nuestra Amazonía.
          </p>
          <Button fullWidth onClick={() => setIsExpModalOpen(false)}>
            Entendido
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        title="Preferencias de Compra por Localidad"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <QrCode size={32} color="var(--color-primary-700)" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
              Filtro Territorial Tingalés
            </h4>
          </div>
          <p style={{ color: 'var(--color-text-main)', fontSize: '14px', lineHeight: 1.5 }}>
            Puedes filtrar los productos por Castillo Grande, Valle del Monzón, Naranjillo o Tingo María Centro para
            priorizar entregas locales rápidas y recojo en tienda sin costo adicional de flete.
          </p>
          <Button fullWidth variant="accent" onClick={() => setIsPrefModalOpen(false)}>
            Explorar Ahora
          </Button>
        </div>
      </Modal>
    </div>
  );
};
