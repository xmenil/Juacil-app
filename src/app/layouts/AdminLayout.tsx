import React from 'react';
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ShoppingBag, ArrowUpRight, LogOut, BarChart3 } from 'lucide-react';
import { useSession } from '@/app/providers/SessionProvider';
import { getAdminSection } from '@/pages/admin/adminNavigation';
import { ROUTES } from '@/shared/config/routes';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import styles from './AdminLayout.module.css';

const navigation = [
  { id: 'resumen', label: 'Resumen', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { id: 'tiendas', label: 'Tiendas', to: ROUTES.ADMIN_STORES, icon: Store },
  { id: 'usuarios', label: 'Usuarios', to: ROUTES.ADMIN_USERS, icon: Users },
  { id: 'pedidos', label: 'Pedidos', to: ROUTES.ADMIN_ORDERS, icon: ShoppingBag },
  { id: 'encuestas', label: 'Encuestas UX', to: ROUTES.ADMIN_SURVEYS, icon: BarChart3 },
] as const;

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const active = getAdminSection(location.pathname, params.get('tab'));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <DemoUserSwitcher />
      <div className={styles.root}>
        <a href="#admin-content" className={styles.skipLink}>Ir al contenido</a>
        <aside className={styles.sidebar} aria-label="Administración">
          <Link to="/admin" className={styles.brand} aria-label="JUÁCIL, resumen de administración">
            <img src="/images/juacil-logo.png" alt="JUÁCIL" />
            <span>Tu tienda online<span className={styles.brandContext}>Administración</span></span>
          </Link>
          <span className={styles.navLabel}>Gestión de la plataforma</span>
          <nav className={styles.navigation} aria-label="Secciones de administración">
            {navigation.map(({ id, label, to, icon: Icon }) => (
              <Link key={id} to={to} className={active === id ? styles.activeLink : styles.navLink}
                aria-current={active === id ? 'page' : undefined}>
                <Icon size={19} aria-hidden="true" /><span>{label}</span>
              </Link>
            ))}
          </nav>
          <div className={styles.sidebarFooter}>
            <p>Prototipo frontend<span>Datos guardados en este navegador.</span></p>
            <Link to={ROUTES.HOME} className={styles.marketLink}>Ver marketplace <ArrowUpRight size={17} aria-hidden="true" /></Link>
          </div>
        </aside>
        <div className={styles.workspace}>
          <header className={styles.topbar}>
            <div className={styles.breadcrumb}>Administración <span>/</span> <strong>{navigation.find(item => item.id === active)?.label}</strong></div>
            <div className={styles.account}>
              <span className={styles.avatar} aria-hidden="true">{currentUser?.name.charAt(0).toUpperCase()}</span>
              <div className={styles.accountText}><strong>{currentUser?.name}</strong><span>Administrador</span></div>
              <button className={styles.logout} aria-label="Cerrar sesión" title="Cerrar sesión"
                onClick={() => { logout(); navigate(ROUTES.HOME); }}><LogOut size={19} aria-hidden="true" /></button>
            </div>
          </header>
          <main id="admin-content" tabIndex={-1} className={styles.content}><Outlet /></main>
          <footer className={styles.footer}>JUÁCIL · Gestión de MYPES de la Selva Central</footer>
        </div>
      </div>
    </div>
  );
};
