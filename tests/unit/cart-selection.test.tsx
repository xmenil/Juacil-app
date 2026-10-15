import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { CartPage } from '@/pages/cart/CartPage';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { OrderTrackingLookup } from '@/features/orders/OrderTrackingLookup';
import { LocalStoreRepository } from '@/shared/lib/storage';

beforeEach(() => { localStorage.clear(); LocalStoreRepository.resetToInitial(); });
afterEach(cleanup);

describe('Compra de productos seleccionados', () => {
  it('compra un producto y conserva otro de la misma tienda con su stock intacto', async () => {
    const products = LocalStoreRepository.getProducts().filter(p => p.status === 'published' && p.stock >= 2);
    const first = products[0];
    const second = products.find(p => p.businessId === first.businessId && p.id !== first.id)!;
    const initialIds = new Set(LocalStoreRepository.getOrders().map(order => order.id));
    localStorage.setItem('juacil_cart_store_v1.0', JSON.stringify({ items: [first, second].map(product => ({ productId: product.id, product, quantity: 1, unitPriceCents: product.priceCents, subtotalCents: product.priceCents })) }));
    render(<MemoryRouter initialEntries={['/carrito']}><AppProviders><Routes><Route path="/carrito" element={<CartPage />} /><Route path="/pedido/confirmar" element={<CheckoutPage />} /></Routes></AppProviders></MemoryRouter>);
    const user = userEvent.setup();
    expect(screen.getAllByRole('checkbox', { name: `Comprar ${first.name}` })).toHaveLength(1);
    await user.click(screen.getByRole('checkbox', { name: `Comprar ${second.name}` }));
    await user.click(screen.getByRole('button', { name: 'Continuar con mi pedido' }));
    const summary = screen.getByRole('complementary', { name: 'Resumen del pedido' });
    expect(within(summary).getByText(first.name)).toBeInTheDocument();
    expect(within(summary).queryByText(second.name)).not.toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Recojo en tienda/ }));
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' }));
    await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
    const created = LocalStoreRepository.getOrders().filter(order => !initialIds.has(order.id));
    expect(created).toHaveLength(1);
    expect(created[0].items.map(item => item.productId)).toEqual([first.id]);
    expect(LocalStoreRepository.getProductById(second.id)?.stock).toBe(second.stock);
    await waitFor(() => expect(JSON.parse(localStorage.getItem('juacil_cart_store_v1.0')!).items.map((item: { productId: string }) => item.productId)).toEqual([second.id]));
  });

  it('consulta códigos sin mostrar pedidos de otro comprador y distingue recojo', async () => {
    const own = LocalStoreRepository.getOrdersByCustomer('user-client-01').find(order => order.deliveryType === 'delivery')!;
    const other = LocalStoreRepository.getOrdersByCustomer('user-client-02')[0] || { orderCode: 'JUA-9999' };
    render(<MemoryRouter><OrderTrackingLookup customerId="user-client-01" /></MemoryRouter>);
    const user = userEvent.setup();
    const input = screen.getByRole('textbox', { name: 'Código de pedido' });
    await user.type(input, ` ${own.orderCode.toLowerCase()} `);
    await user.click(screen.getByRole('button', { name: 'Consultar seguimiento' }));
    expect(screen.getByRole('region', { name: `Seguimiento del envío ${own.orderCode}` })).toBeInTheDocument();
    await user.clear(input); await user.type(input, other.orderCode);
    await user.click(screen.getByRole('button', { name: 'Consultar seguimiento' }));
    expect(screen.getByRole('status')).toHaveTextContent('No encontramos ese código');
    expect(screen.queryByRole('region', { name: /Seguimiento del envío/ })).not.toBeInTheDocument();
  });
});
