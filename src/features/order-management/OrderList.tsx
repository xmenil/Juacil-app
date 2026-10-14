import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { Order } from '@/entities/order/model/types';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import buttonStyles from '@/shared/ui/Button.module.css';
import { ORDER_FILTERS } from './orderFilters';
import styles from './Orders.module.css';

interface OrderListProps {
  orders: Order[];
  filteredOrders: Order[];
  filter: string;
  onFilterChange: (value: string) => void;
  detailHref: (order: Order) => string;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, filteredOrders, filter, onFilterChange, detailHref }) => (
  <div className={styles.page}>
    <div className="container">
      <header className={styles.pageHeader}>
        <p className={styles.eyebrow}>Pedidos de tu tienda</p>
        <h1>Pedidos</h1>
        <p>Revisa cada pedido y coordina con tu cliente.</p>
      </header>
      <div className={styles.filters} role="group" aria-label="Filtrar pedidos por estado">
        {ORDER_FILTERS.map(({ value, label }) => (
          <Button key={value} variant={filter === value ? 'primary' : 'outline'}
            className={styles.filterButton} aria-pressed={filter === value} onClick={() => onFilterChange(value)}>
            {label} ({value === 'all' ? orders.length : orders.filter(order => order.status === value).length})
          </Button>
        ))}
      </div>
      <p className={styles.resultCount} role="status">Mostrando {filteredOrders.length} de {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}.</p>
      {filteredOrders.length > 0 ? (
        <div className={styles.listSurface}>
          <div className={styles.listHeader} aria-hidden="true"><span>Pedido</span><span>Cliente y entrega</span><span>Estado</span><span>Importe</span><span>Detalle</span></div>
          <ul className={styles.orderList} aria-label="Pedidos recibidos">
            {filteredOrders.map(order => (
              <li key={order.id} className={styles.orderRow}>
                <div className={styles.orderIdentity}><strong>{order.orderCode}</strong><time dateTime={order.createdAt}>{formatDateTime(order.createdAt)}</time></div>
                <div className={styles.customer}><strong>{order.customerName}</strong><span>{order.customerPhone}</span><span>{order.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Entrega a domicilio'}</span></div>
                <div className={styles.orderStatus}><OrderStatusBadge status={order.status} /></div>
                <div className={styles.amount}><span className={styles.mobileLabel}>Importe</span><strong>{formatMoney(order.totalCents)}</strong></div>
                <Link to={detailHref(order)} className={`${buttonStyles.button} ${buttonStyles.md} ${buttonStyles.outline} ${styles.detailLink}`}>
                  Ver pedido<span className="sr-only"> {order.orderCode}</span><ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <section className={styles.emptyState} aria-labelledby="orders-empty-title">
          <ClipboardList size={28} aria-hidden="true" />
          <h2 id="orders-empty-title">{orders.length === 0 ? 'Todavía no has recibido pedidos' : 'No hay pedidos con este estado'}</h2>
          <p>{orders.length === 0 ? 'Cuando un cliente haga un pedido a tu tienda, lo verás aquí.' : 'Prueba otro estado o revisa todos los pedidos de tu tienda.'}</p>
          {orders.length === 0
            ? <Link to={ROUTES.MERCHANT_DASHBOARD + '?tab=reportes'} className={styles.textLink}>Volver al resumen <ArrowRight size={16} aria-hidden="true" /></Link>
            : <Button variant="outline" onClick={() => onFilterChange('all')}>Ver todos</Button>}
        </section>
      )}
    </div>
  </div>
);
