import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { ROUTES } from '@/shared/config/routes';
import {
  ArrowRight,
  Store,
  ShieldCheck,
  QrCode,
  Zap,
  MessageCircle,
  ShoppingBag,
  CheckCircle2,
  ShoppingCart,
} from 'lucide-react';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [isPrefModalOpen, setIsPrefModalOpen] = useState(false);

  // Contador regresivo en vivo para la barra de promociones
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

  // Productos y negocios desde el almacenamiento local
  const allProducts = LocalStoreRepository.getProducts();
  const featuredProducts = allProducts.slice(0, 8);
  const businesses = LocalStoreRepository.getBusinesses();

  const handleFloatingWhatsApp = () => {
    const text = encodeURIComponent(
      '¡Hola JUÁCIL! Quisiera consultar sobre productos y envíos desde Tingo María y la Selva Central.'
    );
    window.open(`https://wa.me/51962881234?text=${text}`, '_blank');
  };

  const homeCategories = [
    {
      id: 'abarrotes',
      title: 'Abarrotes & Canasta Básica',
      badge: 'Esencial',
      description: 'Arroz, azúcar, aceites, fideos, menestras y conservas familiares y mayoristas.',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'hogar',
      title: 'Hogar, Papelería & Limpieza',
      badge: 'Empresas & Hogar',
      description: 'Papel higiénico, servilletas, detergentes, lejía y útiles de aseo.',
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cafe',
      title: 'Café de Especialidad & Altura',
      badge: '84+ Puntos',
      description: 'Cafés de altura del Monzón y Castillo Grande, molido y grano tostado.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cacao',
      title: 'Cacao, Chocolate & Confitería',
      badge: 'Cacao Nativo',
      description: 'Tabletas al 70%, pasta pura tradicional y nibs crocantes.',
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'miel',
      title: 'Miel Pura & Apicultura',
      badge: '100% Virgen',
      description: 'Miel de monte de la Bella Durmiente, propóleo silvestre y polen puro.',
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'frutas',
      title: 'Frutas, Chifles & Snacks',
      badge: 'Crocantes',
      description: 'Chifles de plátano bellaco de Castillo Grande, frutas secas y snacks.',
      imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'licores',
      title: 'Bebidas & Licores Amazónicos',
      badge: 'Tradicional',
      description: 'Uvachado, 7 Raíces, chuchuhuasi y macerados típicos de Tingo María.',
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'artesania',
      title: 'Artesanías & Cultura Amazónica',
      badge: 'Hecho a Mano',
      description: 'Tallados en madera noble, huayruro y recuerdos emblemáticos de la selva.',
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'superfoods',
      title: 'Superfoods & Derivados del Campo',
      badge: 'Nutrición',
      description: 'Sacha inchi, harina de plátano, aguaje y productos naturales de la región.',
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <div className={styles.homePage}>
      {/* 1. Banner Principal de Esquina a Esquina (Dual Images + Misión Central de la Tienda) */}
      <section className={styles.fullWidthHeroSection} aria-labelledby="hero-heading">
        {/* Lado Izquierdo: Carrito lleno de productos de tienda (arroz, papel, abarrotes) */}
        <div className={styles.heroSideMediaLeft}>
          <img
            src="/images/hero-cart-groceries.jpg"
            alt="Carrito de compras repleto de arroz, papel higiénico, despensa y abarrotes"
            className={styles.heroSideImg}
          />
          <div className={styles.heroOverlayLeft} />
        </div>

        {/* Lado Derecho: Estantes y almacén lleno de productos arrumados variados */}
        <div className={styles.heroSideMediaRight}>
          <img
            src="/images/hero-stacked-goods.jpg"
            alt="Gran variedad de productos, mercadería y alimentos en exhibición"
            className={styles.heroSideImg}
          />
          <div className={styles.heroOverlayRight} />
        </div>

        {/* Centro: Mensaje de Misión y Enfoque de JUÁCIL */}
        {/* Centro: Mensaje Integrado sin tarjeta (Captura 1 + Captura 2) */}
        <div className={styles.heroIntegratedContent}>
          <div className={styles.heroEyebrowTag}>
            <ShoppingBag size={13} /> MERCADO ONLINE • TINGO MARÍA & SELVA CENTRAL
          </div>

          <h1 id="hero-heading" className={styles.heroIntegratedTitle}>
            Todo para tu <span className={styles.heroHighlightUnderline}>hogar</span> y <span className={styles.heroHighlightUnderline}>negocio</span>.
          </h1>

          <p className={styles.heroIntegratedSubtitle}>
            Compra fácil en las tiendas de Tingo María y la Selva Central. Canasta básica familiar, abarrotes y productos locales.
          </p>

          <div className={styles.heroActionsRow}>
            <Link to={ROUTES.CATALOG} className={styles.heroBtnPrimary}>
              <ShoppingCart size={16} /> Ver catálogo
            </Link>
            <Link to={`${ROUTES.CATALOG}?categoria=abarrotes`} className={styles.heroBtnSecondary}>
              <ShoppingBag size={15} /> Abarrotes & Canasta
            </Link>
            <Link to={ROUTES.REGISTER_BUSINESS} className={styles.heroLinkSell}>
              Vende en JUÁCIL <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.heroPillsRow}>
            <div className={styles.heroPillItem}>
              <CheckCircle2 size={15} color="#84cc16" />
              <span>Para Familias y Negocios</span>
            </div>
            <div className={styles.heroPillItem}>
              <CheckCircle2 size={15} color="#84cc16" />
              <span>Precios de Bodega y Mayorista</span>
            </div>
            <div className={styles.heroPillItem}>
              <CheckCircle2 size={15} color="#84cc16" />
              <span>Envíos en Tingo María y Todo el Perú</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* 2. Barra de Promociones y Contador Regresivo estilo Organa */}
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

          <Link to={`${ROUTES.CATALOG}?ofertas=true`} className={styles.promoButtonLink}>
            Ver Promociones <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </Link>
        </div>

        {/* 3. Sección "Explora por categoría" - Fondo Claro Diferenciado con Fotos */}
        <section className={styles.sectionCategoriesCard} aria-labelledby="categories-heading">
          <div className={styles.sectionHeaderRow}>
            <h2 id="categories-heading" className={styles.sectionHeading}>
              Explora por categoría
            </h2>
            <Link to={ROUTES.CATALOG} className={styles.sectionViewAllLink}>
              Ver todo el catálogo <ArrowRight size={16} />
            </Link>
          </div>

          <div className={styles.categoriesGrid}>
            {homeCategories.map((cat) => (
              <div
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => navigate(`${ROUTES.CATALOG}?categoria=${cat.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`${ROUTES.CATALOG}?categoria=${cat.id}`)}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.title}
                  className={styles.categoryCardThumb}
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80';
                  }}
                />
                <div className={styles.categoryCardBody}>
                  <div className={styles.categoryCardHeader}>
                    <h3 className={styles.categoryCardTitle}>{cat.title}</h3>
                    <span className={styles.categoryCardBadge}>{cat.badge}</span>
                  </div>
                  <p className={styles.categoryCardDesc}>{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Sección "Productos destacados" - Fondo Claro Diferenciado */}
        <section className={styles.sectionProductsCard} aria-labelledby="featured-products-heading">
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

        {/* 5. Emprendimientos y MYPES de la Región - Fondo Claro Diferenciado */}
        <section className={styles.sectionBusinessesCard} aria-labelledby="businesses-heading">
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
