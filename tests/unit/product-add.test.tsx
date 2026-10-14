import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { useCart } from '@/app/providers/CartProvider';
import { ProductDetailPage } from '@/pages/product-detail/ProductDetailPage';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';
import { LocalStoreRepository } from '@/shared/lib/storage';

function Observer() {
  const { itemCount } = useCart();
  const location = useLocation();
  return <><output aria-label="Ruta actual">{location.pathname}</output><output aria-label="Unidades en carrito">{itemCount}</output></>;
}

function mount() {
  const product = LocalStoreRepository.getProducts().find(item => item.stock >= 3)!;
  render(<MemoryRouter initialEntries={[`/productos/${product.id}`]}><AppProviders>
    <Observer />
    <Routes>
      <Route path="/productos/:id" element={<ProductDetailPage />} />
      <Route path="/carrito" element={<h1>Tu carrito</h1>} />
      <Route path="/pedido/confirmar" element={<h1>Confirmar pedido</h1>} />
    </Routes>
    <ReplaceCartModal />
  </AppProviders></MemoryRouter>);
  return { product, user: userEvent.setup() };
}

describe('Agregar desde el detalle de producto', () => {
  beforeEach(() => {
    localStorage.clear();
    LocalStoreRepository.resetToInitial();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });
  afterEach(() => { cleanup(); vi.restoreAllMocks(); });

  it('conserva el detalle y la cantidad, anuncia el agregado y permite visitar el carrito', async () => {
    const { product, user } = mount();
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
    await user.click(screen.getByRole('button', { name: 'Agregar al carrito' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(`/productos/${product.id}`);
    expect(screen.getByLabelText('Unidades en carrito')).toHaveTextContent('2');
    expect(screen.getByText(`2 unidades agregadas al carrito: ${product.name}.`)).toHaveAttribute('role', 'status');
    expect(screen.getByRole('button', { name: 'Agregado' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const cart = JSON.parse(localStorage.getItem('juacil_cart_store_v1.0')!);
    expect(cart.items[0].quantity).toBe(2);
    expect(LocalStoreRepository.getProductById(product.id)?.stock).toBe(product.stock);
    await user.click(screen.getByRole('link', { name: 'Ver carrito' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/carrito');
  });

  it('Comprar ahora sigue llevando al checkout', async () => {
    const { user } = mount();
    await user.click(screen.getByRole('button', { name: 'Comprar Ahora' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/pedido/confirmar');
    expect(screen.getByLabelText('Unidades en carrito')).toHaveTextContent('1');
  });
});
