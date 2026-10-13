import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ROUTES } from '@/shared/config/routes';
import {
  ChevronRight,
  ChevronLeft,
  Sprout,
  ArrowRight,
  Store,
  ShieldCheck,
  QrCode,
  Zap,
  MessageCircle,
} from 'lucide-react';
import styles from './HomePage.module.css';

interface CarouselSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  features: { text: string }[];
  image: string;
  imageAlt: string;
  ctaText?: string;
  ctaLink?: string;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Contador regresivo en vivo para la barra de promociones (tipo Organa)
  const [timeLeft, setTimeLeft] = useState({
    days: 28,
    hours: 9,
    minutes: 11,
    seconds: 41,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Diapositivas interactivas del carrusel central
  const slides: CarouselSlide[] = [
    {
      eyebrow: 'PRODUCTOS DE LA AMAZONÍA PERUANA',
      title: 'Compra local. Descubre la Selva.',
      subtitle: 'Café de altura del Monzón, cacao al 70%, miel virgen y artesanías directas de Tingo María.',
      features: [
        { text: 'Apoyas negocios locales' },
        { text: 'Productos auténticos' },
        { text: 'Envíos a todo el Perú' },
      ],
      image: '/images/hero-amazon-products.jpg',
      imageAlt: 'Café de especialidad, miel pura, chocolate amazónico y cestería indígena',
    },
    {
      eyebrow: 'COSECHA FRESCA DE TINGO MARÍA',
      title: 'Directo del productor sin intermediarios.',
      subtitle: 'Chifles crocantes de Castillo Grande, miel de la Bella Durmiente y pasta de cacao puro para taza.',
      features: [
        { text: 'Castillo Grande & Monzón' },
        { text: 'Cosecha 100% natural' },
        { text: 'Coordinación por WhatsApp' },
      ],
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Chocolatería y derivados de cacao de Tingo María',
      ctaText: 'Ver Cosecha Local',
      ctaLink: `${ROUTES.CATALOG}?ubicacion=Tingo%20Mar%C3%ADa`,
    },
    {
      eyebrow: 'IMPULSA TU MYPE REGIONAL',
      title: '¿Tienes un negocio en la Selva?',
      subtitle: 'Crea tu catálogo online gratis en JUÁCIL y recibe pedidos organizados directamente en tu WhatsApp.',
      features: [
        { text: 'Sin comisiones abusivas' },
        { text: 'Digitalización asistida' },
        { text: 'Cobro por Yape y Plin' },
      ],
      image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      imageAlt: 'Productores cafetaleros y artesanos de la Selva Central',
      ctaText: 'Vender en JUÁCIL',
      ctaLink: ROUTES.REGISTER_BUSINESS,
    },
  ];

  // Auto-avance del carrusel cada 6 segundos
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideInterval);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Productos y negocios desde el almacenamiento local
  const allProducts = LocalStoreRepository.getProducts();
  const featuredProducts = allProducts.slice(0, 8);
  const businesses = LocalStoreRepository.getBusinesses();

  const handleQuickLocation = (loc: string) => {
    navigate(`${ROUTES.CATALOG}?ubicacion=${encodeURIComponent(loc)}`);
  };

  const handleFloatingWhatsApp = () => {
    const text = encodeURIComponent(
      '¡Hola JUÁCIL! Quisiera consultar sobre productos y envíos desde Tingo María y la Selva Central.'
    );
    window.open(`https://wa.me/51962881234?text=${text}`, '_blank');
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

  const activeSlide = slides[currentSlide];

  return (
    <div className={styles.homePage}>
      <div className="container">
        {/* 1. Chips de Ubicaciones Territoriales de Tingo María y Alrededores */}
        <section className={styles.searchSection} aria-label="Zonas de Tingo María">
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
        </section>

        {/* 2. Banner Principal Interactivo (Carrusel en el Centro) */}
        <section className={styles.heroBannerSection} aria-labelledby="banner-heading">
          <div className={styles.carouselWrapper}>
            {/* Botones de navegación izquierda y derecha */}
            <button
              type="button"
              className={`${styles.sliderNavBtn} ${styles.sliderNavBtnLeft}`}
              onClick={handlePrevSlide}
              aria-label="Diapositiva anterior"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              className={`${styles.sliderNavBtn} ${styles.sliderNavBtnRight}`}
              onClick={handleNextSlide}
              aria-label="Siguiente diapositiva"
            >
              <ChevronRight size={24} />
            </button>

            {/* Contenido de la diapositiva */}
            <div className={styles.heroBannerCard}>
              {/* Lado Izquierdo con fondo verde unificado */}
              <div className={styles.heroBannerText}>
                <span className={styles.heroEyebrow}>{activeSlide.eyebrow}</span>
                <h1 id="banner-heading" className={styles.heroTitle}>
                  {activeSlide.title}
                </h1>
                <p className={styles.heroSubtitle}>{activeSlide.subtitle}</p>

                {activeSlide.ctaText && activeSlide.ctaLink ? (
                  <div style={{ marginBottom: '24px' }}>
                    <Link
                      to={activeSlide.ctaLink}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#135d38',
                        padding: '10px 22px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '14px',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {activeSlide.ctaText} <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : null}

                <div className={styles.heroFeaturesRow}>
                  {activeSlide.features.map((feat, idx) => (
                    <div key={idx} className={styles.heroFeatureItem}>
                      <Sprout size={18} className={styles.heroFeatureIcon} />
                      <span>{feat.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lado Derecho con fotografía */}
              <div className={styles.heroBannerMedia}>
                <img
                  src={activeSlide.image}
                  alt={activeSlide.imageAlt}
                  className={styles.heroBannerImage}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/hero-amazon-products.jpg';
                  }}
                />
              </div>
            </div>

            {/* Indicadores de puntos inferiores */}
            <div className={styles.sliderDotsRow}>
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.sliderDot} ${currentSlide === idx ? styles.sliderDotActive : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Ir a diapositiva ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* 3. Barra de Promociones y Contador Regresivo estilo Organa */}
          <div className={styles.promoCountdownBar}>
            <div className={styles.promoBarTitleGroup}>
              <h3 className={styles.promoBarTitle}>
                <Zap size={20} fill="#ffffff" /> PROMOS TINGO MARÍA 💚
              </h3>
              <span className={styles.promoTimeTag}>¡POR TIEMPO LIMITADO!</span>
            </div>

            <div className={styles.countdownBlocks}>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownVal}>
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className={styles.countdownLabel}>Días</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownVal}>
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className={styles.countdownLabel}>Horas</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownVal}>
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className={styles.countdownLabel}>Minutos</span>
              </div>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownVal}>
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className={styles.countdownLabel}>Segundos</span>
              </div>
            </div>

            <Link to={ROUTES.CATALOG} className={styles.promoButtonLink}>
              Ver Promociones <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </Link>
          </div>
        </section>

        {/* 4. Sección "Explora por categoría" */}
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
                      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=200&q=80';
                  }}
                />
                <span className={styles.categoryTitle}>{cat.title}</span>
                <ChevronRight size={18} className={styles.categoryArrow} />
              </Link>
            ))}
          </div>
        </section>

        {/* 5. Sección "Productos destacados" */}
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

        {/* 6. Emprendimientos y MYPES de la Región */}
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

        {/* 7. Banner para Vendedores / Registrar Emprendimiento */}
        <div className={styles.registerBanner}>
          <Store size={36} color="#bbf7d0" />
          <h2 className={styles.registerBannerTitle}>
            ¿Tienes un emprendimiento en Tingo María o la Selva?
          </h2>
          <p className={styles.registerBannerText}>
            Crea tu tienda virtual en minutos, digitaliza tu catálogo y recibe pedidos directamente
            en tu WhatsApp personal sin comisiones abusivas.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="accent"
              size="lg"
              leftIcon={<Store size={18} />}
              onClick={() => navigate(ROUTES.REGISTER_BUSINESS)}
              style={{ backgroundColor: '#ffffff', color: '#135d38', borderColor: '#ffffff' }}
            >
              Registrar mi Tienda Gratis
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(ROUTES.HELP)}
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.6)' }}
            >
              Conocer Cómo Funciona
            </Button>
          </div>
        </div>
      </div>

      {/* 8. Cómo comprar en JUÁCIL en 3 pasos */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#135d38', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Proceso Simple y Transparente
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', color: '#112117' }}>
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

      {/* Botón Flotante de WhatsApp tipo Organa */}
      <button
        type="button"
        className={styles.floatingWhatsApp}
        onClick={handleFloatingWhatsApp}
        title="Consultar por WhatsApp con JUÁCIL"
        aria-label="Abrir WhatsApp"
      >
        <MessageCircle size={30} />
      </button>

      {/* Modales Informativos */}
      <Modal
        isOpen={isExpModalOpen}
        onClose={() => setIsExpModalOpen(false)}
        title="Experiencia de Compra JUÁCIL"
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} color="#135d38" />
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
            <QrCode size={32} color="#135d38" />
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
