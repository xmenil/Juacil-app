import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { Button } from '@/shared/ui/Button';

import { ROUTES } from '@/shared/config/routes';
import {
  ArrowRight,
  Store,
  ShoppingBasket,
  Sparkles,
  Coffee,
  Leaf,
  Sun,
  Apple,
  Wine,
  Feather,
} from 'lucide-react';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroImageFailed, setHeroImageFailed] = useState(false);
  const [failedCategoryImages, setFailedCategoryImages] = useState<string[]>([]);

  // Productos y negocios desde el almacenamiento local
  const allProducts = LocalStoreRepository.getProducts();
  const featuredProducts = allProducts.slice(0, 8);
  const businesses = LocalStoreRepository.getBusinesses();

const homeCategories = [
    {
      id: 'abarrotes',
      title: 'Abarrotes y canasta básica',
      icon: ShoppingBasket,
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'hogar',
      title: 'Hogar, papelería y limpieza',
      icon: Sparkles,
      imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cafe',
      title: 'Café',
      icon: Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cacao',
      title: 'Cacao y chocolate',
      icon: Leaf,
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'miel',
      title: 'Miel y apicultura',
      icon: Sun,
      imageUrl: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'frutas',
      title: 'Frutas y snacks',
      icon: Apple,
      imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'licores',
      title: 'Bebidas y licores',
      icon: Wine,
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'artesania',
      title: 'Artesanías',
      icon: Feather,
      imageUrl: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'superfoods',
      title: 'Productos del campo',
      icon: Leaf,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
    },
  ];

  return (
    <div className={styles.homePage}>
      <section className={styles.introSection} aria-labelledby="hero-heading">
        <div className={`container ${styles.introLayout}`}>
          <div className={styles.introContent}>
            <p className={styles.introBrand}>JUÁCIL · Tu tienda online</p>
            <h1 id="hero-heading" className={styles.introTitle}>
              Productos para tu hogar y negocio
            </h1>
            <p className={styles.introDescription}>
              Encuentra abarrotes, artículos del hogar, café, cacao y más de las tiendas de la comunidad.
            </p>
            <Button
              variant="accent"
              onClick={() => navigate(ROUTES.CATALOG)}
              rightIcon={<ArrowRight className={styles.introActionIcon} />}
            >
              Ver catálogo
            </Button>
          </div>
          {!heroImageFailed && (
            <img
              src="/images/hero-cart-groceries.jpg"
              alt="Carrito con abarrotes y artículos para el hogar"
              className={styles.introImage}
              onError={() => setHeroImageFailed(true)}
            />
          )}
        </div>
      </section>

      <div className="container">
        <section className={styles.homeProducts} aria-labelledby="featured-products-heading">
          <div className={styles.homeProductsHeader}>
            <div>
              <h2 id="featured-products-heading">Productos de las tiendas</h2>
              <p>Revisa precios, disponibilidad y quién ofrece cada producto.</p>
            </div>
            <Link to={ROUTES.CATALOG} className={styles.homeProductsLink}>
              Ver más productos <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          {featuredProducts.length > 0 ? (
            <div className={styles.homeProductsGrid}>
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.homeProductsEmpty}>
              <h3>Aún no hay productos para mostrar.</h3>
              <p>Puedes revisar las tiendas disponibles en el catálogo.</p>
              <Link to={`${ROUTES.CATALOG}?filtro=tiendas`} className={styles.homeProductsLink}>
                Ver tiendas <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        {/* 3. Sección "Explora por categoría" - Fondo Claro Diferenciado con Fotos */}
        <section className={styles.homeCategories} aria-labelledby="categories-heading">
          <div className={styles.homeProductsHeader}>
            <h2 id="categories-heading">
              Explora por categoría
            </h2>
            <Link to={ROUTES.CATALOG} className={styles.homeProductsLink}>
              Ver todas las categorías <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <ul className={styles.homeCategoriesGrid}>
            {homeCategories.map((cat) => (
              <li key={cat.id}>
              <Link
                className={styles.homeCategoryLink}
                to={`${ROUTES.CATALOG}?categoria=${cat.id}`}
              >
                {failedCategoryImages.includes(cat.id) ? (
                  <span className={styles.homeCategoryFallback} aria-hidden="true"><cat.icon /></span>
                ) : (
                <img
                  src={cat.imageUrl}
                  alt=""
                  className={styles.homeCategoryImage}
                  loading="lazy"
                  onError={() => setFailedCategoryImages((previous) => previous.includes(cat.id) ? previous : [...previous, cat.id])}
                />
                )}
                <span className={styles.homeCategoryName}>{cat.title}</span>
              </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 5. Emprendimientos y MYPES de la Región - Fondo Claro Diferenciado */}
        <section className={styles.homeBusinesses} aria-labelledby="businesses-heading">
          <div className={styles.homeProductsHeader}>
            <div>
              <h2 id="businesses-heading">Conoce las tiendas</h2>
              <p>Revisa qué ofrece cada negocio y dónde se encuentra.</p>
            </div>
            <Link to={`${ROUTES.CATALOG}?filtro=tiendas`} className={styles.homeProductsLink}>
              Ver todas las tiendas <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          {businesses.length > 0 ? (
          <div className={styles.homeBusinessesGrid}>
            {businesses.slice(0, 3).map((biz) => (
              <BusinessCard key={biz.id} business={biz} />
            ))}
          </div>
          ) : (
            <div className={styles.homeProductsEmpty}>
              <h3>Aún no hay tiendas para mostrar.</h3>
              <p>Puedes continuar explorando el catálogo.</p>
              <Link to={ROUTES.CATALOG} className={styles.homeProductsLink}>
                Ver catálogo <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <section className={styles.purchaseGuide} aria-labelledby="purchase-guide-heading">
          <div className={styles.homeProductsHeader}>
            <h2 id="purchase-guide-heading">Cómo comprar en JUÁCIL</h2>
            <Link to={ROUTES.HELP} className={styles.homeProductsLink}>
              Consultar cómo funciona <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <ol className={styles.purchaseSteps}>
            <li>
              <h3>Elige tus productos</h3>
              <p>Explora el catálogo y agrega al carrito productos de una tienda.</p>
            </li>
            <li>
              <h3>Confirma tu pedido</h3>
              <p>Completa tus datos y elige recojo o coordinación de envío. En esta demo obtendrás un código de pedido.</p>
            </li>
            <li>
              <h3>Coordina con la tienda</h3>
              <p>Abre el mensaje preparado de WhatsApp para acordar el pago y la entrega.</p>
            </li>
          </ol>
        </section>

        <section className={styles.registerSection} aria-labelledby="register-heading">
          <div className={styles.registerContent}>
            <h2 id="register-heading">¿Tienes un emprendimiento?</h2>
            <p>Registra tu tienda en la demo de JUÁCIL y prepara tu catálogo de productos.</p>
          </div>
          <Button
            variant="outline"
            className={styles.registerAction}
            onClick={() => navigate(ROUTES.REGISTER_BUSINESS)}
            leftIcon={<Store className={styles.introActionIcon} />}
          >
            Registrar mi tienda
          </Button>
        </section>

        <section className={styles.helpSection} aria-labelledby="help-heading">
          <div>
            <h2 id="help-heading">¿Necesitas ayuda para comprar?</h2>
            <p>Consulta cómo preparar tu pedido y coordinar con una tienda.</p>
          </div>
          <Link to={ROUTES.HELP} className={styles.homeProductsLink}>
            Ir al centro de ayuda <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
};