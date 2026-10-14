import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  Store,
  Tag,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { ROUTES } from '@/shared/config/routes';
import styles from './MobileBottomNav.module.css';

interface MobileBottomNavProps {
  onOpenCategories: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenCategories }) => {
  const { itemCount } = useCart();
  const { currentUser, isMerchant } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (!currentUser) {
      navigate(ROUTES.LOGIN);
    } else if (isMerchant) {
      navigate(ROUTES.MERCHANT_DASHBOARD);
    } else {
      navigate(ROUTES.CUSTOMER_ORDERS);
    }
  };

  const isAccountActive =
    location.pathname.startsWith('/panel') ||
    location.pathname.startsWith('/mis-pedidos') ||
    location.pathname === '/acceso';

  return (
    <nav className={styles.mobileBottomBar} aria-label="Navegación principal móvil">
      {/* 1. Inicio */}
      <NavLink
        to={ROUTES.HOME}
        className={({ isActive }) =>
          [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
        }
        end
      >
        <div className={styles.iconWrapper}>
          <Home size={20} />
        </div>
        <span>Inicio</span>
      </NavLink>

      {/* 2. Categorías (Abre el panel mega-overlay) */}
      <button
        type="button"
        className={styles.navItem}
        onClick={onOpenCategories}
        aria-label="Abrir todas las categorías"
      >
        <div className={styles.iconWrapper}>
          <LayoutGrid size={20} />
        </div>
        <span>Categorías</span>
      </button>

      {/* 3. Tiendas */}
      <NavLink
        to={`${ROUTES.CATALOG}?filtro=tiendas`}
        className={({ isActive }) =>
          [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
        }
      >
        <div className={styles.iconWrapper}>
          <Store size={20} />
        </div>
        <span>Tiendas</span>
      </NavLink>

      {/* 4. Ofertas */}
      <NavLink
        to={`${ROUTES.CATALOG}?ofertas=true`}
        className={({ isActive }) =>
          [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
        }
      >
        <div className={styles.iconWrapper}>
          <Tag size={20} />
        </div>
        <span>Ofertas</span>
      </NavLink>

      {/* 5. Carrito - Lleva directo a /carrito */}
      <NavLink
        to={ROUTES.CART}
        className={({ isActive }) =>
          [styles.navItem, isActive ? styles.navItemActive : ''].join(' ')
        }
        aria-label="Ver carrito de compras"
      >
        <div className={styles.iconWrapper}>
          <ShoppingCart size={20} />
          {itemCount > 0 && <span className={styles.badge}>{itemCount}</span>}
        </div>
        <span>Carrito</span>
      </NavLink>

      {/* 6. Mi Cuenta / Panel */}
      <button
        type="button"
        className={[styles.navItem, isAccountActive ? styles.navItemActive : ''].join(' ')}
        onClick={handleAccountClick}
        aria-label="Mi Cuenta o Panel"
      >
        <div className={styles.iconWrapper}>
          <User size={20} />
        </div>
        <span>{currentUser ? (isMerchant ? 'Panel' : 'Cuenta') : 'Ingresar'}</span>
      </button>
    </nav>
  );
};
