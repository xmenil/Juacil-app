import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Package } from 'lucide-react';
import { Business } from '@/entities/business/model/types';
import { Product } from '@/entities/product/model/types';
import { Order } from '@/entities/order/model/types';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { ROUTES } from '@/shared/config/routes';
import { Badge } from '@/shared/ui/Badge';
import buttonStyles from '@/shared/ui/Button.module.css';
import styles from './MerchantSummary.module.css';

interface MerchantSummaryProps {
  business: Business;
  products: Product[];
  orders: Order[];
}

export const MerchantSummary: React.FC<MerchantSummaryProps> = ({ business, products, orders }) => {
  const pendingOrders = orders.filter(order => order.status === 'pendiente');
  const confirmedOrders = orders.filter(order => order.status === 'confirmado');
  const deliveredOrders = orders.filter(order => order.status === 'entregado');
  const lowStockProducts = products.filter(product => product.stock > 0 && product.stock <= 4);
  const outOfStockProducts = products.filter(product => product.stock === 0);
  const totalSalesCents = orders.filter(order => order.status !== 'cancelado')
    .reduce((total, order) => total + order.totalCents, 0);
  const stockToReview = [...outOfStockProducts, ...lowStockProducts];
  const primaryClass = `${buttonStyles.button} ${buttonStyles.md} ${buttonStyles.accent} ${styles.primaryLink}`;
  const ordersLink = `${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos`;
  const productsLink = `${ROUTES.MERCHANT_DASHBOARD}?tab=productos`;

  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Tu negocio en JUÁCIL</p>
          <h1>Resumen de tu tienda</h1>
          <p>Revisa tus pedidos y la disponibilidad de tus productos.</p>
        </header>

        <section className={styles.attention} aria-labelledby="attention-title">
          <div className={styles.attentionText}>
            <span className={styles.sectionLabel}>Pedidos por atender</span>
            <h2 id="attention-title">
              {pendingOrders.length > 0
                ? `Tienes ${pendingOrders.length} ${pendingOrders.length === 1 ? 'pedido por confirmar' : 'pedidos por confirmar'}`
                : 'No tienes pedidos pendientes de confirmación'}
            </h2>
            <p>{pendingOrders.length > 0
              ? 'Revisa lo que pidió cada cliente y coordina el siguiente paso.'
              : 'Puedes revisar los pedidos confirmados, preparados y entregados.'}</p>
          </div>
          <Link to={pendingOrders.length > 0 ? `${ordersLink}&filtro=pendiente` : `${ordersLink}&filtro=all`} className={primaryClass}>
            {pendingOrders.length > 0 ? 'Ver pedidos pendientes' : 'Ver pedidos'}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.section} aria-labelledby="stock-title">
          <div className={styles.sectionHeader}>
            <div><h2 id="stock-title">Stock por revisar</h2><p>Productos agotados o con 4 unidades o menos.</p></div>
            {products.length > 0 && <Link to={`${productsLink}&filtro=all`} className={styles.textLink}>Ver productos <ArrowRight size={16} aria-hidden="true" /></Link>}
          </div>
          {stockToReview.length > 0 ? (
            <ul className={styles.stockList}>
              {stockToReview.slice(0, 4).map(product => (
                <li key={product.id} className={styles.stockRow}>
                  <Package size={18} className={styles.productIcon} aria-hidden="true" />
                  <div className={styles.productInfo}><strong>{product.name}</strong><span>{product.status === 'published' ? 'Publicado' : 'Borrador'}</span></div>
                  <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>{product.stock === 0 ? 'Agotado' : `${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}`}</Badge>
                  <Link to={ROUTES.MERCHANT_PRODUCT_EDIT(product.id)} className={styles.textLink}>Editar<span className="sr-only"> {product.name}</span></Link>
                </li>
              ))}
              {stockToReview.length > 4 && <li className={styles.remaining}>Hay {stockToReview.length - 4} productos más con stock por revisar. <Link to={`${productsLink}&filtro=all`} className={styles.textLink}>Ver catálogo</Link></li>}
            </ul>
          ) : (
            <div className={styles.emptyInline}>
              {products.length > 0 ? <CheckCircle2 size={20} aria-hidden="true" /> : <Package size={20} aria-hidden="true" />}
              <div><strong>{products.length > 0 ? 'No hay productos con stock bajo o agotado.' : 'Todavía no tienes productos registrados.'}</strong>
                {products.length === 0 && <Link to={ROUTES.MERCHANT_PRODUCT_NEW} className={styles.textLink}>Agregar producto <ArrowRight size={16} aria-hidden="true" /></Link>}
              </div>
            </div>
          )}
        </section>

        <section className={styles.overview} aria-labelledby="overview-title">
          <div className={styles.sectionHeader}>
            <div><h2 id="overview-title">Resumen de pedidos</h2><p>Acumulado de los pedidos registrados en esta demo.</p></div>
          </div>
          <dl className={styles.stats}>
            <div className={styles.amountStat}><dt>Importe de pedidos no cancelados</dt><dd>{formatMoney(totalSalesCents)}</dd><span>Incluye pedidos pendientes, confirmados, preparados y entregados.</span></div>
            <div><dt>Pedidos registrados</dt><dd>{orders.length}</dd></div>
            <div><dt>Confirmados</dt><dd>{confirmedOrders.length}</dd></div>
            <div><dt>Entregados</dt><dd>{deliveredOrders.length}</dd></div>
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="recent-title">
          <div className={styles.sectionHeader}>
            <div><h2 id="recent-title">Pedidos recientes</h2><p>Los últimos pedidos de {business.name}.</p></div>
            {orders.length > 0 && <Link to={`${ordersLink}&filtro=all`} className={styles.textLink}>Ver todos <ArrowRight size={16} aria-hidden="true" /></Link>}
          </div>
          {orders.length > 0 ? (
            <ul className={styles.orderList}>
              {orders.slice(0, 5).map(order => (
                <li key={order.id} className={styles.orderRow}>
                  <div className={styles.orderIdentity}><strong>{order.orderCode}</strong><span>{order.customerName}</span><time dateTime={order.createdAt}>{formatDateTime(order.createdAt)}</time></div>
                  <OrderStatusBadge status={order.status} />
                  <strong className={styles.orderAmount}>{formatMoney(order.totalCents)}</strong>
                  <Link to={`${ordersLink}&filtro=all&pedido=${encodeURIComponent(order.id)}`} className={styles.textLink}>Ver pedido<span className="sr-only"> {order.orderCode}</span><ArrowRight size={16} aria-hidden="true" /></Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyInline}><ClipboardList size={24} aria-hidden="true" /><div><strong>Todavía no has recibido pedidos.</strong><p>Cuando un cliente haga un pedido, lo verás aquí.</p></div></div>
          )}
        </section>
      </div>
    </div>
  );
};
