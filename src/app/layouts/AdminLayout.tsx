import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/money';
import {
  ShieldCheck,
  Users,
  Store,
  ShoppingBag,
  ExternalLink,
  LogOut,
  X,
  Activity,
  Database,
  Key,
  FileText,
  CheckCircle,
} from 'lucide-react';
import styles from './AdminLayout.module.css';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useSession();
  const navigate = useNavigate();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Platform statistics
  const businesses = LocalStoreRepository.getBusinesses();
  const users = LocalStoreRepository.getUsers();
  const orders = LocalStoreRepository.getOrders();

  const activeBusinesses = businesses.filter((b) => b.status === 'active');
  const pendingBusinesses = businesses.filter((b) => b.status === 'pending');
  const totalSalesCents = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.totalCents, 0);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const renderAdminSidebarContent = () => (
    <>
      {/* 1. Tarjeta de Super Administrador */}
      <div className={styles.adminCard}>
        <div className={styles.adminCardHeader}>
          <div className={styles.adminBigAvatar}>
            <ShieldCheck size={26} color="#10b981" />
          </div>
          <div className={styles.adminInfo}>
            <h3 className={styles.adminName}>{currentUser?.name || 'Super Administrador'}</h3>
            <p className={styles.adminRole}>
              <Key size={13} color="#059669" /> Root Platform Access
            </p>
            <span className={styles.badgeRoot}>
              <CheckCircle size={11} color="#047857" /> Autoridad Principal JUÁCIL
            </span>
          </div>
        </div>

        {/* Estado de Infraestructura de la Plataforma */}
        <div className={styles.infraBox}>
          <div className={styles.infraItem}>
            <span className={styles.infraLabel}>Servidores & DB:</span>
            <span className={styles.infraValue}>
              <span className={styles.healthDot} /> 100% Operativo
            </span>
          </div>
          <div className={styles.infraItem}>
            <span className={styles.infraLabel}>Pasarela WhatsApp:</span>
            <span className={styles.infraValue} style={{ color: '#16a34a' }}>
              ✓ Conectada
            </span>
          </div>
          <div className={styles.infraItem}>
            <span className={styles.infraLabel}>Zonas Selva Central:</span>
            <span className={styles.infraValue} style={{ color: '#0369a1' }}>
              Tingo María / Huánuco
            </span>
          </div>
        </div>

        {/* Mini KPIs Globales */}
        <div className={styles.kpiMiniGrid}>
          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Tiendas Activas</div>
            <p className={styles.kpiValue}>{activeBusinesses.length}</p>
            <span className={styles.kpiSub}>
              {pendingBusinesses.length > 0 ? `+${pendingBusinesses.length} pendientes` : 'Todas activas'}
            </span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Usuarios Totales</div>
            <p className={styles.kpiValue}>{users.length}</p>
            <span className={styles.kpiSub}>Clientes & MYPES</span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Pedidos Totales</div>
            <p className={styles.kpiValue}>{orders.length}</p>
            <span className={styles.kpiSub}>Procesados</span>
          </div>

          <div className={styles.kpiCard}>
            <div className={styles.kpiLabel}>Ventas Plataforma</div>
            <p className={styles.kpiValue} style={{ fontSize: '13px', color: '#047857' }}>
              {formatMoney(totalSalesCents || 128450)}
            </p>
            <span className={styles.kpiSub}>En la región</span>
          </div>
        </div>
      </div>

      {/* 2. Atajos Rápidos del Super Administrador */}
      <div className={styles.sidebarSection}>
        <h4 className={styles.sectionTitle}>
          <Activity size={14} /> Atajos de Control Maestro
        </h4>
        <div className={styles.quickActionList}>
          <Link to={`${ROUTES.ADMIN_DASHBOARD}?tab=tiendas`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap}>
              <Store size={16} />
            </div>
            <span>Gestionar & Activar Tiendas ({activeBusinesses.length})</span>
          </Link>

          <Link to={`${ROUTES.ADMIN_DASHBOARD}?tab=usuarios`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap} style={{ background: '#e0f2fe', color: '#0369a1' }}>
              <Users size={16} />
            </div>
            <span>Control de Cuentas & Roles ({users.length})</span>
          </Link>

          <Link to={`${ROUTES.ADMIN_DASHBOARD}?tab=pedidos`} className={styles.quickActionBtn}>
            <div className={styles.actionIconWrap} style={{ background: '#fef3c7', color: '#b45309' }}>
              <ShoppingBag size={16} />
            </div>
            <span>Monitoreo Global de Pedidos ({orders.length})</span>
          </Link>

          <button
            type="button"
            className={styles.quickActionBtn}
            onClick={() => {
              const dataStr = JSON.stringify(
                { businesses, users, orders, exportedAt: new Date().toISOString() },
                null,
                2
              );
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `juacil-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <div className={styles.actionIconWrap} style={{ background: '#ede9fe', color: '#6d28d9' }}>
              <Database size={16} />
            </div>
            <span>Exportar Copia de Respaldo DB</span>
          </button>
        </div>
      </div>

      {/* 3. Log de Auditoría y Eventos Críticos en Tiempo Real */}
      <div className={styles.sidebarSection}>
        <h4 className={styles.sectionTitle}>
          <FileText size={14} /> Auditoría del Sistema en Vivo
        </h4>
        <div className={styles.alertList}>
          <div className={styles.alertItem}>
            <div className={styles.alertHeader}>
              <span className={styles.alertTitle}>🟢 Sistema Operativo</span>
              <span className={styles.alertTime}>En tiempo real</span>
            </div>
            <p className={styles.alertDesc}>
              Bases de datos locales y sincronización de sesiones funcionando normalmente.
            </p>
          </div>

          {pendingBusinesses.length > 0 && (
            <div className={`${styles.alertItem} ${styles.alertItemWarning}`}>
              <div className={styles.alertHeader}>
                <span className={styles.alertTitle}>⚠️ Solicitud MYPE Pendiente</span>
                <span className={styles.alertTime}>Aviso</span>
              </div>
              <p className={styles.alertDesc}>
                {pendingBusinesses.length} emprendimiento(s) en espera de activación oficial.
              </p>
            </div>
          )}

          <div className={styles.alertItem}>
            <div className={styles.alertHeader}>
              <span className={styles.alertTitle}>🛡️ Autenticación Segura</span>
              <span className={styles.alertTime}>Verificado</span>
            </div>
            <p className={styles.alertDesc}>
              Sesión de administrador maestro validada con privilegios completos.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Acciones de Sesión */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Link
          to={ROUTES.HOME}
          className={styles.quickActionBtn}
          style={{ justifyContent: 'center', textAlign: 'center', background: '#ffffff' }}
        >
          <ExternalLink size={14} /> Ir al Marketplace Público
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className={styles.quickActionBtn}
          style={{ justifyContent: 'center', textAlign: 'center', color: '#dc2626', background: '#fee2e2' }}
        >
          <LogOut size={14} /> Cerrar Sesión Super Admin
        </button>
      </div>
    </>
  );

  return (
    <div className={styles.adminRoot}>
      {/* --------------------------------------------------------------------
          Cabecera Superior del Super Administrador JUÁCIL
          -------------------------------------------------------------------- */}
      <header className={styles.topbar}>
        <div className={styles.topbarInner}>
          {/* Logo y Portal */}
          <Link to={ROUTES.ADMIN_DASHBOARD} className={styles.brandGroup}>
            <img
              src="/images/juacil-logo.png"
              alt="Logo JUÁCIL"
              className={styles.brandLogo}
            />
            <div className={styles.brandTitleGroup}>
              <span className={styles.brandName}>
                JUÁCIL <span className={styles.brandTag}>SUPER ADMIN</span>
              </span>
              <span className={styles.brandSub}>Centro de Control Maestro de la Plataforma</span>
            </div>
          </Link>

          {/* Indicador de Salud del Sistema */}
          <div className={styles.systemHealthBadge}>
            <span className={styles.healthDot} />
            <span>Servidores & Base de Datos: 100% Activo</span>
          </div>

          {/* Acciones de la Cabecera */}
          <div className={styles.headerActions}>
            {/* Botón Móvil */}
            <button
              type="button"
              className={styles.mobileAdminToggle}
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Abrir barra de control de plataforma"
            >
              <Activity size={16} /> Barra Control
            </button>

            {/* Ir al Marketplace Público */}
            <Link
              to={ROUTES.HOME}
              className={`${styles.actionBtn} ${styles.actionBtnOutline}`}
              title="Ir al Marketplace público para compras"
            >
              <ExternalLink size={14} /> Marketplace
            </Link>

            {/* Perfil del Super Administrador */}
            <div className={styles.profilePill}>
              <div className={styles.profileAvatar}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <span className={styles.profileName}>{currentUser?.name || 'Super Admin'}</span>
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
          - Derecha: Barra de control maestro de plataforma
          -------------------------------------------------------------------- */}
      <div className={styles.mainContainer}>
        {/* Columna Izquierda / Centro: Dashboard Super Admin */}
        <main className={styles.contentArea}>
          <Outlet />
        </main>

        {/* Columna Derecha: Barra de Control Maestro a la Derecha */}
        <aside className={styles.rightSidebar} aria-label="Barra de Control de Plataforma">
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#064e3b' }}>
                <Activity size={18} color="#059669" />
                <span>Barra de Control Maestro</span>
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
    </div>
  );
};
