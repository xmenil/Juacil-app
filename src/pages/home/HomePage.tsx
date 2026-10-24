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
  Sun,
  Apple,
  Footprints,
  Shirt,
  Hammer,
  Boxes,
  Smartphone,
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
      id: 'calzado-moda',
      title: 'Calzado y zapatillas',
      icon: Footprints,
      imageUrl: '/images/products/prod_zapatillas_urbanas_1792017893233.jpg',
    },
    {
      id: 'ropa-textil',
      title: 'Ropa y polos',
      icon: Shirt,
      imageUrl: '/images/products/prod_polos_algodon_1792017944753.jpg',
    },
    {
      id: 'ferreteria',
      title: 'Ferretería y herramientas',
      icon: Hammer,
      imageUrl: '/images/products/prod_taladro_percutor_1792018046434.jpg',
    },
    {
      id: 'plastiqueria',
      title: 'Plastiquería y hogar',
      icon: Boxes,
      imageUrl: '/images/products/prod_balde_plastico_1792869898399.jpg',
    },
    {
      id: 'tecnologia',
      title: 'Tecnología y celulares',
      icon: Smartphone,
      imageUrl: '/images/products/prod_auriculares_bluetooth_1792870212802.jpg',
    },
    {
      id: 'abarrotes',
      title: 'Abarrotes y canasta básica',
      icon: ShoppingBasket,
      imageUrl: '/images/products/prod_arroz_saco_1792870049422.jpg',
    },
    {
      id: 'hogar',
      title: 'Hogar y limpieza',
      icon: Sparkles,
      imageUrl: '/images/products/prod_papel_higienico_1792870086439.jpg',
    },
    {
      id: 'cafe',
      title: 'Café de especialidad',
      icon: Coffee,
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'cacao',
      title: 'Cacao, chocolate y miel',
      icon: Sun,
      imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=300&q=80',
    },
    {
      id: 'frutas',
      title: 'Frutas y snacks selva',
      icon: Apple,
      imageUrl: '/images/products/prod_chifles_bellaco_1792870167740.jpg',
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