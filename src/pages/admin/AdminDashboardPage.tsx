import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Business, BusinessStatus } from '@/entities/business/model/types';
import { User, UserRole } from '@/entities/user/model/types';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { LOCATIONS, CATEGORIES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import {
  ShieldAlert,
  Users,
  Store,
  ShoppingBag,
  TrendingUp,
  Plus,
  CheckCircle,
  XCircle,
  PauseCircle,
  Trash2,
  Lock,
  Search,
} from 'lucide-react';
import styles from './AdminDashboardPage.module.css';

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin, loginAs } = useSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tabs sincronizadas con la URL
  const [activeTab, setActiveTab] = useState<'tiendas' | 'usuarios' | 'pedidos'>('tiendas');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'usuarios' || tabParam === 'tiendas' || tabParam === 'pedidos') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (nextTab: 'tiendas' | 'usuarios' | 'pedidos') => {
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  // Filtros y búsquedas
  const [storeSearch, setStoreSearch] = useState('');
  const [storeStatusFilter, setStoreStatusFilter] = useState<string>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');

  // Modales
  const [createStoreModalOpen, setCreateStoreModalOpen] = useState(false);
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [deleteStoreCandidate, setDeleteStoreCandidate] = useState<Business | null>(null);
  const [deleteUserCandidate, setDeleteUserCandidate] = useState<User | null>(null);

  // Estados locales para formularios
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState<string>(CATEGORIES[0]?.id || 'abarrotes');
  const [newStoreLocation, setNewStoreLocation] = useState<string>(LOCATIONS[0] || 'Tingo María');
  const [newStoreWhatsapp, setNewStoreWhatsapp] = useState('');
  const [newStoreRuc, setNewStoreRuc] = useState('');
  const [newStoreDesc, setNewStoreDesc] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('cliente');
  const [newUserAddress, setNewUserAddress] = useState('');
  const [newUserZone, setNewUserZone] = useState<string>(LOCATIONS[0] || 'Tingo María');

  // Trigger re-render after storage updates
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  // Datos de almacenamiento
  const businesses = LocalStoreRepository.getBusinesses();
  const users = LocalStoreRepository.getUsers();
  const orders = LocalStoreRepository.getOrders();

  // Si no es admin, mostrar pantalla para iniciar sesión o pasar a admin con 1 clic (para facilidad de prueba)
  if (!isAdmin) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ maxWidth: '640px', textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0b4526', marginBottom: '8px' }}>
            Acceso Restringido - Super Administrador
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
            Esta sección es exclusiva para el control general de la plataforma JUÁCIL (gestión de cuentas, activación y suspensión de tiendas).
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="accent"
              size="lg"
              leftIcon={<ShieldAlert size={18} />}
              onClick={() => {
                loginAs('user-admin-01');
                refresh();
              }}
            >
              Iniciar como Administrador General (Demo)
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate(ROUTES.LOGIN)}>
              Ir al Acceso Normal
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Métricas
  const activeStoresCount = businesses.filter((b) => b.status === 'active' || !b.status).length;
  const pendingStoresCount = businesses.filter((b) => b.status === 'pending').length;
  const suspendedStoresCount = businesses.filter((b) => b.status === 'suspended').length;

  const totalGMVCents = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.totalCents, 0);

  // Acciones de Tiendas
  const handleUpdateStoreStatus = (businessId: string, status: BusinessStatus) => {
    LocalStoreRepository.updateBusinessStatus(businessId, status);
    refresh();
  };

  const handleConfirmDeleteStore = () => {
    if (deleteStoreCandidate) {
      LocalStoreRepository.deleteBusiness(deleteStoreCandidate.id);
      setDeleteStoreCandidate(null);
      refresh();
    }
  };

  const handleCreateStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;

    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      name: newStoreName.trim(),
      category: newStoreCategory,
      location: newStoreLocation,
      whatsapp: newStoreWhatsapp.trim() || '962881234',
      ruc: newStoreRuc.trim() || undefined,
      description: newStoreDesc.trim() || 'Tienda registrada por el Administrador General de JUÁCIL.',
      logoUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=200&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      ownerId: currentUser?.id || 'user-admin-01',
      onboardingStep: 4,
      createdAt: new Date().toISOString(),
      status: 'active',
      schedule: 'Lunes a Sábado: 8:00 am - 7:00 pm',
    };

    LocalStoreRepository.saveBusiness(newBiz);
    setCreateStoreModalOpen(false);
    setNewStoreName('');
    setNewStoreWhatsapp('');
    setNewStoreRuc('');
    setNewStoreDesc('');
    refresh();
  };

  // Acciones de Usuarios
  const handleToggleUserStatus = (userId: string, currentStatus?: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    LocalStoreRepository.updateUserStatus(userId, nextStatus);
    refresh();
  };

  const handleConfirmDeleteUser = () => {
    if (deleteUserCandidate) {
      LocalStoreRepository.deleteUser(deleteUserCandidate.id);
      setDeleteUserCandidate(null);
      refresh();
    }
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '984512000',
      role: newUserRole,
      address: newUserAddress.trim() || 'Tingo María',
      zone: newUserZone,
      status: 'active',
      createdAt: new Date().toISOString(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };

    LocalStoreRepository.saveUser(newUser);
    setCreateUserModalOpen(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserAddress('');
    refresh();
  };

  // Filtrado de tiendas
  const filteredStores = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(storeSearch.toLowerCase()) ||
      b.location.toLowerCase().includes(storeSearch.toLowerCase()) ||
      b.category.toLowerCase().includes(storeSearch.toLowerCase());

    const status = b.status || 'active';
    const matchesStatus = storeStatusFilter === 'all' || status === storeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch);

    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Cabecera del Panel de Super Administrador */}
        <div className={styles.adminHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Badge variant="success">SUPER ADMIN ACTIVO</Badge>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Sesión: <strong>{currentUser?.name}</strong> ({currentUser?.email})
              </span>
            </div>
            <h1 className={styles.adminTitle}>Panel General de Administración</h1>
            <p className={styles.adminSubtitle}>
              Gestión centralizada de cuentas de usuario, control y suspensión de tiendas MYPE, y monitoreo global en Tingo María y Selva Central.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                loginAs('user-client-01');
                navigate(ROUTES.HOME);
              }}
            >
              Cambiar a Modo Cliente
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                loginAs('user-merchant-01');
                navigate(ROUTES.MERCHANT_DASHBOARD);
              }}
            >
              Cambiar a Modo Tienda
            </Button>
          </div>
        </div>

        {/* Tarjetas de Métricas Globales Interactivos */}
        <div className={styles.statsGrid}>
          <div
            className={styles.statCard}
            onClick={() => handleTabChange('usuarios')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            title="Ir a Gestión de Usuarios"
          >
            <div className={styles.statTop}>
              <span className={styles.statLabel}>Usuarios Totales</span>
              <div className={styles.statIconWrap} style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
                <Users size={18} />
              </div>
            </div>
            <div className={styles.statNumber}>{users.length}</div>
            <span className={styles.statHint}>
              {users.filter((u) => u.role === 'cliente').length} clientes • {users.filter((u) => u.role === 'merchant').length} tiendas (clic para ver)
            </span>
          </div>

          <div
            className={styles.statCard}
            onClick={() => handleTabChange('tiendas')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            title="Ir a Gestión de Tiendas"
          >
            <div className={styles.statTop}>
              <span className={styles.statLabel}>Tiendas & MYPES</span>
              <div className={styles.statIconWrap} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
                <Store size={18} />
              </div>
            </div>
            <div className={styles.statNumber}>{businesses.length}</div>
            <span className={styles.statHint}>
              <strong style={{ color: '#16a34a' }}>{activeStoresCount} activas</strong> • <strong style={{ color: '#eab308' }}>{pendingStoresCount} pend.</strong> • <strong style={{ color: '#dc2626' }}>{suspendedStoresCount} susp.</strong>
            </span>
          </div>

          <div
            className={styles.statCard}
            onClick={() => handleTabChange('pedidos')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            title="Ir a Pedidos Globales"
          >
            <div className={styles.statTop}>
              <span className={styles.statLabel}>Pedidos Registrados</span>
              <div className={styles.statIconWrap} style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
                <ShoppingBag size={18} />
              </div>
            </div>
            <div className={styles.statNumber}>{orders.length}</div>
            <span className={styles.statHint}>
              {orders.filter((o) => o.status === 'entregado').length} entregados con éxito (clic para ver)
            </span>
          </div>

          <div
            className={styles.statCard}
            onClick={() => handleTabChange('pedidos')}
            style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
            title="Ir a Pedidos Globales"
          >
            <div className={styles.statTop}>
              <span className={styles.statLabel}>Volumen Transaccionado</span>
              <div className={styles.statIconWrap} style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div className={styles.statNumber} style={{ fontSize: '24px' }}>
              {formatMoney(totalGMVCents)}
            </div>
            <span className={styles.statHint}>Ventas brutas acumuladas</span>
          </div>
        </div>

        {/* Barra de Pestañas Principales */}
        <div className={styles.tabsBar}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'tiendas' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('tiendas')}
          >
            <Store size={16} /> Gestión de Tiendas ({businesses.length})
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'usuarios' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('usuarios')}
          >
            <Users size={16} /> Gestión de Usuarios ({users.length})
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'pedidos' ? styles.tabBtnActive : ''}`}
            onClick={() => handleTabChange('pedidos')}
          >
            <ShoppingBag size={16} /> Pedidos Globales ({orders.length})
          </button>
        </div>

        {/* ==============================================================
            PESTAÑA 1: GESTIÓN DE TIENDAS Y MYPES
            ============================================================== */}
        {activeTab === 'tiendas' && (
          <div>
            <div className={styles.toolbarRow}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar tienda por nombre o zona..."
                    className={styles.searchInput}
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                  />
                  <Search size={15} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                </div>

                <Button
                  size="sm"
                  variant={storeStatusFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setStoreStatusFilter('all')}
                >
                  Todas ({businesses.length})
                </Button>
                <Button
                  size="sm"
                  variant={storeStatusFilter === 'active' ? 'primary' : 'outline'}
                  onClick={() => setStoreStatusFilter('active')}
                >
                  Activas ({activeStoresCount})
                </Button>
                <Button
                  size="sm"
                  variant={storeStatusFilter === 'pending' ? 'primary' : 'outline'}
                  onClick={() => setStoreStatusFilter('pending')}
                >
                  Pendientes ({pendingStoresCount})
                </Button>
                <Button
                  size="sm"
                  variant={storeStatusFilter === 'suspended' ? 'primary' : 'outline'}
                  onClick={() => setStoreStatusFilter('suspended')}
                >
                  Suspendidas ({suspendedStoresCount})
                </Button>
              </div>

              <Button
                variant="accent"
                size="md"
                leftIcon={<Plus size={16} />}
                onClick={() => setCreateStoreModalOpen(true)}
              >
                Crear / Registrar Tienda
              </Button>
            </div>

            {/* Tabla de Tiendas (Escritorio) */}
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Tienda MYPE</th>
                      <th>Rubro</th>
                      <th>Ubicación</th>
                      <th>WhatsApp</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones de Administrador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStores.map((biz) => {
                      const status = biz.status || 'active';
                      return (
                        <tr key={biz.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={biz.logoUrl}
                                alt=""
                                style={{ width: '42px', height: '42px', borderRadius: '10px', objectFit: 'cover' }}
                              />
                              <div>
                                <strong style={{ color: '#0b4526', display: 'block' }}>{biz.name}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>RUC: {biz.ruc || 'En trámite'}</span>
                              </div>
                            </div>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{biz.category}</td>
                          <td>{biz.location}</td>
                          <td>{biz.whatsapp}</td>
                          <td>
                            {status === 'active' ? (
                              <Badge variant="success">Activa / En línea</Badge>
                            ) : status === 'pending' ? (
                              <Badge variant="warning">Pendiente Revisión</Badge>
                            ) : (
                              <Badge variant="danger">Suspendida</Badge>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              {status !== 'active' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Aprobar / Activar tienda"
                                  leftIcon={<CheckCircle size={14} color="#16a34a" />}
                                  onClick={() => handleUpdateStoreStatus(biz.id, 'active')}
                                >
                                  Activar
                                </Button>
                              )}

                              {status !== 'suspended' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  title="Suspender tienda (ocultar del catálogo)"
                                  leftIcon={<PauseCircle size={14} color="#eab308" />}
                                  onClick={() => handleUpdateStoreStatus(biz.id, 'suspended')}
                                >
                                  Suspender
                                </Button>
                              )}

                              <Button
                                size="sm"
                                variant="ghost"
                                style={{ color: '#dc2626' }}
                                title="Eliminar tienda de la plataforma"
                                onClick={() => setDeleteStoreCandidate(biz)}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tarjetas Móviles de Tiendas (< 768px) */}
            <div className={styles.mobileCardsList}>
              {filteredStores.map((biz) => {
                const status = biz.status || 'active';
                return (
                  <div key={biz.id} className={styles.mobileCardItem}>
                    <div className={styles.mobileCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={biz.logoUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div>
                          <div className={styles.mobileCardTitle}>{biz.name}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{biz.location}</span>
                        </div>
                      </div>
                      {status === 'active' ? (
                        <Badge variant="success">Activa</Badge>
                      ) : status === 'pending' ? (
                        <Badge variant="warning">Pendiente</Badge>
                      ) : (
                        <Badge variant="danger">Suspendida</Badge>
                      )}
                    </div>

                    <div className={styles.mobileCardRow}>
                      <span>Rubro:</span>
                      <strong style={{ textTransform: 'capitalize' }}>{biz.category}</strong>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span>WhatsApp:</span>
                      <strong>{biz.whatsapp}</strong>
                    </div>

                    <div className={styles.mobileCardActions}>
                      {status !== 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStoreStatus(biz.id, 'active')}
                        >
                          Activar Tienda
                        </Button>
                      )}
                      {status !== 'suspended' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStoreStatus(biz.id, 'suspended')}
                        >
                          Suspender
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: '#dc2626' }}
                        onClick={() => setDeleteStoreCandidate(biz)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==============================================================
            PESTAÑA 2: GESTIÓN DE USUARIOS Y CUENTAS
            ============================================================== */}
        {activeTab === 'usuarios' && (
          <div>
            <div className={styles.toolbarRow}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar usuario por nombre o email..."
                    className={styles.searchInput}
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <Search size={15} style={{ position: 'absolute', right: '12px', top: '13px', color: '#94a3b8' }} />
                </div>

                <Button
                  size="sm"
                  variant={userRoleFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setUserRoleFilter('all')}
                >
                  Todos ({users.length})
                </Button>
                <Button
                  size="sm"
                  variant={userRoleFilter === 'cliente' ? 'primary' : 'outline'}
                  onClick={() => setUserRoleFilter('cliente')}
                >
                  Clientes ({users.filter((u) => u.role === 'cliente').length})
                </Button>
                <Button
                  size="sm"
                  variant={userRoleFilter === 'merchant' ? 'primary' : 'outline'}
                  onClick={() => setUserRoleFilter('merchant')}
                >
                  Tiendas MYPE ({users.filter((u) => u.role === 'merchant').length})
                </Button>
                <Button
                  size="sm"
                  variant={userRoleFilter === 'admin' ? 'primary' : 'outline'}
                  onClick={() => setUserRoleFilter('admin')}
                >
                  Admins ({users.filter((u) => u.role === 'admin').length})
                </Button>
              </div>

              <Button
                variant="accent"
                size="md"
                leftIcon={<Plus size={16} />}
                onClick={() => setCreateUserModalOpen(true)}
              >
                Crear Nuevo Usuario
              </Button>
            </div>

            {/* Tabla de Usuarios (Escritorio) */}
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol en JUÁCIL</th>
                      <th>Teléfono</th>
                      <th>Zona / Dirección</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones de Administrador</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => {
                      const isSuspended = u.status === 'suspended';
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <img
                                src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                                alt=""
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                              <div>
                                <strong style={{ color: '#0b4526', display: 'block' }}>{u.name}</strong>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            {u.role === 'admin' ? (
                              <Badge variant="info">🛡️ Admin</Badge>
                            ) : u.role === 'merchant' ? (
                              <Badge variant="lime">🏪 Tienda MYPE</Badge>
                            ) : (
                              <Badge variant="neutral">👤 Cliente</Badge>
                            )}
                          </td>
                          <td>{u.phone}</td>
                          <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {u.address || u.zone || 'Tingo María'}
                          </td>
                          <td>
                            {isSuspended ? (
                              <Badge variant="danger">Cuenta Suspendida</Badge>
                            ) : (
                              <Badge variant="success">Cuenta Activa</Badge>
                            )}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <Button
                                size="sm"
                                variant="outline"
                                title={isSuspended ? 'Reactivar usuario' : 'Suspender usuario'}
                                leftIcon={isSuspended ? <CheckCircle size={14} color="#16a34a" /> : <XCircle size={14} color="#dc2626" />}
                                onClick={() => handleToggleUserStatus(u.id, u.status)}
                              >
                                {isSuspended ? 'Reactivar' : 'Suspender'}
                              </Button>

                              <Button
                                size="sm"
                                variant="ghost"
                                style={{ color: '#dc2626' }}
                                title="Eliminar cuenta de usuario"
                                onClick={() => setDeleteUserCandidate(u)}
                                disabled={u.id === currentUser?.id}
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tarjetas Móviles de Usuarios (< 768px) */}
            <div className={styles.mobileCardsList}>
              {filteredUsers.map((u) => {
                const isSuspended = u.status === 'suspended';
                return (
                  <div key={u.id} className={styles.mobileCardItem}>
                    <div className={styles.mobileCardHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt=""
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div className={styles.mobileCardTitle}>{u.name}</div>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{u.email}</span>
                        </div>
                      </div>
                      {isSuspended ? (
                        <Badge variant="danger">Suspendida</Badge>
                      ) : (
                        <Badge variant="success">Activa</Badge>
                      )}
                    </div>

                    <div className={styles.mobileCardRow}>
                      <span>Rol:</span>
                      <strong>{u.role}</strong>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span>Celular:</span>
                      <strong>{u.phone}</strong>
                    </div>

                    <div className={styles.mobileCardActions}>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                      >
                        {isSuspended ? 'Reactivar Cuenta' : 'Suspender Cuenta'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        style={{ color: '#dc2626' }}
                        onClick={() => setDeleteUserCandidate(u)}
                        disabled={u.id === currentUser?.id}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==============================================================
            PESTAÑA 3: PEDIDOS Y TRANSACCIONES GLOBALES
            ============================================================== */}
        {activeTab === 'pedidos' && (
          <div>
            <div className={styles.tableCard}>
              <div className={styles.tableWrapper}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Fecha</th>
                      <th>Tienda MYPE</th>
                      <th>Comprador</th>
                      <th>Total</th>
                      <th>Modalidad</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <strong style={{ color: '#0b4526' }}>{o.orderCode}</strong>
                        </td>
                        <td>{formatDateTime(o.createdAt)}</td>
                        <td>{o.businessName}</td>
                        <td>
                          <div>
                            <strong>{o.customerName}</strong>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>{o.customerPhone}</div>
                          </div>
                        </td>
                        <td>
                          <strong>{formatMoney(o.totalCents)}</strong>
                        </td>
                        <td>{o.deliveryType === 'delivery' ? 'Domicilio' : 'Recojo local'}</td>
                        <td>
                          <OrderStatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Crear Tienda Nueva */}
      <Modal
        isOpen={createStoreModalOpen}
        onClose={() => setCreateStoreModalOpen(false)}
        title="Registrar Nueva Tienda o MYPE"
      >
        <form onSubmit={handleCreateStoreSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Nombre Comercial de la Tienda"
            isRequired
            placeholder="Ej. Bodega La Tingalesa"
            value={newStoreName}
            onChange={(e) => setNewStoreName(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Rubro"
              isRequired
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
              value={newStoreCategory}
              onChange={(e) => setNewStoreCategory(e.target.value)}
            />

            <Select
              label="Ubicación"
              isRequired
              options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
              value={newStoreLocation}
              onChange={(e) => setNewStoreLocation(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="WhatsApp de Ventas"
              isRequired
              placeholder="Ej. 962881234"
              value={newStoreWhatsapp}
              onChange={(e) => setNewStoreWhatsapp(e.target.value)}
            />

            <Input
              label="RUC Referencial"
              placeholder="11 dígitos (opcional)"
              value={newStoreRuc}
              onChange={(e) => setNewStoreRuc(e.target.value)}
            />
          </div>

          <Textarea
            label="Descripción de la Tienda"
            placeholder="Breve reseña de la tienda o bodega..."
            rows={3}
            value={newStoreDesc}
            onChange={(e) => setNewStoreDesc(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setCreateStoreModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Guardar y Activar Tienda
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Crear Usuario Nuevo */}
      <Modal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        title="Crear Nueva Cuenta de Usuario"
      >
        <form onSubmit={handleCreateUserSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Nombre Completo"
            isRequired
            placeholder="Ej. Juan Pérez"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />

          <Input
            label="Correo Electrónico"
            isRequired
            type="email"
            placeholder="juan@ejemplo.pe"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Teléfono / WhatsApp"
              isRequired
              placeholder="Ej. 984512345"
              value={newUserPhone}
              onChange={(e) => setNewUserPhone(e.target.value)}
            />

            <Select
              label="Rol Asignado"
              isRequired
              options={[
                { value: 'cliente', label: 'Cliente Comprador' },
                { value: 'merchant', label: 'Tienda / MYPE' },
                { value: 'admin', label: 'Super Administrador' },
              ]}
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
            />
          </div>

          <Select
            label="Zona en Tingo María"
            isRequired
            options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
            value={newUserZone}
            onChange={(e) => setNewUserZone(e.target.value)}
          />

          <Input
            label="Dirección de Entrega"
            placeholder="Ej. Av. Tito Jaime 400"
            value={newUserAddress}
            onChange={(e) => setNewUserAddress(e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <Button type="button" variant="outline" onClick={() => setCreateUserModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent">
              Crear Usuario
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Confirmación Eliminar Tienda */}
      <Modal
        isOpen={Boolean(deleteStoreCandidate)}
        onClose={() => setDeleteStoreCandidate(null)}
        title="¿Eliminar Tienda de la Plataforma?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteStoreCandidate(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteStore}>
              Sí, eliminar definitivamente
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar permanentemente a <strong>{deleteStoreCandidate?.name}</strong>?
          Esta acción removerá sus datos del registro central de JUÁCIL.
        </p>
      </Modal>

      {/* Modal: Confirmación Eliminar Usuario */}
      <Modal
        isOpen={Boolean(deleteUserCandidate)}
        onClose={() => setDeleteUserCandidate(null)}
        title="¿Eliminar Cuenta de Usuario?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteUserCandidate(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteUser}>
              Sí, eliminar usuario
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar la cuenta de <strong>{deleteUserCandidate?.name}</strong> ({deleteUserCandidate?.email})?
        </p>
      </Modal>
    </div>
  );
};
