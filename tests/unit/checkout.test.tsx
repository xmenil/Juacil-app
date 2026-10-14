import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { CheckoutPage } from '@/pages/checkout/CheckoutPage';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import type { Cart } from '@/entities/cart/model/types';
import type { Product } from '@/entities/product/model/types';

let product: Product;
let initialOrders: number;
let initialOrderIds: Set<string>;
const cartKey = 'juacil_cart_store_v1.0';
function seedCart() {
  const business = LocalStoreRepository.getBusinessById(product.businessId)!;
  const cart: Cart = { businessId: business.id, businessName: business.name, totalCents: product.priceCents * 2, itemCount: 2,
    items: [{ productId: product.id, product, quantity: 2, unitPriceCents: product.priceCents, subtotalCents: product.priceCents * 2 }] };
  localStorage.setItem(cartKey, JSON.stringify(cart));
}
function Controls() {
  const { logout } = useSession(); const { toggleSimulatedOffline } = useConnectivity(); const location = useLocation();
  return <><button onClick={logout}>Cerrar perfil de prueba</button><button onClick={toggleSimulatedOffline}>Cambiar conexión</button><output aria-label="Ruta actual">{location.pathname}{location.search}</output></>;
}
function mount() {
  render(<MemoryRouter initialEntries={['/pedido/confirmar']}><AppProviders><Controls /><Routes>
    <Route path="/pedido/confirmar" element={<CheckoutPage />} />
    <Route path="/catalogo" element={<h1>Catálogo</h1>} />
    <Route path="/carrito" element={<h1>Revisión del carrito</h1>} />
    <Route path="/acceso" element={<h1>Acceso demo</h1>} />
    <Route path="/mis-pedidos/:id" element={<h1>Detalle del pedido</h1>} />
  </Routes></AppProviders></MemoryRouter>);
  return userEvent.setup();
}
async function choosePickup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('radio', { name: /Recojo en tienda/ }));
}
function createdOrder() {
  const order = LocalStoreRepository.getOrders().find(order => !initialOrderIds.has(order.id));
  expect(order).toBeDefined();
  return order!;
}

