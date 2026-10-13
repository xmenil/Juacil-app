import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { APP_METADATA } from '@/shared/config/constants';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <div className={styles.logoBox}>
            <img
              src="/images/juacil-logo.png"
              alt="JUÁCIL - Tu tienda online"
              className={styles.logoImg}
            />
            <span className={styles.brandTitle}>JUÁCIL</span>
          </div>
          <p className={styles.desc}>
            {APP_METADATA.description}
          </p>
          <div className={styles.disclaimerBadge}>
            🌱 Proyecto formativo de innovación para la Selva Central del Perú (2026).
          </div>
        </div>

        <div>
          <h4 className={styles.colTitle}>Navegación</h4>
          <ul className={styles.linkList}>
            <li>
              <Link to={ROUTES.HOME} className={styles.link}>
                Inicio
              </Link>
            </li>
            <li>
              <Link to={ROUTES.CATALOG} className={styles.link}>
                Catálogo de Productos
              </Link>
            </li>
            <li>
              <Link to={ROUTES.HELP} className={styles.link}>
                Centro de Ayuda y Preguntas
              </Link>
            </li>
            <li>
              <Link to={ROUTES.HELP} className={styles.link}>
                Cuestionario de Validación
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Emprendedores</h4>
          <ul className={styles.linkList}>
            <li>
              <Link to={ROUTES.REGISTER_BUSINESS} className={styles.link}>
                Registra tu MYPE
              </Link>
            </li>
            <li>
              <Link to={ROUTES.LOGIN} className={styles.link}>
                Acceso al Panel Comercial
              </Link>
            </li>
            <li>
              <Link to={ROUTES.HELP} className={styles.link}>
                Guía de 3 pasos para vender
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Regiones</h4>
          <ul className={styles.linkList}>
            <li className={styles.link}>Chanchamayo (La Merced / San Ramón)</li>
            <li className={styles.link}>Oxapampa (Reserva de Biósfera)</li>
            <li className={styles.link}>Villa Rica (Tierra del Café)</li>
            <li className={styles.link}>Satipo & Pichanaqui</li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottomBar}`}>
        <span>
          © 2026 JUÁCIL – "Tu tienda online". Prototipo funcional demostrativo de frontend.
        </span>
        <span>
          Sin transacciones financieras reales • Coordinación digital simulada por WhatsApp
        </span>
      </div>
    </footer>
  );
};
