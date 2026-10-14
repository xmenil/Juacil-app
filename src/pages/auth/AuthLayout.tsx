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
            <p className={styles.storyEyebrow}>Hecho en la Selva. Cerca de ti.</p>
            <h2>{business ? 'Tu negocio tiene un lugar aquí.' : 'Detrás de cada producto, un negocio de nuestra Selva.'}</h2>
            <p>{business ? 'Presenta lo que produces, organiza tu catálogo y coordina tus pedidos directamente con tus clientes.' : 'Café, cacao, miel y artesanías de pequeños negocios. Encuentra sus productos y coordina tu compra con quienes los elaboran.'}</p>
          </div>
          {business ? (
            <ol className={styles.steps}>
              <li aria-current="step"><span>1</span><div><strong>Cuéntanos sobre tu negocio</strong><p>Completa tus datos en este formulario.</p></div></li>
              <li><span>2</span><div><strong>Sube tu primer producto</strong><p>Agrega una foto, su precio y disponibilidad.</p></div></li>
              <li><span>3</span><div><strong>Recibe tu primera orden</strong><p>Revisa el pedido y coordina con el cliente.</p></div></li>
            </ol>
          ) : (
            <figure className={styles.photo}>
              <img src="/images/hero-amazon-products.jpg" alt="Presentación ilustrativa de café, miel, cacao y artesanía de la Selva peruana" />
              <figcaption>Productos de la Selva peruana · Imagen ilustrativa</figcaption>
            </figure>
          )}
          <p className={styles.storyFoot}>Un marketplace para las MYPES y sus clientes.</p>
        </aside>
      </main>
      <footer className={styles.footer}><span>JUÁCIL · Tu tienda online</span><Link to={ROUTES.HELP}>¿Necesitas ayuda?</Link></footer>
    </div>
  );
}
