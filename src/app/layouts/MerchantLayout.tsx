import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/money';
import { CartDrawer } from '@/features/cart/CartDrawer';
import {
  Store,
  ExternalLink,
  Plus,
  ShoppingBag,
  Bell,
  MessageCircle,
  Sparkles,
  LogOut,
  X,
  Package,
  Settings,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import styles from './MerchantLayout.module.css';

export const MerchantLayout: React.FC = () => {
  const { currentUser, businessId, logout } = useSession();
  const navigate = useNavigate();

  // Mobile drawer state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Store active state (Abierto / Pausado)
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);

  // Default business fallback if not yet chosen
  const activeBusinessId = businessId || 'biz-cafe-aroma';
  const business = LocalStoreRepository.getBusinessById(activeBusinessId);

  const products = business ? LocalStoreRepository.getProductsByBusiness(business.id) : [];
  const orders = business ? LocalStoreRepository.getOrdersByBusiness(business.id) : [];

  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 4);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalSalesCents = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.totalCents, 0);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const handleToggleStoreStatus = () => {
    setIsOpenForOrders(!isOpenForOrders);
  };

  const renderAdminSidebarContent = () => (
    <>
      {/* 1. Tarjeta del Administrador de la Tienda */}
      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader}>
          <div className={styles.adminBigAvatar}>
            {currentUser?.name?.charAt(0).toUpperCase() || 'V'}
          </div>
          <div className={styles.adminInfo}>
            <h3 className={styles.adminName}>{currentUser?.name || 'Administrador de Tienda'}</h3>
            <p className={styles.adminRole}>
              <ShieldCheck size={13} color="#15803d" /> Admin de Tienda
            </p>
            <span className={styles.badgeVerified}>
              <Sparkles size={11} color="#15803d" /> MYPE Verificada • Selva Central
            </span>
          </div>
        </div>

        {/* Interruptor de Recepción de Pedidos */}
        <div className={styles.statusToggleBox}>
          <div className={styles.statusToggleLabel}>
            <span>Recepción de Pedidos</span>
            <span className={styles.statusToggleSub}>
              {isOpenForOrders ? 'Visible para clientes' : 'Pausado temporalmente'}
            </span>
          </div>
          <button
            type="button"
            className={isOpenForOrders ? styles.toggleBtnActive : styles.toggleBtnPaused}
            onClick={handleToggleStoreStatus}
            title="Alternar estado de pedidos"
          >
            {isOpenForOrders ? (
              <>
                <span className={styles.statusDot} /> Abierto
              </>
            ) : (
              'Pausado'
            )}
          </button>
        </div>

        {/* Resumen Rápido / Mini KPIs Interactivos */}
        <div className={styles.kpiMiniGrid}>
          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos`} className={styles.kpiCard} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.kpiLabel}>Ventas acumuladas</div>
            <p className={styles.kpiValue}>{formatMoney(totalSalesCents || 48500)}</p>
            <span className={styles.kpiSub}>Ver pedidos ›</span>
          </Link>

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos&filtro=pendiente`} className={styles.kpiCard} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.kpiLabel}>Pedidos por atender</div>
            <p className={styles.kpiValue} style={{ color: pendingOrders.length > 0 ? '#ea580c' : '#0b4526' }}>
              {pendingOrders.length}
            </p>
            <span className={styles.kpiSub}>
              {pendingOrders.length > 0 ? '⚠️ Atender ahora ›' : 'Al día'}
            </span>
          </Link>

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos`} className={styles.kpiCard} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.kpiLabel}>Productos activos</div>
            <p className={styles.kpiValue}>{products.length}</p>
            <span className={styles.kpiSub}>Ver catálogo ›</span>
          </Link>

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos&filtro=outOfStock`} className={styles.kpiCard} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.kpiLabel}>Stock crítico</div>
            <p className={styles.kpiValue} style={{ color: (lowStockProducts.length + outOfStockProducts.length) > 0 ? '#dc2626' : '#15803d' }}>
              {lowStockProducts.length + outOfStockProducts.length}
            </p>
            <span className={styles.kpiSub}>
              {lowStockProducts.length + outOfStockProducts.length > 0 ? 'Reponer stock ›' : 'Óptimo'}
            </span>
          </Link>
        </div>
      </div>

      {/* 2. Accesos Rápidos de Administración de Tienda */}
      <div className={styles.sidebarSection}>
        <h4 className={styles.sectionTitle}>
          <Settings size={14} /> Atajos de Administrador
        </h4>
        <div className={styles.quickActionList}>
          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos&crear=true`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap}>
              <Plus size={16} />
            </div>
            <span>+ Publicar Nuevo Producto</span>
          </Link>

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap} style={{ background: '#fef3c7', color: '#b45309' }}>
              <ShoppingBag size={16} />
            </div>
            <span>Bandeja de Pedidos ({pendingOrders.length})</span>
          </Link>

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap} style={{ background: '#fee2e2', color: '#dc2626' }}>
              <Package size={16} />
            </div>
            <span>Control de Stock & Catálogo</span>
          </Link>

          {business && (
            <a
              href={`https://wa.me/51${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickActionBtn}
            >
              <div className={styles.actionIconWrap} style={{ background: '#dcfce7', color: '#16a34a' }}>
                <MessageCircle size={16} />
              </div>
              <span>WhatsApp de mi Tienda</span>
            </a>
          )}

          <Link to={`${ROUTES.MERCHANT_DASHBOARD}?tab=perfil`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap} style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <Store size={16} />
            </div>
            <span>Datos & Horarios de Tienda</span>
          </Link>
        </div>
      </div>

      {/* 3. Alertas & Notificaciones de la Tienda en Vivo */}
      <div className={styles.sidebarSection}>
        <h4 className={styles.sectionTitle}>
          <Bell size={14} /> Alertas de Tienda en Vivo
        </h4>
        <div className={styles.alertList}>
          {pendingOrders.length > 0 ? (
            <Link
              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos&filtro=pendiente`}
              className={`${styles.alertItem} ${styles.alertItemUrgent}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className={styles.alertHeader}>
                <span className={styles.alertTitle}>🔔 {pendingOrders.length} Pedido(s) Nuevo(s)</span>
                <span className={styles.alertTime}>Ahora</span>
              </div>
              <p className={styles.alertDesc}>
                Cliente esperando confirmación de stock para entrega por WhatsApp. (Clic para atender)
              </p>
            </Link>
          ) : (
            <Link
              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos`}
              className={styles.alertItem}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className={styles.alertHeader}>
                <span className={styles.alertTitle}>✅ Pedidos al día</span>
                <span className={styles.alertTime}>Hoy</span>
              </div>
              <p className={styles.alertDesc}>
                Todos los pedidos recibidos han sido atendidos o despachados.
              </p>
            </Link>
          )}

          {lowStockProducts.length > 0 && (
            <Link
              to={`${ROUTES.MERCHANT_DASHBOARD}?tab=productos&filtro=outOfStock`}
              className={`${styles.alertItem} ${styles.alertItemUrgent}`}
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className={styles.alertHeader}>
                <span className={styles.alertTitle}>⚠️ Stock Crítico</span>
                <span className={styles.alertTime}>Aviso</span>
              </div>
              <p className={styles.alertDesc}>
                {lowStockProducts[0]?.name} tiene {lowStockProducts[0]?.stock} unidad(es) restante(s). (Clic para editar)
              </p>
            </Link>
          )}

          <Link
            to={`${ROUTES.MERCHANT_DASHBOARD}?tab=reportes`}
            className={styles.alertItem}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <div className={styles.alertHeader}>
              <span className={styles.alertTitle}>⭐ Calificación Excelente</span>
              <span className={styles.alertTime}>4.9/5</span>
            </div>
            <p className={styles.alertDesc}>
              Tu tienda mantiene 99% de satisfacción en Tingo María y la Selva.
            </p>
          </Link>
        </div>
      </div>

      {/* 4. Consejo MYPE de Crecimiento */}
      <div className={styles.mypeTipBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '4px' }}>
          <Sparkles size={14} color="#15803d" />
          <span>Tip MYPE JUÁCIL</span>
        </div>
        <p style={{ margin: 0 }}>
          Publica fotografías claras con buena iluminación de tus productos locales. Los clientes compran hasta 3x más rápido cuando el stock está actualizado.
        </p>
      </div>

      {/* 5. Acciones de Sesión */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link
          to={ROUTES.HOME}
          className={styles.quickActionBtn}
          style={{ justifyContent: 'center', textAlign: 'center', background: '#ffffff' }}
        >
          <ExternalLink size={14} /> Ir a Comprar (Marketplace)
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.quickActionBtn}
          style={{ justifyContent: 'center', textAlign: 'center', color: '#dc2626', background: '#fee2e2' }}
        >
          <LogOut size={14} /> Cerrar Sesión de Tienda
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.merchantRoot}>
      {/* --------------------------------------------------------------------
          Cabecera Superior del Centro de Vendedor MYPE JUÁCIL
          -------------------------------------------------------------------- */}
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          {/* Logo y Portal */}
          <Link to={ROUTES.MERCHANT_DASHBOARD} className={styles.brandGroup}>
            <img
              src="/images/juacil-logo.png"
              alt="Logo JUÁCIL"
              className={styles.brandLogo}
            />
            <div className={styles.brandTitleGroup}>
              <span className={styles.brandName}>
                JUÁCIL <span className={styles.brandTag}>SELLER CENTER</span>
              </span>
              <span className={styles.brandSub}>Panel de Gestión para MYPES de la Selva Central</span>
            </div>
          </Link>

          {/* Indicador de la Tienda Activa */}
          {business && (
            <div className={styles.storeIndicator}>
              <div className={styles.storeIconBadge}>
                <Store size={14} />
              </div>
              <div className={styles.storeInfoText}>
                <span className={styles.storeName}>{business.name}</span>
                <span className={styles.storeStatusPill}>
                  <span className={styles.statusDot} />
                  {business.location} • {isOpenForOrders ? 'En Línea' : 'Pausado'}
                </span>
              </div>
            </div>
          )}

          {/* Acciones de la Cabecera */}
          <div className={styles.headerActions}>
            {/* Botón Móvil para abrir la barra lateral de administrador */}
            <button
              type="button"
              className={styles.mobileAdminToggle}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Abrir barra de administrador de tienda"
            >
              <ShieldCheck size={16} /> Barra Admin
            </button>

            {/* Ver mi Tienda Pública */}
            {business && (
              <Link
                to={ROUTES.STORE_DETAIL(business.id)}
                target="_blank"
                className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
                title="Ver cómo ven los clientes mi tienda pública"
              >
                <Eye size={14} /> Ver Tienda Pública
              </Link>
            )}

            {/* Ir al Marketplace Público */}
            <Link
              to={ROUTES.HOME}
              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              title="Volver a la tienda de compras"
            >
              <ExternalLink size={14} /> Marketplace
            </Link>

            {/* Perfil del Usuario Administrador */}
            <div className={styles.profilePill}>
              <div className={styles.profileAvatar}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span className={styles.profileName}>{currentUser?.name || 'Administrador'}</span>
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={handleLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------
          Estructura de 2 Columnas:
          - Izquierda / Centro: Área de trabajo y pestañas (<Outlet />)
          - Derecha: Barra de administradores de tienda dedicada
          -------------------------------------------------------------------- */}
      <div className={styles.mainContainer}>
        {/* Columna Izquierda / Centro: Contenido de la Tienda */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>

        {/* Columna Derecha: Barra de Administradores de Tienda a la Derecha */}
        <aside className={styles.rightSidebar} aria-label="Barra de Administradores de Tienda">
          {renderAdminSidebarContent()}
        </aside>
      </div>

      {/* Drawer Móvil para pantallas táctiles y teléfonos */}
      {mobileDrawerOpen && (
        <>
          <div
            className={styles.mobileDrawerBackdrop}
            onClick={() => setMobileDrawerOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Cerrar barra"
          />
          <div className={styles.mobileDrawerContent}>
            <div className={styles.drawerCloseHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0b4526' }}>
                <ShieldCheck size={18} color="#15803d" />
                <span>Barra de Administrador de Tienda</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                aria-label="Cerrar"
              >
                <X size={20} color="#64748b" />
              </button>
            </div>
            {renderAdminSidebarContent()}
          </div>
        </>
      )}

      {/* Bandeja de carrito disponible por si realiza acciones de compra */}
      <CartDrawer />
    </div>
  );
};
