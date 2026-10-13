import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { Button } from '@/shared/ui/Button';
import { Package, Store, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';

export const CustomerOrdersPage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Inicia sesión para ver tus pedidos</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          Selecciona un perfil demo de cliente en la barra superior o inicia sesión.
        </p>
        <Button variant="primary" onClick={() => navigate(ROUTES.LOGIN)}>
          Iniciar Sesión
        </Button>
      </div>
    );
  }

  const orders = LocalStoreRepository.getOrdersByCustomer(currentUser.id);

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
            Mis Pedidos
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
            Historial de compras realizadas por <strong>{currentUser.name}</strong>.
          </p>
        </div>

        {orders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '18px',
                        color: 'var(--color-primary-900)',
                      }}
                    >
                      {order.orderCode}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <span style={{ fontSize: '13px', color: 'var(--color-text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
                      <Store size={15} color="var(--color-primary-700)" />
                      <span>{order.businessName}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      {order.items.length} {order.items.length === 1 ? 'artículo' : 'artículos'} • Total: <strong>{formatMoney(order.totalCents)}</strong>
                    </span>
                  </div>

                  <Link to={ROUTES.CUSTOMER_ORDER_DETAIL(order.id)}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                      Ver detalle de la orden
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px dashed var(--color-border)',
              borderRadius: '16px',
              padding: '64px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <Package size={40} color="var(--color-text-subtle)" />
            <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Aún no tienes pedidos registrados</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', maxWidth: '420px' }}>
              Cuando realices compras en JUÁCIL, podrás seguir el estado de preparación y coordinar
              con las tiendas desde aquí.
            </p>
            <Button variant="primary" onClick={() => navigate(ROUTES.CATALOG)} leftIcon={<ShoppingBag size={16} />}>
              Explorar Catálogo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
