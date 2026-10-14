import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { OrderList } from '@/features/order-management/OrderList';
import { getOrderFilter } from '@/features/order-management/orderFilters';

export const MerchantOrdersPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = getOrderFilter(searchParams.get('filtro'));

  if (!isMerchant || !businessId) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  const allOrders = LocalStoreRepository.getOrdersByBusiness(businessId);
  const filteredOrders = allOrders.filter(order => statusFilter === 'all' || order.status === statusFilter);
  const changeFilter = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filtro', value);
    setSearchParams(nextParams);
  };

  return <OrderList orders={allOrders} filteredOrders={filteredOrders} filter={statusFilter}
    onFilterChange={changeFilter}
    detailHref={order => `${ROUTES.MERCHANT_ORDER_DETAIL(order.id)}?filtro=${statusFilter}`} />;
};
