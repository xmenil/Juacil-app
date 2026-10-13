import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import {
  Package,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink,
} from 'lucide-react';

export const MerchantDashboardPage: React.FC = () => {
  const { currentUser, isMerchant, businessId } = useSession();
  const navigate = useNavigate();

  if (!isMerchant || !businessId) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const business = LocalStoreRepository.getBusinessById(businessId);
  const products = LocalStoreRepository.getProductsByBusiness(businessId);
  const orders = LocalStoreRepository.getOrdersByBusiness(businessId);

  if (!business) {
    return <div className="container" style={{ padding: '64px 16px' }}>Negocio no encontrado.</div>;
  }

  // Métricas calculadas
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 4);
  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const totalSalesCents = orders
    .filter((o) => o.status === 'entregado' || o.status === 'preparado' || o.status === 'confirmado')
    .reduce((acc, curr) => acc + curr.totalCents, 0);

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        {/* Cabecera del Panel */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                PANEL DE GESTIÓN COMERCIAL MYPE
              </span>
              <Badge variant="lime">En línea</Badge>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              {business.name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Administrador responsable: <strong>{currentUser?.name}</strong> • {business.location}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link to={ROUTES.STORE_DETAIL(business.id)} target="_blank">
              <Button size="md" variant="outline" rightIcon={<ExternalLink size={14} />}>
                Ver mi tienda pública
              </Button>
            </Link>

            <Button
              size="md"
              variant="accent"
              leftIcon={<Plus size={16} />}
              onClick={() => navigate(ROUTES.MERCHANT_PRODUCT_NEW)}
            >
              Nuevo Producto
            </Button>
          </div>
        </div>

        {/* Tarjetas de Métricas Clave */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-primary-700)', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Ventas Totales</span>
              <TrendingUp size={20} />
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              {formatMoney(totalSalesCents)}
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              De {orders.length} pedidos registrados
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#b45309', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Pedidos Pendientes</span>
              <Clock size={20} />
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              {pendingOrders.length}
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              Requieren confirmación o WhatsApp
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--color-primary-800)', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Productos en Catálogo</span>
              <Package size={20} />
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              {products.length}
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              {products.filter((p) => p.status === 'published').length} publicados
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#dc2626', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Alertas de Stock</span>
              <AlertTriangle size={20} />
            </div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              {lowStockProducts.length + outOfStockProducts.length}
            </span>
            <span style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-subtle)', marginTop: '4px' }}>
              {outOfStockProducts.length} agotados, {lowStockProducts.length} por terminar
            </span>
          </div>
        </div>

        {/* Accesos Rápidos a Módulos del Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Gestión de Productos</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Modifica precios, inventario en tiempo real, fotos y pasa productos a borrador o publicados.
            </p>
            <Link to={ROUTES.MERCHANT_PRODUCTS}>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                Administrar Mis Productos ({products.length})
              </Button>
            </Link>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Gestión de Pedidos</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Consulta las órdenes de tus clientes, confirma stock, prepáralas y coordina entregas.
            </p>
            <Link to={ROUTES.MERCHANT_ORDERS}>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                Ver Pedidos Recibidos ({orders.length})
              </Button>
            </Link>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Perfil de la MYPE</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              Actualiza la historia de tu emprendimiento, celular de WhatsApp, logo y RUC referencial.
            </p>
            <Link to={ROUTES.MERCHANT_BUSINESS}>
              <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                Editar Datos de la Tienda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
