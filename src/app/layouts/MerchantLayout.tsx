import React from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Package, Store, ArrowUpRight, LogOut } from 'lucide-react';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import styles from './MerchantLayout.module.css';

const navigation = [
  { tab: 'reportes', label: 'Resumen', icon: LayoutDashboard },
  { tab: 'pedidos', label: 'Pedidos', icon: ShoppingBag },
  { tab: 'productos', label: 'Productos', icon: Package },
  { tab: 'perfil', label: 'Mi tienda', icon: Store },
] as const;

export const MerchantLayout: React.FC = () => {
  const { currentUser, businessId, isAdmin, logout } = useSession();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const activeBusinessId = businessId || 'biz-cafe-aroma';
  const business = LocalStoreRepository.getBusinessById(activeBusinessId);
  const tab = searchParams.get('tab');
  const activeTab = pathname.startsWith(ROUTES.MERCHANT_PRODUCTS) ? 'productos'
    : pathname.startsWith(ROUTES.MERCHANT_ORDERS) ? 'pedidos'
    : pathname === ROUTES.MERCHANT_BUSINESS ? 'perfil'
    : navigation.some(item => item.tab === tab) ? tab : 'reportes';

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <DemoUserSwitcher />
      <div className={styles.merchantRoot}>
      <a href="#merchant-content" className={styles.skipLink}>Ir al contenido</a>
      <aside className={styles.sidebar} aria-label="Panel de tienda">
        <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=reportes`} className={styles.brand} aria-label="JUÁCIL, resumen de tu tienda">
          <img src="/images/juacil-logo.png" alt="" className={styles.brandLogo} />
          <span>Tu tienda online<span className={styles.brandContext}>Panel de tienda</span></span>
        </Link>
        <span className={styles.navLabel}>Gestión de tu negocio</span>
        <nav className={styles.navigation} aria-label="Panel del emprendedor">
          {navigation.map(({ tab: itemTab, label, icon: Icon }) => (
            <Link key={itemTab} to={`${ROUTES.MERCHANT_DASHBOARD}?tab=${itemTab}`}
              className={`${styles.navLink} ${activeTab === itemTab ? styles.navLinkActive : ''}`}
              aria-current={activeTab === itemTab ? 'page' : undefined}>
              <Icon size={19} aria-hidden="true" /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.sidebarFooter}>
          <p>Tu tienda en JUÁCIL<span>Productos, pedidos y datos de tu negocio.</span></p>
          <Link to={ROUTES.HOME} className={styles.marketLink}>Ver marketplace <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.topbar}>
          <div className={styles.storeIdentity}>
            <div className={styles.breadcrumb}>Panel de tienda <span>/</span><strong>{navigation.find(item => item.tab === activeTab)?.label}</strong></div>
            <strong className={styles.storeName}>{business?.name || 'Mi tienda'}</strong>
            {business && <span className={styles.location}>{business.location}</span>}
          </div>
          <div className={styles.headerActions}>
            {business && (
              <Link to={ROUTES.STORE_DETAIL(business.id)} target="_blank" rel="noopener noreferrer" className={styles.publicLink}>
                Ver mi tienda <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only"> (se abre en otra pestaña)</span>
              </Link>
            )}
            <div className={styles.account}>
              <span className={styles.avatar} aria-hidden="true">{currentUser?.name.charAt(0).toUpperCase()}</span>
              <div className={styles.accountText}><strong>{currentUser?.name}</strong><span>{isAdmin ? 'Administrador general' : 'Emprendedor'}</span></div>
              <button type="button" className={styles.logout} onClick={handleLogout} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={19} aria-hidden="true" /></button>
            </div>
          </div>
        </header>
        {isAdmin && (
          <div className={styles.scopeNotice}>
            <p>Estás en el panel de una tienda{!businessId ? ' de demostración' : ''} con tu cuenta de administrador general.</p>
            <Link to={ROUTES.ADMIN_DASHBOARD} className={styles.adminLink}>Volver al panel general <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        )}
        <main id="merchant-content" tabIndex={-1} className={styles.contentArea}><Outlet /></main>
        <footer className={styles.footer}>JUÁCIL · Negocios de la Selva Central</footer>
      </div>
    </div>
  </div>
  );
};
