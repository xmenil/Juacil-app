import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ROUTES } from '@/shared/config/routes';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Users,
  Store,
  ChevronRight,
} from 'lucide-react';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Datos mock desde el repositorio
  const products = LocalStoreRepository.getProducts().slice(0, 8);
  const businesses = LocalStoreRepository.getBusinesses();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`${ROUTES.CATALOG}?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(ROUTES.CATALOG);
    }
  };

  return (
    <>
      {/* 1. Hero Section */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroBackgroundShape} aria-hidden="true" />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>Selva Central del Perú • MYPES Digitales</span>
          </div>
          <h1 id="hero-title" className={styles.heroTitle}>
            Descubre los tesoros de la Amazonía en{' '}
            <span className={styles.highlightText}>JUÁCIL</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Café de especialidad, cacao fino, miel pura y artesanías indígenas directas de los
            productores de Oxapampa, Villa Rica y Chanchamayo a tu hogar.
          </p>

          {/* Buscador Rápido */}
          <form className={styles.searchBar} onSubmit={handleSearchSubmit}>
            <Search size={18} color="var(--color-text-subtle)" aria-hidden="true" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar café Villa Rica, miel pura, chocolate amargo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Buscar productos en el catálogo"
            />
            <Button type="submit" variant="accent" size="sm">
              Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* 2. Tarjetas Superiores de Acceso Rápido (Inspiradas en I02 e I03 del informe) */}
      <div className="container">
        <div className={styles.cardsRow}>
          <div
            className={`${styles.mockCard} ${styles.mockCardDark}`}
            onClick={() => navigate(ROUTES.CATALOG)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate(ROUTES.CATALOG)}
          >
            <div className={styles.mockCardTop}>
              <div className={styles.mockCardIconBox}>
                <Store size={22} color="#ffffff" />
              </div>
              <div className={styles.mockCardArrow}>
                <ArrowRight size={18} color="#ffffff" />
              </div>
            </div>
            <h3 className={styles.mockCardTitle}>Mercado de la Selva Central</h3>
          </div>

          <div
            className={`${styles.mockCard} ${styles.mockCardLime}`}
            onClick={() => setIsExpModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsExpModalOpen(true)}
          >
            <div className={styles.mockCardTop}>
              <div className={styles.mockCardIconBox}>
                <ShieldCheck size={22} color="#ffffff" />
              </div>
              <div className={styles.mockCardArrow}>
                <ChevronRight size={18} color="#ffffff" />
              </div>
            </div>
            <h3 className={styles.mockCardTitle}>Experiencia Única</h3>
          </div>

          <div
            className={`${styles.mockCard} ${styles.mockCardDark}`}
            onClick={() => setIsPrefModalOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setIsPrefModalOpen(true)}
          >
            <div className={styles.mockCardTop}>
              <div className={styles.mockCardIconBox}>
                <QrCode size={22} color="#ffffff" />
              </div>
              <div className={styles.mockCardArrow}>
                <ChevronRight size={18} color="#ffffff" />
              </div>
            </div>
            <h3 className={styles.mockCardTitle}>Preferencias del Cliente</h3>
          </div>
        </div>
      </div>

      {/* 3. Productos Destacados */}
      <section className={styles.productsSection} aria-labelledby="featured-products-title">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSub}>Calidad y Origen</span>
            <h2 id="featured-products-title" className={styles.sectionTitle}>
              Productos Recomendados de la Semana
            </h2>
          </div>

          <div className={styles.productsGrid}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Button
              size="lg"
              variant="outline"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => navigate(ROUTES.CATALOG)}
            >
              Explorar todo el catálogo ({products.length}+ productos)
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Onboarding de 3 Pasos (I04 del informe) */}
      <section className={styles.onboardingSection} aria-labelledby="onboarding-title">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSub}>Digitalización para Emprendedores</span>
            <h2 id="onboarding-title" className={styles.sectionTitle}>
              Vende en JUÁCIL en 3 Simples Pasos
            </h2>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>01</span>
              <h3 className={styles.stepTitle}>Cuéntanos sobre tu negocio</h3>
              <p className={styles.stepDesc}>
                Ingresa el nombre de tu emprendimiento, tu ubicación en la Selva y los productos que
                elaboras.
              </p>
              <div className={styles.stepNote}>
                💡 <em>Si no tienes RUC, te orientamos paso a paso con asesoría informativa.</em>
              </div>
            </div>

            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>02</span>
              <h3 className={styles.stepTitle}>Sube tu primer producto</h3>
              <p className={styles.stepDesc}>
                Agrega una foto, el precio en Soles y las unidades disponibles. Tu catálogo estará
                listo para compartir de inmediato.
              </p>
              <div className={styles.stepNote}>
                ⚡ <em>Tu producto aparece visible en el mercado regional para todos los clientes.</em>
              </div>
            </div>

            <div className={styles.stepCard}>
              <span className={styles.stepNumber}>03</span>
              <h3 className={styles.stepTitle}>Recibe tu primera orden</h3>
              <p className={styles.stepDesc}>
                Los pedidos te llegarán con el código de orden generado para coordinar pago y
                entrega cómodamente por WhatsApp.
              </p>
              <div className={styles.stepNote}>
                📱 <em>Avisos directos para entrega local o envío interprovincial.</em>
              </div>
            </div>
          </div>

          {/* Formulario rápido para registrar emprendimiento (I05) */}
          <div className={styles.quickRegisterBox}>
            <h3 className={styles.quickRegisterTitle}>Registra tu emprendimiento hoy mismo</h3>
            <p className={styles.quickRegisterSub}>
              Únete a las MYPES de Chanchamayo, Oxapampa y Satipo que ya comercializan sus productos
              en línea.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Button
                variant="accent"
                size="lg"
                rightIcon={<ArrowRight size={18} />}
                onClick={() => navigate(ROUTES.REGISTER_BUSINESS)}
              >
                Comenzar Registro de Emprendimiento
              </Button>
              <Button
                variant="outline"
                size="lg"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
                onClick={() => navigate(ROUTES.LOGIN)}
              >
                ¿Ya tienes cuenta? Iniciar Sesión
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Tiendas y Emprendimientos de la Selva */}
      <section className={styles.storesSection} aria-labelledby="stores-title">
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionSub}>Comercio Justo y Local</span>
            <h2 id="stores-title" className={styles.sectionTitle}>
              Nuestras Tiendas Aliadas
            </h2>
          </div>

          <div className={styles.storesGrid}>
            {businesses.map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
        </div>
      </section>

      {/* Modal: Experiencia Única (I03) */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Experiencia Única en JUÁCIL"
        footer={
          <Button variant="primary" onClick={() => setIsExpModalOpen(false)}>
            Entendido
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            En <strong>JUÁCIL</strong>, conectamos directamente a las familias productoras de la Selva
            Central peruana con compradores que valoran la autenticidad, la sostenibilidad y el
            origen puro.
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Comercio Directo:</strong> Sin intermediarios abusivos. El 100% del precio
              fijado va directamente a la MYPE.
            </li>
            <li>
              <strong>Cosecha Sostenible:</strong> Apoyamos el cultivo agroforestal bajo sombra en la
              Reserva de Biósfera Oxapampa-Asháninka-Yánesha.
            </li>
            <li>
              <strong>Identidad y Cultura:</strong> Cada artesanía respeta los saberes ancestrales de
              las comunidades originarias.
            </li>
          </ul>
        </div>
      </Modal>

      {/* Modal: Preferencias del Cliente (I03) */}
      <Modal
        isOpen={isPrefModalOpen}
        onClose={() => setIsPrefModalOpen(false)}
        title="Preferencias de Compra Regional"
        footer={
          <Button variant="primary" onClick={() => setIsPrefModalOpen(false)}>
            Cerrar
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p>
            Configura tus intereses para explorar los productos de la Selva según tus gustos, sin
            ningún tipo de rastreo invasivo ni venta de datos.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsPrefModalOpen(false);
                navigate(`${ROUTES.CATALOG}?categoria=cafe`);
              }}
            >
              ☕ Amante del Café
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsPrefModalOpen(false);
                navigate(`${ROUTES.CATALOG}?categoria=cacao`);
              }}
            >
              🍫 Chocolates & Cacao
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsPrefModalOpen(false);
                navigate(`${ROUTES.CATALOG}?categoria=miel`);
              }}
            >
              🍯 Miel Silvestre
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsPrefModalOpen(false);
                navigate(`${ROUTES.CATALOG}?categoria=artesania`);
              }}
            >
              🌿 Arte Indígena
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
