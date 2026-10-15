import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
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
  ChevronRight,
  Sparkles,
  Tag,
  Package,
  MapPin,
  ShieldCheck,
  LogOut,
  Settings,
  ExternalLink,
  UserPlus,
  LogIn,
} from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { ROUTES } from '@/shared/config/routes';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { CategoryMegaOverlay } from './CategoryMegaOverlay';
import styles from './Navbar.module.css';

export const Navbar: React.FC = () => {
  const { itemCount, lastAdded } = useCart();
  const [cartAnimate, setCartAnimate] = useState(false);
  const { currentUser, logout, loginAs } = useSession();
  const { isOnline } = useConnectivity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);
  const [locationsDropdownOpen, setLocationsDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locationsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (lastAdded) {
      setCartAnimate(true);
      const timer = window.setTimeout(() => setCartAnimate(false), 900);
      return () => window.clearTimeout(timer);
    }
  }, [lastAdded]);

  const searchParams = new URLSearchParams(location.search);
  const isInicioActive = location.pathname === ROUTES.HOME;
  const isOfertasActive = location.pathname === ROUTES.CATALOG && searchParams.get('ofertas') === 'true';
  const isTiendasActive = (location.pathname === ROUTES.CATALOG && searchParams.get('filtro') === 'tiendas') || location.pathname.startsWith('/tiendas');
  const isProductosActive = location.pathname === ROUTES.CATALOG && !isOfertasActive && !isTiendasActive;
  const isCategoriasActive = Boolean(searchParams.get('categoria'));
  const isLugaresActive = Boolean(searchParams.get('ubicacion'));
  const isAyudaActive = location.pathname === ROUTES.HELP;

  const handleCategoriesMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setCategoriesDropdownOpen(true);
  };

  const handleCategoriesMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setCategoriesDropdownOpen(false);
    }, 120);
  };

  const handleLocationsMouseEnter = () => {
    if (locationsTimeoutRef.current) {
      clearTimeout(locationsTimeoutRef.current);
      locationsTimeoutRef.current = null;
    }
    setLocationsDropdownOpen(true);
  };

  const handleLocationsMouseLeave = () => {
    locationsTimeoutRef.current = setTimeout(() => {
      setLocationsDropdownOpen(false);
    }, 120);
  };

  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
      if (locationsTimeoutRef.current) clearTimeout(locationsTimeoutRef.current);
    };
  }, []);

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
                <span className={styles.contactItemTitle}>Pedidos WhatsApp</span>
                <span className={styles.contactItemSub}>Atención directa MYPE</span>
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
            {/* Menú Desplegable de Usuario / Perfil (Engloba todo: Perfil, Pedidos, Tienda, Admin y Cerrar Sesión) */}
            <div className={styles.profileDropdownContainer} ref={profileDropdownRef}>
              <button
                type="button"
                className={`${styles.actionIconButton} ${profileDropdownOpen ? styles.actionIconButtonActive : ''}`}
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                aria-expanded={profileDropdownOpen}
                title={currentUser ? `Mi Cuenta: ${currentUser.name}` : 'Ingresar a mi cuenta'}
                aria-label="Menú de perfil y cuenta"
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className={styles.userAvatarImg} />
                ) : (
                  <User size={22} />
                )}
              </button>

              {profileDropdownOpen && (
                <div className={styles.profileDropdownMenu} role="menu">
                  {currentUser ? (
                    <>
                      {/* Cabecera del Usuario con su Nombre, Correo y Rol */}
                      <div className={styles.profileMenuHeader}>
                        <div className={styles.profileUserInfo}>
                          <div className={styles.profileBigAvatar}>
                            {currentUser.avatarUrl ? (
                              <img src={currentUser.avatarUrl} alt={currentUser.name} />
                            ) : (
                              currentUser.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className={styles.profileUserDetails}>
                            <h4 className={styles.profileUserName}>{currentUser.name}</h4>
                            <p className={styles.profileUserEmail}>{currentUser.email}</p>
                            {currentUser.role === 'cliente' && (
                              <span className={`${styles.profileRoleBadge} ${styles.profileRoleBadgeClient}`}>
                                🛒 Cliente Comprador
                              </span>
                            )}
                            {currentUser.role === 'merchant' && (
                              <span className={`${styles.profileRoleBadge} ${styles.profileRoleBadgeMerchant}`}>
                                🏪 Tienda MYPE
                              </span>
                            )}
                            {currentUser.role === 'admin' && (
                              <span className={`${styles.profileRoleBadge} ${styles.profileRoleBadgeAdmin}`}>
                                🛡️ Super Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lista de Enlaces según el Rol (Totalmente Independientes) */}
                      <div className={styles.profileMenuList}>
                        {currentUser.role === 'cliente' && (
                          <>
                            <Link
                              to={ROUTES.CUSTOMER_PROFILE}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><User size={16} /></span>
                              <span>Mi Perfil & Datos</span>
                            </Link>
                            <Link
                              to={ROUTES.CUSTOMER_ORDERS}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Package size={16} /></span>
                              <span>Mis Pedidos & Compras</span>
                            </Link>
                            <Link
                              to={ROUTES.CATALOG}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Heart size={16} /></span>
                              <span>Mis Favoritos</span>
                            </Link>
                            <Link
                              to={ROUTES.REGISTER_BUSINESS}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Store size={16} /></span>
                              <span>¿Tienes un negocio? Vender en JUÁCIL</span>
                            </Link>
                          </>
                        )}

                        {currentUser.role === 'merchant' && (
                          <>
                            <Link
                              to={ROUTES.MERCHANT_DASHBOARD}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Store size={16} /></span>
                              <span>Panel Seller Center (Resumen)</span>
                            </Link>
                            <Link
                              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Package size={16} /></span>
                              <span>Gestión de Productos & Fotos</span>
                            </Link>
                            <Link
                              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Package size={16} /></span>
                              <span>Bandeja de Pedidos de Clientes</span>
                            </Link>
                            <Link
                              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=perfil`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Settings size={16} /></span>
                              <span>Datos & Horarios de Tienda</span>
                            </Link>
                            {currentUser.businessId && (
                              <Link
                                to={ROUTES.STORE_DETAIL(currentUser.businessId)}
                                target="_blank"
                                className={styles.profileMenuItem}
                                onClick={() => setProfileDropdownOpen(false)}
                              >
                                <span className={styles.profileMenuItemIcon}><ExternalLink size={16} /></span>
                                <span>Ver Mi Tienda Pública</span>
                              </Link>
                            )}
                            <Link
                              to={ROUTES.HOME}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><ShoppingCart size={16} /></span>
                              <span>Ir al Marketplace de Compras</span>
                            </Link>
                          </>
                        )}

                        {currentUser.role === 'admin' && (
                          <>
                            <Link
                              to={ROUTES.ADMIN_DASHBOARD}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><ShieldCheck size={16} /></span>
                              <span>Panel Super Admin (General)</span>
                            </Link>
                            <Link
                              to={`${ROUTES.ADMIN_DASHBOARD}?tab=usuarios`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><User size={16} /></span>
                              <span>Gestión de Todos los Usuarios</span>
                            </Link>
                            <Link
                              to={`${ROUTES.ADMIN_DASHBOARD}?tab=tiendas`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Store size={16} /></span>
                              <span>Gestión de Tiendas & MYPES</span>
                            </Link>
                            <Link
                              to={`${ROUTES.ADMIN_DASHBOARD}?tab=pedidos`}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><Package size={16} /></span>
                              <span>Pedidos & Métricas Globales</span>
                            </Link>
                            <Link
                              to={ROUTES.HOME}
                              className={styles.profileMenuItem}
                              onClick={() => setProfileDropdownOpen(false)}
                            >
                              <span className={styles.profileMenuItemIcon}><ShoppingCart size={16} /></span>
                              <span>Ir al Marketplace de Compras</span>
                            </Link>
                          </>
                        )}

                        <div className={styles.profileMenuDivider} />

                        {/* Cambio directo de perfil entre los 3 perfiles */}
                        <div className={styles.profileSwitchSection}>
                          <span className={styles.profileSwitchLabel}>Cambiar perfil demo:</span>
                          <div className={styles.profileSwitchButtons}>
                            {currentUser.role !== 'admin' && (
                              <button
                                type="button"
                                className={styles.profileSwitchButton}
                                onClick={() => {
                                  setProfileDropdownOpen(false);
                                  try {
                                    sessionStorage.setItem('juacil_switching_to', ROUTES.ADMIN_DASHBOARD);
                                  } catch {}
                                  loginAs('user-admin-01');
                                  navigate(ROUTES.ADMIN_DASHBOARD);
                                }}
                              >
                                <ShieldCheck size={14} /> Administrador
                              </button>
                            )}
                            {currentUser.role !== 'merchant' && (
                              <button
                                type="button"
                                className={styles.profileSwitchButton}
                                onClick={() => {
                                  setProfileDropdownOpen(false);
                                  try {
                                    sessionStorage.setItem('juacil_switching_to', ROUTES.MERCHANT_DASHBOARD);
                                  } catch {}
                                  loginAs('user-merchant-01');
                                  navigate(ROUTES.MERCHANT_DASHBOARD);
                                }}
                              >
                                <Store size={14} /> Emprendedor
                              </button>
                            )}
                            {currentUser.role !== 'cliente' && (
                              <button
                                type="button"
                                className={styles.profileSwitchButton}
                                onClick={() => {
                                  setProfileDropdownOpen(false);
                                  try {
                                    sessionStorage.setItem('juacil_switching_to', ROUTES.HOME);
                                  } catch {}
                                  loginAs('user-client-01');
                                  navigate(ROUTES.HOME);
                                }}
                              >
                                <User size={14} /> Cliente
                              </button>
                            )}
                          </div>
                        </div>

                        <div className={styles.profileMenuDivider} />

                        <button
                          type="button"
                          className={styles.profileLogoutButton}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className={styles.profileGuestBox}>
                      <h4 className={styles.profileGuestTitle}>¡Bienvenido a JUÁCIL!</h4>
                      <p className={styles.profileGuestSubtitle}>
                        Inicia sesión para realizar tus pedidos, ver tu historial o administrar tu negocio MYPE.
                      </p>
                      <div className={styles.profileGuestButtons}>
                        <button
                          type="button"
                          className={styles.profileMenuItem}
                          style={{ justifyContent: 'center', backgroundColor: '#135d38', color: '#ffffff', fontWeight: 700 }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate(ROUTES.LOGIN);
                          }}
                        >
                          <LogIn size={15} style={{ marginRight: '6px' }} /> Iniciar Sesión
                        </button>
                        <button
                          type="button"
                          className={styles.profileMenuItem}
                          style={{ justifyContent: 'center', border: '1px solid #cbd5e1' }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate(ROUTES.REGISTER_CUSTOMER);
                          }}
                        >
                          <UserPlus size={15} style={{ marginRight: '6px' }} /> Crear Cuenta (Cliente)
                        </button>
                        <button
                          type="button"
                          className={styles.profileMenuItem}
                          style={{ justifyContent: 'center', color: '#166534', backgroundColor: '#f0fdf4' }}
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            navigate(ROUTES.REGISTER_BUSINESS);
                          }}
                        >
                          <Store size={15} style={{ marginRight: '6px' }} /> Vender en JUÁCIL (Tienda)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

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

            {/* Carrito de Compras - Lleva directo al Carrito */}
            <Link
              to={ROUTES.CART}
              className={`${styles.actionIconButton} ${cartAnimate ? styles.actionIconButtonBump : ''}`}
              title={`Ver carrito (${itemCount} productos)`}
              aria-label="Ver carrito de compras"
            >
              <ShoppingCart size={22} className={cartAnimate ? styles.cartIconBump : ''} />
              {itemCount > 0 && <span className={`${styles.actionBadge} ${cartAnimate ? styles.actionBadgePop : ''}`}>{itemCount}</span>}
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
              <Link
                to={ROUTES.HOME}
                className={`${styles.categoryLink} ${isInicioActive ? styles.categoryLinkActive : ''}`}
              >
                Inicio
              </Link>

              {/* Menú Desplegable de Categorías estilo Mercado Libre (hover dropdown vertical) */}
              <div
                className={styles.categoriesDropdownContainer}
                onMouseEnter={handleCategoriesMouseEnter}
                onMouseLeave={handleCategoriesMouseLeave}
              >
                <button
                  type="button"
                  className={`${styles.categoriesNavButton} ${categoriesDropdownOpen ? styles.categoriesNavButtonActive : ''} ${isCategoriasActive ? styles.categoriesNavButtonHighlighted : ''}`}
                  onClick={() => setCategoriesDropdownOpen((prev) => !prev)}
                  aria-expanded={categoriesDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Categorías"
                >
                  Categorías <ChevronDown size={14} className={`${styles.chevronIcon} ${categoriesDropdownOpen ? styles.chevronIconRotated : ''}`} />
                </button>

                {categoriesDropdownOpen && (
                  <div className={styles.mercadoLibreMenu} role="menu">
                    <div className={styles.mercadoLibreArrow} />
                    <div className={styles.mercadoLibreList}>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          className={styles.mercadoLibreItem}
                          onClick={() => {
                            navigate(`${ROUTES.CATALOG}?categoria=${cat.id}`);
                            setCategoriesDropdownOpen(false);
                          }}
                          role="menuitem"
                        >
                          <span className={styles.mercadoLibreItemName}>{cat.name}</span>
                          <ChevronRight size={14} className={styles.mercadoLibreItemArrow} />
                        </button>
                      ))}
                    </div>
                    <div className={styles.mercadoLibreFooter}>
                      <button
                        type="button"
                        className={styles.mercadoLibreFooterBtn}
                        onClick={() => {
                          navigate(ROUTES.CATALOG);
                          setCategoriesDropdownOpen(false);
                        }}
                      >
                        Ver todo el catálogo JUÁCIL ›
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link
                to={`${ROUTES.CATALOG}?ofertas=true`}
                className={`${styles.categoryLink} ${isOfertasActive ? styles.categoryLinkActive : ''}`}
              >
                <Tag size={14} /> Ofertas
              </Link>

              <Link
                to={ROUTES.CATALOG}
                className={`${styles.categoryLink} ${isProductosActive ? styles.categoryLinkActive : ''}`}
              >
                <Package size={14} /> Productos
              </Link>

              <Link
                to={`${ROUTES.CATALOG}?filtro=tiendas`}
                className={`${styles.categoryLink} ${isTiendasActive ? styles.categoryLinkActive : ''}`}
              >
                <Store size={14} /> Tiendas & MYPES
              </Link>

              {/* Menú Desplegable de Lugares / Zonas estilo Mercado Libre (hover dropdown vertical de fondo negro) */}
              <div
                className={styles.categoriesDropdownContainer}
                onMouseEnter={handleLocationsMouseEnter}
                onMouseLeave={handleLocationsMouseLeave}
              >
                <button
                  type="button"
                  className={`${styles.categoriesNavButton} ${locationsDropdownOpen ? styles.categoriesNavButtonActive : ''} ${isLugaresActive ? styles.categoriesNavButtonHighlighted : ''}`}
                  onClick={() => setLocationsDropdownOpen((prev) => !prev)}
                  aria-expanded={locationsDropdownOpen}
                  aria-haspopup="true"
                  aria-label="Lugares y Zonas"
                >
                  <MapPin size={14} style={{ color: isLugaresActive ? '#065f46' : '#16a34a' }} /> Lugares <ChevronDown size={14} className={`${styles.chevronIcon} ${locationsDropdownOpen ? styles.chevronIconRotated : ''}`} />
                </button>

                {locationsDropdownOpen && (
                  <div className={styles.mercadoLibreMenu} role="menu" style={{ width: '280px' }}>
                    <div className={styles.mercadoLibreArrow} />
                    <div className={styles.mercadoLibreList}>
                      {LOCATIONS.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          className={styles.mercadoLibreItem}
                          onClick={() => {
                            navigate(`${ROUTES.CATALOG}?ubicacion=${encodeURIComponent(loc)}`);
                            setLocationsDropdownOpen(false);
                          }}
                          role="menuitem"
                        >
                          <span className={styles.mercadoLibreItemName}>
                            <MapPin size={15} className={styles.locationPinIcon} aria-hidden="true" />
                            <span>{loc}</span>
                          </span>
                          <ChevronRight size={14} className={styles.mercadoLibreItemArrow} />
                        </button>
                      ))}
                    </div>
                    <div className={styles.mercadoLibreFooter}>
                      <button
                        type="button"
                        className={styles.mercadoLibreFooterBtn}
                        onClick={() => {
                          navigate(`${ROUTES.CATALOG}?ubicacion=Tingo%20Mar%C3%ADa`);
                          setLocationsDropdownOpen(false);
                        }}
                      >
                        Ver todas las zonas de Tingo María ›
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>

            <div className={styles.subNavRightLinks}>
              {currentUser ? (
                <>
                  {currentUser.role === 'admin' && (
                    <Link to={ROUTES.ADMIN_DASHBOARD} className={styles.venderButtonHighlight}>
                      <ShieldCheck size={14} /> Panel Super Admin
                    </Link>
                  )}
                  {currentUser.role === 'merchant' && (
                    <Link to={ROUTES.MERCHANT_DASHBOARD} className={styles.venderButtonHighlight}>
                      <Store size={14} /> Panel Seller Center
                    </Link>
                  )}
                  {currentUser.role === 'cliente' && (
                    <Link to={ROUTES.REGISTER_BUSINESS} className={styles.venderButtonHighlight}>
                      <Store size={14} /> Vender en JUÁCIL
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to={ROUTES.LOGIN} className={styles.subNavLinkRight}>
                    Ingresar
                  </Link>
                  <Link to={ROUTES.REGISTER_BUSINESS} className={styles.venderButtonHighlight}>
                    <Store size={14} /> Vender en JUÁCIL
                  </Link>
                </>
              )}

              <Link to={ROUTES.HELP} className={`${styles.subNavLinkRight} ${isAyudaActive ? styles.subNavLinkRightActive : ''}`}>
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
              <Link to={ROUTES.CART} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Mi Carrito ({itemCount})
              </Link>

              {currentUser && (
                <>
                  {currentUser.role === 'admin' && (
                    <Link to={ROUTES.ADMIN_DASHBOARD} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: '#0b4526', fontWeight: 700 }}>
                      <ShieldCheck size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Panel Super Admin
                    </Link>
                  )}
                  {currentUser.role === 'merchant' && (
                    <Link to={ROUTES.MERCHANT_DASHBOARD} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: '#166534', fontWeight: 700 }}>
                      <Store size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Mi Negocio MYPE
                    </Link>
                  )}
                  <Link to={ROUTES.CUSTOMER_PROFILE} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: '#0b4526', fontWeight: 700 }}>
                    <User size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Mi Perfil ({currentUser.name})
                  </Link>
                  <Link to={ROUTES.CUSTOMER_ORDERS} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                    <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Mis Pedidos
                  </Link>
                </>
              )}

              <button
                type="button"
                className={styles.mobileNavLink}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setCategoriesModalOpen(true);
                }}
                style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-800)', fontWeight: 700 }}
              >
                <ChevronRight size={18} /> Explorar Todas las Categorías ▾
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
              {!currentUser ? (
                <>
                  <Link to={ROUTES.LOGIN} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}>
                    Iniciar Sesión
                  </Link>
                  <Link to={ROUTES.REGISTER_BUSINESS} className={styles.mobileNavLink} onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--color-primary-700)', fontWeight: 700 }}>
                    Registrar mi Negocio (Vender)
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.mobileNavLink}
                  onClick={handleLogout}
                  style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 600 }}
                >
                  Cerrar Sesión
                </button>
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
