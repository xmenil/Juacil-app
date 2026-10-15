import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import styles from './Auth.module.css';

interface Props {
  title: string;
  description: string;
  children: ReactNode;
  business?: boolean;
}
export function AuthLayout({ title, description, children, business = false }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to={ROUTES.HOME} className={styles.brand} aria-label="JUÁCIL, volver al inicio">
          <img src="/images/juacil-logo.png" alt="" />
          <span><strong>JUÁCIL</strong><small>Tu tienda online</small></span>
        </Link>
        <Link to={ROUTES.CATALOG} className={styles.back}><ArrowLeft size={16} aria-hidden="true" /> Volver al catálogo</Link>
      </header>
      <main className={styles.layout}>
        <section className={styles.content} aria-labelledby="auth-title">
          <div className={styles.formContent}>
            <p className={styles.eyebrow}>{business ? 'Para emprendedores' : 'Tu cuenta en JUÁCIL'}</p>
            <h1 id="auth-title">{title}</h1>
            <p className={styles.description}>{description}</p>
            {children}
          </div>
        </section>
        <aside className={styles.story} aria-label={business ? 'Cómo comenzar a vender' : 'Productos de la Selva'}>
          <div className={styles.storyText}>
            <span className={styles.storyPill}>🌱 Mercado Local de la Selva</span>
            <h2>{business ? 'Haz crecer tu negocio en Tingo María y la región' : 'Todo lo que necesitas, directo de nuestras MYPES.'}</h2>
            <p>{business ? 'Digitaliza tu tienda y recibe pedidos directos por WhatsApp.' : 'Compra calzado, ropa, tecnología, alimentos y más con entrega rápida y trato directo.'}</p>
            <div className={styles.storyHighlights}>
              <span>✨ +10 Tiendas locales</span>
              <span>🛵 Envíos a todo el Perú</span>
              <span>💬 Contacto directo</span>
            </div>
          </div>
          {business ? (
            <ol className={styles.steps}>
              <li aria-current="step"><span>1</span><div><strong>Cuéntanos sobre tu negocio</strong><p>Completa tus datos en este formulario.</p></div></li>
              <li><span>2</span><div><strong>Sube tu primer producto</strong><p>Agrega una foto, su precio y disponibilidad.</p></div></li>
              <li><span>3</span><div><strong>Recibe tu primera orden</strong><p>Revisa el pedido y coordina con el cliente.</p></div></li>
            </ol>
          ) : (
            <div className={styles.showcaseWrap}>
              <img src="/images/auth-products-showcase.png" alt="Productos de emprendedores locales de la Selva" className={styles.showcaseImg} />
            </div>
          )}
          <p className={styles.storyFoot}>JUÁCIL · Marketplace de micro y pequeñas empresas de la Selva Central</p>
        </aside>
      </main>
      <footer className={styles.footer}><span>JUÁCIL · Tu tienda online</span><Link to={ROUTES.HELP}>¿Necesitas ayuda?</Link></footer>
    </div>
  );
}
