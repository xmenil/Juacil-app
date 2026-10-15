import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OrderDeliveryTracking } from '@/entities/order/ui/OrderDeliveryTracking';
import { MOCK_ORDERS } from '@/entities/order/model/mockOrders';

afterEach(cleanup);

describe('Seguimiento de compras con envío', () => {
  it('no muestra seguimiento para recojo', () => {
    const { container } = render(<OrderDeliveryTracking order={{ ...MOCK_ORDERS[0], deliveryType: 'pickup' }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra la dirección y el estado actual sin adelantar la entrega', () => {
    render(<OrderDeliveryTracking order={{ ...MOCK_ORDERS[0], status: 'preparado' }} />);
    const steps = screen.getAllByRole('listitem');
    expect(steps[2]).toHaveAttribute('aria-current', 'step');
    expect(steps[3]).toHaveTextContent('Pendiente');
    expect(screen.getByText(MOCK_ORDERS[0].deliveryAddress!, { exact: false })).toBeInTheDocument();
    expect(document.querySelectorAll('time')).toHaveLength(MOCK_ORDERS[0].statusHistory.length);
  });

  it('detiene el seguimiento al cancelar', () => {
    render(<OrderDeliveryTracking order={{ ...MOCK_ORDERS[0], status: 'cancelado' }} />);
    expect(screen.getByText('Pedido cancelado. El envío no continuará.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('marca entregado únicamente cuando la tienda registró ese estado', () => {
    render(<OrderDeliveryTracking order={{ ...MOCK_ORDERS[0], status: 'entregado' }} />);
    expect(screen.getAllByRole('listitem')[3]).toHaveAttribute('aria-current', 'step');
    expect(screen.queryByText('Pendiente')).not.toBeInTheDocument();
  });
});
