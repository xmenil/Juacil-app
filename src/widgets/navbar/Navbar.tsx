import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  MessageCircle,
  Truck,
  User,
  Heart,
  Store,
  Menu,
  X,
  WifiOff,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  Tag,
  Package,
} from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { ROUTES } from '@/shared/config/routes';
import { CategoryMegaOverlay } from './CategoryMegaOverlay';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { itemCount } = useCart();
  const { currentUser, isMerchant, logout } = useSession();
  const { isOnline } = useConnectivity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpenCategories = () => setCategoriesModalOpen(true);
    window.addEventListener('juacil:open-categories', handleOpenCategories);
    return () => window.removeEventListener('juacil:open-categories', handleOpenCategories);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      navigate(`${ROUTES.CATALOG}?q=${encodeURIComponent(headerSearchQuery.trim())}`);
    } else {
      navigate(ROUTES.CATALOG);
    }
    setMobileMenuOpen(false);
  };

  const handleWhatsAppContact = () => {
    const text = encodeURIComponent(
      '¡Hola JUÁCIL! Quisiera más información sobre los productos y tiendas de Tingo María y la Selva Central.'
    );
    window.open(`https://wa.me/51962881234?text=${text}`, '_blank');
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* 1. Cintillo Superior Verde */}
      <div className={styles.topAnnouncementBar}>
        <span>🚚 ✨ Envíos directos desde Tingo María y Selva Central. ¡Apoya a las MYPES locales y compra fácil! 💚</span>
      </div>

      {!isOnline && (
        <div className={styles.offlineBanner} role="status">
          <WifiOff size={16} />
          <span>
            <strong>Modo Sin Conexión Activo.</strong> Puedes consultar el catálogo y tus borradores,
            pero la confirmación de pedidos requiere red.
          </span>
        </div>
      )}

      {/* 2. Cabecera Principal con Logo, Buscador y Contacto */}
      <header className={styles.mainHeader}>
        <div className={`container ${styles.mainHeaderInner}`}>
          {/* Logo y Marca */}
          <Link to={ROUTES.HOME} className={styles.brand} aria-label="Ir a inicio de JUÁCIL">
            <img
              src="/images/juacil-logo.png"
              alt="Logo oficial JUÁCIL - Tu tienda online de la Selva Central"
              className={styles.logoImg}
            />
            <div className={styles.brandText}>
              <span className={styles.brandTitle}>JUÁCIL</span>
              <span className={styles.brandSlogan}>Tu tienda online</span>
            </div>
          </Link>

          {/* Buscador Central */}
          <div className={styles.searchContainer}>
            <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="¿Qué estás buscando hoy en Tingo María y la Selva?"
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
                aria-label="Buscar productos"
              />
              <button type="submit" className={styles.searchButton} aria-label="Ejecutar búsqueda">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Información de WhatsApp y Envíos */}
          <div className={styles.headerContactSection}>
            <div
              className={styles.contactItem}
              onClick={handleWhatsAppContact}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleWhatsAppContact()}
              title="Escríbenos a WhatsApp"
            >
              <div className={styles.contactIconCircle}>
                <MessageCircle size={18} />
              </div>
              <div className={styles.contactItemText}>
                <span className={styles.contactItemTitle}>+51 962 881 234</span>
                <span className={styles.contactItemSub}>Solo WhatsApp • Pedidos MYPE</span>
              </div>
            </div>

            <div
              className={styles.contactItem}
              onClick={() => navigate(ROUTES.CATALOG)}
              role="button"
              tabIndex={0}
              title="Información de envíos regionales"
            >
              <div className={styles.contactIconCircle}>
                <Truck size={18} />
              </div>
              <div className={styles.contactItemText}>
                <span className={styles.contactItemTitle}>Envíos</span>
                <span className={styles.contactItemSub}>Tingo María y todo el Perú</span>
              </div>
            </div>
          </div>

          {/* Iconos de Acción del Usuario */}
          <div className={styles.userActions}>
            {/* Usuario / Perfil */}
            {currentUser ? (
              <button
                type="button"
                className={styles.actionIconButton}
                onClick={() =>
                  navigate(isMerchant ? ROUTES.MERCHANT_DASHBOARD : ROUTES.CUSTOMER_ORDERS)
                }
                title={`Sesión iniciada: ${currentUser.name}`}
                aria-label="Mi perfil o panel"
              >
                <User size={22} />
              </button>
            ) : (
              <button
                type="button"
                className={styles.actionIconButton}
                onClick={() => navigate(ROUTES.LOGIN)}
                title="Ingresar a mi cuenta"
                aria-label="Ingresar"
              >
                <User size={22} />
              </button>
            )}

            {/* Favoritos */}
            <button
              type="button"
              className={styles.actionIconButton}
              onClick={() => navigate(ROUTES.CATALOG)}
              title="Mis productos favoritos"
              aria-label="Favoritos"
            >
              <Heart size={22} />
            </button>

            {/* Carrito de Compras */}
            <Link
              to={ROUTES.CART}
              className={styles.actionIconButton}
              title={`Ver carrito con ${itemCount} productos`}
              aria-label="Ver carrito"
            >
              <ShoppingBag size={22} />
              {itemCount > 0 && <span className={styles.actionBadge}>{itemCount}</span>}
            </Link>

            {/* Botón de Menú Móvil */}
            <button
              type="button"
              className={styles.mobileMenuToggle}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* 3. Sub-Barra de Categorías y Enlaces */}
        <div className={styles.subNavBar}>
          <div className={`container ${styles.subNavInner}`}>
            <nav className={styles.categoryLinksList} aria-label="Categorías principales">
              <NavLink
                to={ROUTES.HOME}
                className={({ isActive }) =>
                  [styles.categoryLink, isActive ? styles.categoryLinkActive : ''].join(' ')
                }
                end
              >
                Inicio
              </NavLink>

              {/* Botón desplegable que abre el panel completo de categorías con fondo oscuro */}
              <button
                type="button"
                className={styles.categoriesDropdownButton}
                onClick={() => setCategoriesModalOpen(true)}
                aria-label="Abrir catálogo completo de categorías"
              >
                <LayoutGrid size={15} /> Categorías <ChevronDown size={14} />
              </button>

              <NavLink
                to={`${ROUTES.CATALOG}?ofertas=true`}
                className={styles.categoryLink}
              >
                <Tag size={14} /> Ofertas
              </NavLink>

              <NavLink
                to={ROUTES.CATALOG}
                className={({ isActive }) =>
                  [styles.categoryLink, isActive ? styles.categoryLinkActive : ''].join(' ')
                }
                end
              >
                <Package size={14} /> Productos
              </NavLink>

              <NavLink
                to={`${ROUTES.CATALOG}?filtro=tiendas`}
                className={styles.categoryLink}
              >
                <Store size={14} /> Tiendas & MYPES
              </NavLink>

              <NavLink
                to={`${ROUTES.CATALOG}?ubicacion=Tingo%20Mar%C3%ADa`}
                className={styles.promotionsBadge}
              >
                <Sparkles size={13} /> TINGO MARÍA
              </NavLink>
            </nav>

            <div className={styles.subNavRightLinks}>
              {currentUser ? (
                <>
                  {isMerchant ? (
                    <Link to={ROUTES.MERCHANT_DASHBOARD} className={styles.venderButtonHighlight}>
                      <Store size={14} /> Mi Negocio MYPE
                    </Link>
                  ) : (
                    <Link to={ROUTES.CUSTOMER_ORDERS} className={styles.subNavLinkRight}>
                      Mis Pedidos
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#6b7280', fontWeight: 600 }}
                  >
                    Salir
                  </button>
                </>
              ) : (
                <Link to={ROUTES.REGISTER_BUSINESS} className={styles.venderButtonHighlight}>
                  <Store size={14} /> Vender en JUÁCIL
                </Link>
              )}

              <Link to={ROUTES.HELP} className={styles.subNavLinkRight}>
                Ayuda & Validación
              </Link>
            </div>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className={styles.mobileMenu}>
            <form className={styles.mobileSearchRow} onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Buscar abarrotes, café, arroz, papel..."
                value={headerSearchQuery}
                onChange={(e) => setHeaderSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>
                <Search size={18} />
              </button>
            </form>

            <div className={styles.mobileNavLinks}>
              <Link to={ROUTES.HOME} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                Inicio
              </Link>
              <button
                type="button"
                className={styles.mobileNavLink}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCategoriesModalOpen(true);
                }}
                style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-800)', fontWeight: 700 }}
              >
                <LayoutGrid size={18} /> Explorar Todas las Categorías ▾
              </button>
              <Link to={`${ROUTES.CATALOG}?ofertas=true`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                <Tag size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Ofertas Especiales
              </Link>
              <Link to={ROUTES.CATALOG} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Todos los Productos
              </Link>
              <Link to={`${ROUTES.CATALOG}?filtro=tiendas`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                <Store size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Tiendas & Bodegas
              </Link>
              <Link to={`${ROUTES.CATALOG}?ubicacion=Tingo%20Mar%C3%ADa`} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                <Sparkles size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Zonas de Tingo María
              </Link>
              <Link to={ROUTES.HELP} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                Ayuda & Validación
              </Link>
              {!currentUser && (
                <Link to={ROUTES.REGISTER_BUSINESS} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}>
                  Registrar mi Negocio (Vender)
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Modal Desplegable de Categorías con Fondo Oscuro Transparente */}
      <CategoryMegaOverlay
        isOpen={categoriesModalOpen}
        onClose={() => setCategoriesModalOpen(false)}
      />
    </>
  );
};
