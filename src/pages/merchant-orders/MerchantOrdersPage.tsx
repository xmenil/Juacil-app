import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { Button } from '@/shared/ui/Button';
import { ArrowLeft, User, Calendar, ArrowRight, Package } from 'lucide-react';

export const MerchantOrdersPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!isMerchant || !businessId) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const allOrders = LocalStoreRepository.getOrdersByBusiness(businessId);

  const filteredOrders = allOrders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        <Link
          to={ROUTES.MERCHANT_DASHBOARD}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
            Gestión de Pedidos Recibidos
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Control del ciclo de vida y entrega de pedidos para tu MYPE ({allOrders.length} totales).
          </p>
        </div>

        {/* Pestañas de Filtro */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant={statusFilter === 'all' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('all')}
          >
            Todos ({allOrders.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'pendiente' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('pendiente')}
          >
            Pendientes ({allOrders.filter((o) => o.status === 'pendiente').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'confirmado' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('confirmado')}
          >
            Confirmados ({allOrders.filter((o) => o.status === 'confirmado').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'preparado' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('preparado')}
          >
            Preparados ({allOrders.filter((o) => o.status === 'preparado').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'entregado' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('entregado')}
          >
            Entregados ({allOrders.filter((o) => o.status === 'entregado').length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === 'cancelado' ? 'primary' : 'outline'}
            onClick={() => setStatusFilter('cancelado')}
          >
            Cancelados ({allOrders.filter((o) => o.status === 'cancelado').length})
          </Button>
        </div>

        {/* Listado */}
        {filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', color: 'var(--color-primary-950)' }}>
                      {order.orderCode}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {formatDateTime(order.createdAt)}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
                      <User size={15} color="var(--color-primary-800)" />
                      <span>{order.customerName}</span> • <span style={{ color: 'var(--color-text-subtle)' }}>{order.customerPhone}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {order.items.length} productos • Importe: <strong>{formatMoney(order.totalCents)}</strong> • {order.deliveryType === 'pickup' ? 'Recojo en local' : 'Envío a domicilio'}
                    </span>
                  </div>

                  <Link to={ROUTES.MERCHANT_ORDER_DETAIL(order.id)}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                      Gestionar Pedido
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '16px', padding: '64px 20px', textAlign: 'center' }}>
            <Package size={36} color="var(--color-text-subtle)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 6px' }}>
              No hay pedidos en este estado
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Los nuevos pedidos aparecerán aquí para que puedas coordinar su preparación y despacho.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
