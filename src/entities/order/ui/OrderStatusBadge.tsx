import React from 'react';
import { OrderStatus } from '../model/types';
import { ORDER_STATUS_LABELS } from '../model/orderStateMachine';
import { Badge } from '@/shared/ui/Badge';
import { Clock, CheckCircle2, Package, Truck, XCircle } from 'lucide-react';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, showIcon = true }) => {
  const label = ORDER_STATUS_LABELS[status] || status;

  switch (status) {
    case 'pendiente':
      return (
        <Badge variant="warning" icon={showIcon ? <Clock size={12} /> : undefined}>
          {label}
        </Badge>
      );
    case 'confirmado':
      return (
        <Badge variant="info" icon={showIcon ? <CheckCircle2 size={12} /> : undefined}>
          {label}
        </Badge>
      );
    case 'preparado':
      return (
        <Badge variant="lime" icon={showIcon ? <Package size={12} /> : undefined}>
          {label}
        </Badge>
      );
    case 'entregado':
      return (
        <Badge variant="success" icon={showIcon ? <Truck size={12} /> : undefined}>
          {label}
        </Badge>
      );
    case 'cancelado':
      return (
        <Badge variant="danger" icon={showIcon ? <XCircle size={12} /> : undefined}>
          {label}
        </Badge>
      );
    default:
      return <Badge variant="neutral">{label}</Badge>;
  }
};