describe('Registro de pedidos desde checkout', () => {
  beforeEach(() => { cleanup(); localStorage.clear(); LocalStoreRepository.resetToInitial(); product = LocalStoreRepository.getProducts().find(product => product.stock >= 5)!; initialOrders = LocalStoreRepository.getOrders().length; initialOrderIds = new Set(LocalStoreRepository.getOrders().map(order => order.id)); });

  it('explica el carrito vacío y permite regresar al catálogo', async () => {
    const user = mount(); expect(screen.getByRole('heading', { name: 'No hay productos para confirmar' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Explorar productos' }));
    expect(screen.getByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
  });

  it('conserva el carrito y el retorno al checkout cuando falta sesión', async () => {
    seedCart(); const user = mount(); await user.click(screen.getByRole('button', { name: 'Cerrar perfil de prueba' }));
    await user.click(screen.getByRole('link', { name: 'Ir al acceso' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/acceso?redirect=%2Fpedido%2Fconfirmar');
    expect(JSON.parse(localStorage.getItem(cartKey)!).itemCount).toBe(2);
  });

  it('requiere un cliente y rellena el formulario al elegir el perfil demo', async () => {
    seedCart(); localStorage.setItem('juacil_active_user_id_v1.0', 'user-admin-01'); const user = mount();
    expect(screen.getByRole('heading', { name: 'Usa un perfil de cliente para comprar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Probar como Lucía (cliente demo)' }));
    expect(screen.getByLabelText(/Nombre y apellidos/)).toHaveValue(LocalStoreRepository.getUserById('user-client-01')!.name);
    expect(screen.getByLabelText(/Celular para coordinar/)).toHaveValue(LocalStoreRepository.getUserById('user-client-01')!.phone);
  });

  it('exige dirección para entrega y conserva los datos cuando hay un error', async () => {
    seedCart(); const user = mount(); await user.clear(screen.getByLabelText(/Dirección y referencia/));
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Indica la dirección');
    expect(screen.getByLabelText(/Nombre y apellidos/)).not.toHaveValue('');
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders);
    expect(LocalStoreRepository.getProductById(product.id)?.stock).toBe(product.stock);
  });

  it('registra un recojo sin dirección, reserva una vez y prepara el enlace de coordinación', async () => {
    seedCart(); const user = mount(); await choosePickup(user);
    expect(screen.queryByLabelText(/Dirección y referencia/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' }));
    expect(await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' })).toBeInTheDocument();
    const order = createdOrder();
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders + 1);
    expect(LocalStoreRepository.getProductById(product.id)?.stock).toBe(product.stock - 2);
    expect(JSON.parse(localStorage.getItem(cartKey)!).items).toEqual([]);
    expect(order.deliveryAddress).toBeUndefined(); expect(order.status).toBe('pendiente');
    const link = screen.getByRole('link', { name: 'Coordinar por WhatsApp' });
    expect(link).toHaveAttribute('href', expect.stringContaining('https://wa.me/'));
    expect(decodeURIComponent(link.getAttribute('href')!)).toContain(order.orderCode);
    expect(decodeURIComponent(link.getAttribute('href')!)).toContain(product.name);
    expect(screen.getByText(order.orderCode)).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ver detalle del pedido' }));
    expect(screen.getByRole('heading', { name: 'Detalle del pedido' })).toBeInTheDocument();
  });

  it('registra una dirección de entrega y normaliza el celular con espacios', async () => {
    seedCart(); const user = mount(); await user.clear(screen.getByLabelText(/Celular para coordinar/));
    await user.type(screen.getByLabelText(/Celular para coordinar/), '987 654 321');
    await user.clear(screen.getByLabelText(/Dirección y referencia/)); await user.type(screen.getByLabelText(/Dirección y referencia/), 'Jr. Lima 123, frente al parque');
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' }));
    await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
    const order = createdOrder();
    expect(order.customerPhone).toBe('987654321'); expect(order.deliveryAddress).toBe('Jr. Lima 123, frente al parque');
  });

  it('impide pedidos duplicados aunque se dispare dos veces el submit', async () => {
    seedCart(); const user = mount(); await choosePickup(user);
    const form = screen.getByRole('form', { name: 'Datos del pedido' });
    fireEvent.submit(form); fireEvent.submit(form);
    await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders + 1);
    expect(LocalStoreRepository.getProductById(product.id)?.stock).toBe(product.stock - 2);
  });

  it('bloquea offline y conserva el formulario al recuperar conexión', async () => {
    seedCart(); const user = mount(); await choosePickup(user);
    await user.type(screen.getByLabelText('Notas para la tienda (opcional)'), 'Llamar antes de recoger.');
    await user.click(screen.getByRole('button', { name: 'Cambiar conexión' }));
    expect(screen.getByRole('button', { name: 'Registrar mi pedido' })).toBeDisabled();
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders);
    await user.click(screen.getByRole('button', { name: 'Cambiar conexión' }));
    expect(screen.getByLabelText('Notas para la tienda (opcional)')).toHaveValue('Llamar antes de recoger.');
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' })); await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
  });

  it('revalida stock durante la espera y no pierde datos ni crea un pedido inválido', async () => {
    seedCart(); const user = mount(); await choosePickup(user);
    await user.type(screen.getByLabelText('Notas para la tienda (opcional)'), 'Coordinar por la tarde.');
    fireEvent.submit(screen.getByRole('form', { name: 'Datos del pedido' }));
    LocalStoreRepository.saveProduct({ ...product, stock: 1 });
    await waitFor(() => expect(screen.getAllByText(/Solo quedan 1 unidades/).length).toBeGreaterThan(0));
    expect(screen.getByLabelText('Notas para la tienda (opcional)')).toHaveValue('Coordinar por la tarde.');
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders);
    expect(JSON.parse(localStorage.getItem(cartKey)!).itemCount).toBe(2);
  });

  it('muestra el precio vigente antes de confirmar cuando cambió desde el carrito', async () => {
    seedCart(); LocalStoreRepository.saveProduct({ ...product, priceCents: product.priceCents + 500 });
    const user = mount(); await choosePickup(user);
    expect(screen.getByText(/Hay precios actualizados/)).toBeInTheDocument();
    expect(within(screen.getByRole('complementary', { name: 'Resumen del pedido' })).getAllByText(formatMoney((product.priceCents + 500) * 2)).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' })); await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
    expect(createdOrder().totalCents).toBe((product.priceCents + 500) * 2);
  });

  it('requiere revisar nuevamente si cambia el precio después de pulsar confirmar', async () => {
    seedCart(); const user = mount(); await choosePickup(user);
    fireEvent.submit(screen.getByRole('form', { name: 'Datos del pedido' }));
    LocalStoreRepository.saveProduct({ ...product, priceCents: product.priceCents + 100 });
    expect(await screen.findByText(/El carrito o los precios cambiaron/)).toBeInTheDocument();
    expect(LocalStoreRepository.getOrders()).toHaveLength(initialOrders);
    await user.click(screen.getByRole('button', { name: 'Registrar mi pedido' })); await screen.findByRole('heading', { name: 'Tu pedido quedó registrado' });
    expect(createdOrder().totalCents).toBe((product.priceCents + 100) * 2);
  });

  it('bloquea una tienda suspendida y ofrece volver al carrito', () => {
    seedCart(); LocalStoreRepository.updateBusinessStatus(product.businessId, 'suspended'); mount();
    expect(screen.getByRole('alert')).toHaveTextContent('no está activa');
    expect(screen.getByRole('button', { name: 'Registrar mi pedido' })).toBeDisabled();
  });
});
