import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product, ProductStatus } from '@/entities/product/model/types';
import { OrderStatus } from '@/entities/order/model/types';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { LOCATIONS, CATEGORIES } from '@/shared/config/constants';
import { buildOrderWhatsAppMessage, createWhatsAppLink } from '@/shared/lib/whatsapp';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Alert } from '@/shared/ui/Alert';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { ProductForm } from '@/features/product-management/ProductForm';
import {
  Package,
  AlertTriangle,
  Plus,
  TrendingUp,
  Clock,
  ExternalLink,
  Bell,
  MessageCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Store,
  Save,
  Search,
} from 'lucide-react';
import styles from './MerchantDashboardPage.module.css';

export const MerchantDashboardPage: React.FC = () => {
  const { currentUser, isMerchant, isAdmin, businessId } = useSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Si no es merchant ni admin, denegar acceso
  if (!isMerchant && !isAdmin) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  // Si es admin o merchant pero no tiene businessId asignado, usar 'biz-cafe-aroma' por defecto
  const activeBusinessId = businessId || 'biz-cafe-aroma';
  const business = LocalStoreRepository.getBusinessById(activeBusinessId);

  // Pestaña activa sincronizada con la URL
  const [activeTab, setActiveTab] = useState<'reportes' | 'pedidos' | 'productos' | 'perfil'>('reportes');

  // Filtros de Productos y Pedidos
  const [productFilter, setProductFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Modales
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  // Escuchar y sincronizar parámetros de la URL (?tab=..., ?crear=true, ?filtro=...)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'pedidos' || tabParam === 'productos' || tabParam === 'perfil' || tabParam === 'reportes') {
      setActiveTab(tabParam);
    }

    if (searchParams.get('crear') === 'true') {
      setCreateProductModalOpen(true);
    }

    const filtroParam = searchParams.get('filtro');
    if (filtroParam) {
      if (tabParam === 'pedidos') {
        setOrderStatusFilter(filtroParam);
      } else if (tabParam === 'productos') {
        setProductFilter(filtroParam);
      }
    }

    const editId = searchParams.get('editar');
    if (editId) {
      const found = LocalStoreRepository.getProductById(editId);
      if (found) {
        setEditingProduct(found);
      }
    }
  }, [searchParams]);

  const handleTabChange = (nextTab: 'reportes' | 'pedidos' | 'productos' | 'perfil') => {
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  // Formulario de Datos de la Tienda
  const [storeName, setStoreName] = useState(business?.name || '');
  const [storeCategory, setStoreCategory] = useState(business?.category || 'cafe');
  const [storeLocation, setStoreLocation] = useState(business?.location || LOCATIONS[0] || 'Tingo María');
  const [storeWhatsapp, setStoreWhatsapp] = useState(business?.whatsapp || '');
  const [storeRuc, setStoreRuc] = useState(business?.ruc || '');
  const [storeSchedule, setStoreSchedule] = useState(business?.schedule || 'Lunes a Sábado: 8:00 am - 7:30 pm');
  const [storeDesc, setStoreDesc] = useState(business?.description || '');
  const [storeLogoUrl, setStoreLogoUrl] = useState(business?.logoUrl || '');
  const [storeBannerUrl, setStoreBannerUrl] = useState(business?.bannerUrl || '');
  const [storeUpdateSuccess, setStoreUpdateSuccess] = useState<string | null>(null);

  // Refresco de estado local
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  if (!business) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
          <h2>Emprendimiento no encontrado</h2>
          <Button variant="primary" onClick={() => navigate(ROUTES.HOME)}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // Datos de la tienda
  const products = LocalStoreRepository.getProductsByBusiness(business.id);
  const orders = LocalStoreRepository.getOrdersByBusiness(business.id);

  // Métricas
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmado');
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 4);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const deliveredOrders = orders.filter((o) => o.status === 'entregado');
  const totalSalesCents = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((acc, curr) => acc + curr.totalCents, 0);

  // Acciones de Pedidos
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    LocalStoreRepository.updateOrderStatus(orderId, nextStatus);
    refresh();
  };

  // Acciones de Productos
  const handleToggleProductStatus = (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'published' ? 'draft' : 'published';
    LocalStoreRepository.saveProduct({
      ...product,
      status: nextStatus,
    });
    refresh();
  };

  const handleCreateProductSubmit = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    LocalStoreRepository.saveProduct({
      ...data,
      id: '',
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setCreateProductModalOpen(false);
    refresh();
  };

  const handleEditProductSubmit = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      LocalStoreRepository.saveProduct({
        ...data,
        id: editingProduct.id,
        businessId: business.id,
        createdAt: editingProduct.createdAt,
        updatedAt: new Date().toISOString(),
      });
      setEditingProduct(null);
      refresh();
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (deleteProductCandidate) {
      LocalStoreRepository.deleteProduct(deleteProductCandidate.id);
      setDeleteProductCandidate(null);
      refresh();
    }
  };

  // Guardar Datos de la Tienda
  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    LocalStoreRepository.saveBusiness({
      ...business,
      name: storeName.trim(),
      category: storeCategory,
      location: storeLocation,
      whatsapp: storeWhatsapp.trim(),
      ruc: storeRuc.trim() || undefined,
      schedule: storeSchedule.trim(),
      description: storeDesc.trim(),
      logoUrl: storeLogoUrl.trim() || business.logoUrl,
      bannerUrl: storeBannerUrl.trim() || business.bannerUrl,
    });
    setStoreUpdateSuccess('¡Los datos de tu tienda y horario fueron actualizados correctamente!');
    setTimeout(() => setStoreUpdateSuccess(null), 3500);
    refresh();
  };

  // Filtrado de Productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    if (productFilter === 'published') return matchesSearch && p.status === 'published';
    if (productFilter === 'draft') return matchesSearch && p.status === 'draft';
    if (productFilter === 'outOfStock') return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  // Filtrado de Pedidos
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all') return o.status === orderStatusFilter;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Cabecera del Panel Comercial */}
        <div className={styles.dashboardHeader}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ADMINISTRACIÓN DE TIENDA MYPE
              </span>
              <Badge variant="lime">En Línea</Badge>
            </div>
            <h1 className={styles.headerTitle}>{business.name}</h1>
            <p className={styles.headerSubtitle}>
              Responsable: <strong>{currentUser?.name}</strong> • {business.location} • WhatsApp: {business.whatsapp}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to={ROUTES.STORE_DETAIL(business.id)} target="_blank">
              <Button size="sm" variant="outline" rightIcon={<ExternalLink size={14} />}>
                Ver Mi Tienda Pública
              </Button>
            </Link>

            <Button
              size="sm"
              variant="accent"
              leftIcon={<Plus size={15} />}
              onClick={() => setCreateProductModalOpen(true)}
            >
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Banner de Notificaciones de Pedidos Nuevos (Req: Notificaciones de productos pedidos) */}
        {pendingOrders.length > 0 && (
          <div className={styles.notificationBanner}>
            <div className={styles.notificationLeft}>
              <div className={styles.notificationIconWrap}>
                <Bell size={20} />
              </div>
              <div className={styles.notificationText}>
                <strong>🔔 ¡Tienes {pendingOrders.length} nuevo(s) pedido(s) recibido(s)!</strong>
                <p>
                  Tus clientes están esperando confirmación de stock para coordinar entrega por WhatsApp.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                handleTabChange('pedidos');
                setOrderStatusFilter('pendiente');
              }}
            >
              Revisar Pedidos Pendientes ({pendingOrders.length})
            </Button>
          </div>
        )}

        {/* Pestañas de Navegación del Panel de Tienda */}
        <div className={styles.tabsNav}>
          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'reportes' ? styles.tabItemActive : ''}`}
            onClick={() => handleTabChange('reportes')}
          >
            <TrendingUp size={16} /> Resumen & Reportes
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'pedidos' ? styles.tabItemActive : ''}`}
            onClick={() => handleTabChange('pedidos')}
          >
            <Bell size={16} /> Pedidos & Notificaciones
            {pendingOrders.length > 0 && (
              <span className={styles.tabBadge}>{pendingOrders.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'productos' ? styles.tabItemActive : ''}`}
            onClick={() => handleTabChange('productos')}
          >
            <Package size={16} /> Gestión de Productos ({products.length})
          </button>

          <button
            type="button"
            className={`${styles.tabItem} ${activeTab === 'perfil' ? styles.tabItemActive : ''}`}
            onClick={() => handleTabChange('perfil')}
          >
            <Store size={16} /> Perfil & Horario Tienda
          </button>
        </div>

        {/* ================================================================
            PESTAÑA 1: RESUMEN Y REPORTES
            ================================================================ */}
        {activeTab === 'reportes' && (
          <div>
            {/* Tarjetas de Métricas Clave Interactivos */}
            <div className={styles.metricsGrid}>
              <div
                className={styles.metricCard}
                onClick={() => handleTabChange('pedidos')}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title="Ver todos los pedidos de la tienda"
              >
                <div className={styles.metricHeader}>
                  <span>Ventas Brutas</span>
                  <TrendingUp size={18} color="#166534" />
                </div>
                <span className={styles.metricValue}>{formatMoney(totalSalesCents)}</span>
                <span className={styles.metricHint}>De {orders.length} pedidos totales (clic para ver)</span>
              </div>

              <div
                className={styles.metricCard}
                onClick={() => {
                  handleTabChange('pedidos');
                  setOrderStatusFilter('pendiente');
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title="Ver pedidos pendientes de confirmación"
              >
                <div className={styles.metricHeader}>
                  <span>Pedidos Pendientes</span>
                  <Clock size={18} color="#d97706" />
                </div>
                <span className={styles.metricValue} style={{ color: pendingOrders.length > 0 ? '#d97706' : undefined }}>
                  {pendingOrders.length}
                </span>
                <span className={styles.metricHint}>Requieren respuesta inmediata (clic para ver)</span>
              </div>

              <div
                className={styles.metricCard}
                onClick={() => {
                  handleTabChange('pedidos');
                  setOrderStatusFilter('confirmado');
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title="Ver pedidos confirmados y en ruta"
              >
                <div className={styles.metricHeader}>
                  <span>Confirmados & En Ruta</span>
                  <Truck size={18} color="#0284c7" />
                </div>
                <span className={styles.metricValue}>{confirmedOrders.length}</span>
                <span className={styles.metricHint}>{deliveredOrders.length} ya entregados (clic para ver)</span>
              </div>

              <div
                className={styles.metricCard}
                onClick={() => {
                  handleTabChange('productos');
                  setProductFilter('outOfStock');
                }}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                title="Ver productos con alerta de inventario"
              >
                <div className={styles.metricHeader}>
                  <span>Alertas de Inventario</span>
                  <AlertTriangle size={18} color="#dc2626" />
                </div>
                <span className={styles.metricValue} style={{ color: outOfStockProducts.length > 0 ? '#dc2626' : undefined }}>
                  {lowStockProducts.length + outOfStockProducts.length}
                </span>
                <span className={styles.metricHint}>
                  {outOfStockProducts.length} agotados, {lowStockProducts.length} por terminar (clic para ver)
                </span>
              </div>
            </div>

            {/* Accesos y Reporte de Productos Top */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
              {/* Pedidos Recientes */}
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0b4526', margin: 0 }}>
                    Últimas Órdenes Recibidas
                  </h3>
                  <Button size="sm" variant="outline" onClick={() => handleTabChange('pedidos')}>
                    Ver Todas ({orders.length})
                  </Button>
                </div>

                {orders.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        style={{
                          padding: '14px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: '#0b4526' }}>{order.orderCode}</strong>
                            <OrderStatusBadge status={order.status} />
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                            {order.customerName} • {order.customerPhone} ({order.items.length} productos)
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 800 }}>
                            {formatMoney(order.totalCents)}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              handleTabChange('pedidos');
                              setOrderStatusFilter(order.status);
                            }}
                          >
                            Gestionar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontSize: '14px' }}>
                    Aún no tienes pedidos registrados en tu tienda.
                  </p>
                )}
              </div>

              {/* Alertas y Acciones Rápidas */}
              <div>
                <div className={styles.card}>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0b4526', marginBottom: '12px' }}>
                    Resumen del Catálogo
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Productos Publicados:</span>
                      <strong>{products.filter((p) => p.status === 'published').length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Productos en Borrador:</span>
                      <strong>{products.filter((p) => p.status === 'draft').length}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b' }}>Stock Total en Bodega:</span>
                      <strong>{products.reduce((acc, curr) => acc + curr.stock, 0)} unidades</strong>
                    </div>
                  </div>

                  <Button
                    fullWidth
                    variant="accent"
                    size="sm"
                    style={{ marginTop: '16px' }}
                    leftIcon={<Plus size={14} />}
                    onClick={() => setCreateProductModalOpen(true)}
                  >
                    Crear Nuevo Producto
                  </Button>
                </div>

                <div className={styles.card} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '8px' }}>
                    <MessageCircle size={18} />
                    <strong style={{ fontSize: '14px' }}>WhatsApp de Ventas</strong>
                  </div>
                  <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 10px 0' }}>
                    Los compradores de Tingo María te contactan al celular: <strong>{business.whatsapp}</strong>.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    fullWidth
                    style={{ backgroundColor: '#ffffff', borderColor: '#86efac', color: '#166534' }}
                    onClick={() => handleTabChange('perfil')}
                  >
                    Actualizar Datos de Contacto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================
            PESTAÑA 2: GESTIÓN DE PEDIDOS Y NOTIFICACIONES
            ================================================================ */}
        {activeTab === 'pedidos' && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <Button
                size="sm"
                variant={orderStatusFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('all')}
              >
                Todos ({orders.length})
              </Button>
              <Button
                size="sm"
                variant={orderStatusFilter === 'pendiente' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('pendiente')}
              >
                🔔 Pendientes ({orders.filter((o) => o.status === 'pendiente').length})
              </Button>
              <Button
                size="sm"
                variant={orderStatusFilter === 'confirmado' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('confirmado')}
              >
                Confirmados ({orders.filter((o) => o.status === 'confirmado').length})
              </Button>
              <Button
                size="sm"
                variant={orderStatusFilter === 'preparado' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('preparado')}
              >
                Preparados ({orders.filter((o) => o.status === 'preparado').length})
              </Button>
              <Button
                size="sm"
                variant={orderStatusFilter === 'entregado' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('entregado')}
              >
                Entregados ({orders.filter((o) => o.status === 'entregado').length})
              </Button>
              <Button
                size="sm"
                variant={orderStatusFilter === 'cancelado' ? 'primary' : 'outline'}
                onClick={() => setOrderStatusFilter('cancelado')}
              >
                Cancelados ({orders.filter((o) => o.status === 'cancelado').length})
              </Button>
            </div>

            {filteredOrders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map((order) => {
                  const waText = buildOrderWhatsAppMessage({
                    orderCode: order.orderCode,
                    customerName: order.customerName,
                    businessName: business.name,
                    items: order.items.map((i) => ({
                      name: i.productName,
                      quantity: i.quantity,
                      subtotalFormatted: formatMoney(i.subtotalCents),
                    })),
                    totalFormatted: formatMoney(order.totalCents),
                    deliveryType: order.deliveryType,
                    deliveryAddress: order.deliveryAddress,
                  });
                  const waUrl = createWhatsAppLink(order.customerPhone, waText);

                  return (
                    <div key={order.id} className={styles.card} style={{ marginBottom: '0' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '12px',
                          borderBottom: '1px solid #f1f5f9',
                          paddingBottom: '12px',
                          marginBottom: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0b4526' }}>
                            {order.orderCode}
                          </span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatDateTime(order.createdAt)}
                        </span>
                      </div>

                      {/* Info del Cliente y Productos */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                            Cliente: {order.customerName}
                          </strong>
                          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                            WhatsApp: <strong>{order.customerPhone}</strong>
                          </span>
                          <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                            Modalidad: <strong>{order.deliveryType === 'pickup' ? 'Recojo en local' : 'Envío a domicilio'}</strong>
                          </span>
                          {order.deliveryAddress && (
                            <span style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                              Dirección: {order.deliveryAddress}
                            </span>
                          )}
                        </div>

                        <div>
                          <strong style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>
                            Artículos ({order.items.length}):
                          </strong>
                          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#334155' }}>
                            {order.items.map((it) => (
                              <li key={it.productId}>
                                {it.quantity}x {it.productName} ({formatMoney(it.subtotalCents)})
                              </li>
                            ))}
                          </ul>
                          <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 800, color: '#0b4526' }}>
                            Total a cobrar: {formatMoney(order.totalCents)}
                          </div>
                        </div>
                      </div>

                      {/* Acciones de Ciclo de Vida del Pedido */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '10px',
                          borderTop: '1px solid #f1f5f9',
                          paddingTop: '12px',
                        }}
                      >
                        <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                          <Button size="sm" variant="accent" leftIcon={<MessageCircle size={15} />}>
                            WhatsApp al Cliente
                          </Button>
                        </a>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {order.status === 'pendiente' && (
                            <Button
                              size="sm"
                              variant="primary"
                              leftIcon={<CheckCircle size={14} />}
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmado')}
                            >
                              Confirmar Pedido
                            </Button>
                          )}

                          {order.status === 'confirmado' && (
                            <Button
                              size="sm"
                              variant="primary"
                              leftIcon={<Package size={14} />}
                              onClick={() => handleUpdateOrderStatus(order.id, 'preparado')}
                            >
                              Marcar Preparado
                            </Button>
                          )}

                          {order.status === 'preparado' && (
                            <Button
                              size="sm"
                              variant="primary"
                              leftIcon={<Truck size={14} />}
                              onClick={() => handleUpdateOrderStatus(order.id, 'entregado')}
                            >
                              Marcar Entregado
                            </Button>
                          )}

                          {order.status !== 'cancelado' && order.status !== 'entregado' && (
                            <Button
                              size="sm"
                              variant="outline"
                              style={{ color: '#dc2626' }}
                              onClick={() => handleUpdateOrderStatus(order.id, 'cancelado')}
                            >
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.card} style={{ textAlign: 'center', padding: '48px 20px' }}>
                <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '8px 0 4px' }}>
                  No hay pedidos con este filtro
                </h3>
                <p style={{ color: '#64748b', fontSize: '13px' }}>
                  Los nuevos pedidos que los clientes realicen para tu tienda aparecerán aquí automáticamente.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ================================================================
            PESTAÑA 3: GESTIÓN DE PRODUCTOS
            ================================================================ */}
        {activeTab === 'productos' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    className={styles.searchInput}
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', width: '220px' }}
                  />
                  <Search size={14} style={{ position: 'absolute', right: '10px', top: '11px', color: '#94a3b8' }} />
                </div>

                <Button
                  size="sm"
                  variant={productFilter === 'all' ? 'primary' : 'outline'}
                  onClick={() => setProductFilter('all')}
                >
                  Todos ({products.length})
                </Button>
                <Button
                  size="sm"
                  variant={productFilter === 'published' ? 'primary' : 'outline'}
                  onClick={() => setProductFilter('published')}
                >
                  Publicados ({products.filter((p) => p.status === 'published').length})
                </Button>
                <Button
                  size="sm"
                  variant={productFilter === 'draft' ? 'primary' : 'outline'}
                  onClick={() => setProductFilter('draft')}
                >
                  Borradores ({products.filter((p) => p.status === 'draft').length})
                </Button>
                <Button
                  size="sm"
                  variant={productFilter === 'outOfStock' ? 'primary' : 'outline'}
                  onClick={() => setProductFilter('outOfStock')}
                >
                  Agotados ({products.filter((p) => p.stock === 0).length})
                </Button>
              </div>

              <Button
                variant="accent"
                size="sm"
                leftIcon={<Plus size={15} />}
                onClick={() => setCreateProductModalOpen(true)}
              >
                Crear Nuevo Producto
              </Button>
            </div>

            {/* Tabla de Productos (Escritorio) */}
            <div className={`${styles.card} ${styles.desktopOnly}`} style={{ padding: 0, overflow: 'hidden' }}>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={p.imageUrl}
                              alt=""
                              style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                            />
                            <div>
                              <strong style={{ color: '#0b4526', display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>ID: {p.id}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                        <td>
                          <strong>{formatMoney(p.priceCents)}</strong>
                        </td>
                        <td>
                          {p.stock === 0 ? (
                            <Badge variant="danger">0 Agotado</Badge>
                          ) : p.stock <= 4 ? (
                            <Badge variant="warning">{p.stock} unids.</Badge>
                          ) : (
                            <span>{p.stock} unids.</span>
                          )}
                        </td>
                        <td>
                          {p.status === 'published' ? (
                            <Badge variant="success">Publicado</Badge>
                          ) : (
                            <Badge variant="neutral">Borrador</Badge>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <Button
                              size="sm"
                              variant="ghost"
                              title={p.status === 'published' ? 'Pausar producto' : 'Publicar producto'}
                              onClick={() => handleToggleProductStatus(p)}
                            >
                              {p.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              title="Editar producto"
                              onClick={() => setEditingProduct(p)}
                            >
                              <Edit2 size={15} />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              style={{ color: '#dc2626' }}
                              title="Eliminar producto"
                              onClick={() => setDeleteProductCandidate(p)}
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tarjetas Responsivas en Móvil */}
            <div className={styles.mobileCardsGrid}>
              {filteredProducts.map((p) => (
                <div key={p.id} className={styles.mobileCard}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                    <img
                      src={p.imageUrl}
                      alt=""
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div>
                      <strong style={{ fontSize: '14px', color: '#0b4526', display: 'block' }}>{p.name}</strong>
                      <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                        {p.category} • {formatMoney(p.priceCents)}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '12px' }}>
                    <span>
                      Stock: <strong>{p.stock} unids.</strong>
                    </span>
                    {p.status === 'published' ? (
                      <Badge variant="success">Publicado</Badge>
                    ) : (
                      <Badge variant="neutral">Borrador</Badge>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleProductStatus(p)}
                    >
                      {p.status === 'published' ? 'Pausar' : 'Activar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingProduct(p)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      style={{ color: '#dc2626' }}
                      onClick={() => setDeleteProductCandidate(p)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================
            PESTAÑA 4: PERFIL Y DATOS DE LA TIENDA
            ================================================================ */}
        {activeTab === 'perfil' && (
          <div className={styles.card} style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0b4526', marginBottom: '6px' }}>
              Datos del Emprendimiento y Horarios
            </h2>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
              Actualiza la información visible en la página pública de tu tienda para que tus clientes te ubiquen fácilmente.
            </p>

            {storeUpdateSuccess && (
              <div style={{ marginBottom: '16px' }}>
                <Alert variant="success">{storeUpdateSuccess}</Alert>
              </div>
            )}

            <form onSubmit={handleSaveStoreProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Nombre Comercial de la Tienda"
                isRequired
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <Select
                  label="Rubro o Categoría"
                  isRequired
                  options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                />

                <Select
                  label="Zona / Localidad"
                  isRequired
                  options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <Input
                  label="WhatsApp para Coordinar Ventas"
                  isRequired
                  placeholder="Ej. 962881234"
                  value={storeWhatsapp}
                  onChange={(e) => setStoreWhatsapp(e.target.value)}
                />

                <Input
                  label="RUC Referencial (Opcional)"
                  placeholder="11 dígitos (ej. 20601234567)"
                  value={storeRuc}
                  onChange={(e) => setStoreRuc(e.target.value)}
                />
              </div>

              <Input
                label="Horario de Atención"
                isRequired
                placeholder="Ej. Lunes a Sábado: 8:00 am - 7:30 pm"
                value={storeSchedule}
                onChange={(e) => setStoreSchedule(e.target.value)}
              />

              <Textarea
                label="Historia y Descripción del Negocio"
                isRequired
                rows={3}
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <Input
                  label="URL del Logo (Opcional)"
                  value={storeLogoUrl}
                  onChange={(e) => setStoreLogoUrl(e.target.value)}
                />

                <Input
                  label="URL del Banner (Opcional)"
                  value={storeBannerUrl}
                  onChange={(e) => setStoreBannerUrl(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <Button type="submit" variant="accent" leftIcon={<Save size={16} />}>
                  Guardar Datos de la Tienda
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Modal: Crear Producto */}
      <Modal
        isOpen={createProductModalOpen}
        onClose={() => setCreateProductModalOpen(false)}
        title="Crear Nuevo Producto para la Tienda"
      >
        <ProductForm
          onSubmit={handleCreateProductSubmit}
          onCancel={() => setCreateProductModalOpen(false)}
        />
      </Modal>

      {/* Modal: Editar Producto */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={() => setEditingProduct(null)}
        title="Editar Detalles del Producto"
      >
        {editingProduct && (
          <ProductForm
            initialProduct={editingProduct}
            onSubmit={handleEditProductSubmit}
            onCancel={() => setEditingProduct(null)}
          />
        )}
      </Modal>

      {/* Modal: Confirmar Eliminar Producto */}
      <Modal
        isOpen={Boolean(deleteProductCandidate)}
        onClose={() => setDeleteProductCandidate(null)}
        title="¿Eliminar este producto?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteProductCandidate(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDeleteProduct}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar <strong>{deleteProductCandidate?.name}</strong>? Esta
          acción lo retirará del catálogo de venta pública.
        </p>
      </Modal>
    </div>
  );
};
