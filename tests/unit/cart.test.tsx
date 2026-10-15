import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { CartPage } from '@/pages/cart/CartPage';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import type { Product } from '@/entities/product/model/types';
import type { Cart } from '@/entities/cart/model/types';

const cartKey = 'juacil_cart_store_v1.0';
let product: Product;
function seedCart(quantity = 2) {
  const business = LocalStoreRepository.getBusinessById(product.businessId)!;
  const cart: Cart = { businessId: business.id, businessName: business.name,
    items: [{ productId: product.id, product, quantity, unitPriceCents: product.priceCents, subtotalCents: product.priceCents * quantity }],
    totalCents: product.priceCents * quantity, itemCount: quantity };
  localStorage.setItem(cartKey, JSON.stringify(cart));
}
function Controls() {
  const { addItem } = useCart();
  const { logout } = useSession();
  const { toggleSimulatedOffline } = useConnectivity();
  const location = useLocation();
  return <><button onClick={logout}>Salir del perfil</button><button onClick={toggleSimulatedOffline}>Simular offline</button>
    <button onClick={() => addItem(LocalStoreRepository.getProducts().find(p => p.businessId !== product.businessId && p.stock > 0)!)}>Agregar otra tienda</button>
    <output aria-label="Ruta actual">{location.pathname}{location.search}</output></>;
}
function mount(path = '/carrito') {
  render(<MemoryRouter initialEntries={[path]}><AppProviders><Controls /><Routes>
    <Route path="/carrito" element={<CartPage />} />
    <Route path="/pedido/confirmar" element={<h1>Confirmar pedido</h1>} />
    <Route path="/acceso" element={<h1>Acceso demo</h1>} />
    <Route path="/catalogo" element={<h1>Catálogo</h1>} />
    <Route path="/productos/:id" element={<h1>Detalle de producto</h1>} />
    <Route path="/tiendas/:id" element={<h1>Detalle de tienda</h1>} />
  </Routes><ReplaceCartModal /></AppProviders></MemoryRouter>);
  return userEvent.setup();
}
function storedCart(): Cart { return JSON.parse(localStorage.getItem(cartKey)!); }

describe('Recorridos del carrito', () => {
  beforeEach(() => { cleanup(); localStorage.clear(); LocalStoreRepository.resetToInitial(); product = LocalStoreRepository.getProducts().find(p => p.stock >= 5)!; });

  it('muestra vacío y permite explorar el catálogo', async () => {
    const user = mount();
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explorar productos' }));
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('actualiza cantidades, totales y persistencia sin reservar inventario', async () => {
    seedCart(); const user = mount();
    await user.click(screen.getByRole('button', { name: `Aumentar cantidad de ${product.name}` }));
    expect(storedCart().items[0].quantity).toBe(3);
    expect(storedCart().totalCents).toBe(product.priceCents * 3);
    expect(LocalStoreRepository.getProductById(product.id)?.stock).toBe(product.stock);
    await user.click(screen.getByRole('button', { name: `Disminuir cantidad de ${product.name}` }));
    expect(storedCart().itemCount).toBe(2);
    expect(screen.getAllByText(formatMoney(product.priceCents * 2)).length).toBeGreaterThan(0);
  });

  it('revisa stock vigente y permite ajustar una cantidad que dejó de estar disponible', async () => {
    seedCart(4); LocalStoreRepository.saveProduct({ ...product, stock: 2 });
    const user = mount();
    expect(screen.getByRole('button', { name: 'Continuar con mi pedido' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Ajustar a 2 unidades disponibles' }));
    expect(storedCart().itemCount).toBe(2);
    expect(screen.getByRole('button', { name: 'Continuar con mi pedido' })).toBeEnabled();
    expect(screen.getByRole('button', { name: `Aumentar cantidad de ${product.name}` })).toBeDisabled();
  });

  it('muestra el error cuando cambia el stock después de renderizar', async () => {
    seedCart(); const user = mount();
    LocalStoreRepository.saveProduct({ ...product, stock: 2 });
    await user.click(screen.getByRole('button', { name: `Aumentar cantidad de ${product.name}` }));
    expect(screen.getByRole('alert')).toHaveTextContent('Solo quedan 2 unidades');
    expect(storedCart().itemCount).toBe(2);
  });

  it('bloquea productos eliminados y permite retirarlos', async () => {
    seedCart(); LocalStoreRepository.deleteProduct(product.id); const user = mount();
    expect(screen.getByRole('button', { name: 'Continuar con mi pedido' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: `Eliminar ${product.name}` }));
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument();
    expect(storedCart().items).toEqual([]);
  });

  it('requiere confirmar antes de vaciar y permite conservar la selección', async () => {
    seedCart(); const user = mount(); await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(storedCart().items).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Conservar productos' }));
    expect(storedCart().items).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Vaciar carrito' }));
    expect(storedCart().items).toHaveLength(0);
  });

  it('conserva carrito y retorno al checkout cuando no hay sesión', async () => {
    seedCart(); const user = mount(); await user.click(screen.getByRole('button', { name: 'Salir del perfil' }));
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión para continuar' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/acceso?redirect=%2Fpedido%2Fconfirmar');
    expect(storedCart().items).toHaveLength(1);
  });

  it('explica offline y permite revisar los datos antes del checkout', async () => {
    seedCart(); const user = mount(); await user.click(screen.getByRole('button', { name: 'Simular offline' }));
    expect(screen.getByText(/para confirmar el pedido necesitarás conexión/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuar con mi pedido' }));
    expect(screen.getByRole('heading', { name: 'Confirmar pedido' })).toBeInTheDocument();
  });

  it('la confirmación de vaciado gestiona foco y Escape sin perder el carrito', async () => {
    seedCart(); const user = mount(); const trigger = screen.getByRole('button', { name: 'Vaciar carrito' });
    await user.click(trigger);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('button', { name: 'Cerrar ventana emergente' })).toHaveFocus();
    within(dialog).getByRole('button', { name: 'Vaciar carrito' }).focus();
    await user.tab(); expect(within(dialog).getByRole('button', { name: 'Cerrar ventana emergente' })).toHaveFocus();
    await user.keyboard('{Escape}'); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus(); expect(storedCart().items).toHaveLength(1);
  });

  it('vacía solo después de confirmar y permite explorar desde la página vacía', async () => {
    seedCart(); const user = mount(); await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(storedCart().items).toHaveLength(1);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Vaciar carrito' }));
    expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Explorar productos' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('permite agregar productos de múltiples tiendas al mismo carrito', async () => {
    seedCart(); const user = mount();
    await user.click(screen.getByRole('button', { name: 'Agregar otra tienda' }));
    expect(storedCart().items.length).toBeGreaterThan(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('restaura la selección al volver a montar el prototipo', async () => {
    seedCart(); mount(); cleanup(); mount();
    await waitFor(() => expect(screen.getByText(product.name)).toBeInTheDocument());
    expect(storedCart().itemCount).toBe(2);
  });
});
