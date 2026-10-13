import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, LayoutDashboard, UserCheck, HelpCircle, Store, WifiOff } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { currentUser, isMerchant, isClient, logout } = useSession();
  const { isOnline } = useConnectivity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {!isOnline && (
        <div className={styles.offlineBanner} role="status">
          <WifiOff size={16} />
          <span>
            <strong>Modo Sin Conexión Activo.</strong> Puedes consultar el catálogo y tus borradores,
            pero la confirmación de pedidos requiere red.
          </span>
        </div>
      )}

      <header className={styles.navbar}>
        <div className={`container ${styles.inner}`}>
          {/* Logo y Marca */}
          <Link to={ROUTES.HOME} className={styles.brand} aria-label="Ir a inicio de JUÁCIL">
            <img
              src="/images/juacil-logo.png"
              alt="Logo oficial JUÁCIL - Bolsa con vegetación y montañas de la Selva"
              className={styles.logoImg}
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>JUÁCIL</span>
              <span className={styles.brandSlogan}>Tu tienda online</span>
            </div>
          </Link>

          {/* Enlaces de Navegación de Escritorio */}
          <nav className={styles.navLinks} aria-label="Navegación principal">
            <NavLink
              to={ROUTES.HOME}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
              }
              end
            >
              Inicio
            </NavLink>
            <NavLink
              to={ROUTES.CATALOG}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
              }
            >
              Catálogo de la Selva
            </NavLink>
            <NavLink
              to={ROUTES.HELP}
              className={({ isActive }) =>
                [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
              }
            >
              Ayuda & Validación
            </NavLink>

            {isMerchant && (
              <NavLink
                to={ROUTES.MERCHANT_DASHBOARD}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
              >
                Panel MYPE
              </NavLink>
            )}

            {isClient && (
              <NavLink
                to={ROUTES.CUSTOMER_ORDERS}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.navLinkActive : ''].join(' ')
                }
              >
                Mis Pedidos
              </NavLink>
            )}
          </nav>

          {/* Botones de Acción */}
          <div className={styles.actions}>
            {/* Carrito de Compras */}
            <Link
              to={ROUTES.CART}
              className={styles.cartButton}
              aria-label={`Ver carrito de compras con ${itemCount} productos`}
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && <span className={styles.cartBadge}>{itemCount}</span>}
            </Link>

            {/* Acceso / Perfil */}
            {currentUser ? (
              <div className="desktopOnly" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isMerchant ? (
                  <Button
                    size="sm"
                    variant="primary"
                    leftIcon={<LayoutDashboard size={14} />}
                    onClick={() => navigate(ROUTES.MERCHANT_DASHBOARD)}
                  >
                    Mi Negocio
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<UserCheck size={14} />}
                    onClick={() => navigate(ROUTES.CUSTOMER_ORDERS)}
                  >
                    {currentUser.name.split(' ')[0]}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={handleLogout}>
                  Salir
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.LOGIN)}>
                  Ingresar
                </Button>
                <Button
                  size="sm"
                  variant="accent"
                  leftIcon={<Store size={14} />}
                  onClick={() => navigate(ROUTES.REGISTER_BUSINESS)}
                >
                  Vender
                </Button>
              </div>
            )}

            {/* Botón Móvil */}
            <button
              type="button"
              className={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Drawer Móvil */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer} onClick={() => setMobileMenuOpen(false)}>
            <div className={styles.mobileDrawerContent} onClick={(e) => e.stopPropagation()}>
              <Link
                to={ROUTES.HOME}
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Inicio
              </Link>
              <Link
                to={ROUTES.CATALOG}
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                🌿 Catálogo de la Selva
              </Link>
              <Link
                to={ROUTES.HELP}
                className={styles.mobileLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                ❓ Ayuda & Encuesta
              </Link>

              {isMerchant && (
                <Link
                  to={ROUTES.MERCHANT_DASHBOARD}
                  className={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📊 Mi Panel de Emprendedor
                </Link>
              )}

              {isClient && (
                <Link
                  to={ROUTES.CUSTOMER_ORDERS}
                  className={styles.mobileLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  📦 Mis Pedidos
                </Link>
              )}

              {!currentUser && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                  <Button fullWidth variant="outline" onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.LOGIN); }}>
                    Ingresar con Perfil Demo
                  </Button>
                  <Button fullWidth variant="accent" onClick={() => { setMobileMenuOpen(false); navigate(ROUTES.REGISTER_BUSINESS); }}>
                    Registrar mi Emprendimiento
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
