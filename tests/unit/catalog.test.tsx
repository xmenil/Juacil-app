import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AppProviders } from '@/app/providers/AppProviders';
import { CatalogPage } from '@/pages/catalog/CatalogPage';
import { getPublicCatalog, readPriceRange } from '@/pages/catalog/catalogModel';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { useCart } from '@/app/providers/CartProvider';
import { ReplaceCartModal } from '@/features/cart/ReplaceCartModal';

function RouteObserver() {
  const location = useLocation(); const navigate = useNavigate();
  const { itemCount } = useCart();
  return <><output aria-label="Ruta actual">{location.pathname}{location.search}</output><output aria-label="Unidades en carrito">{itemCount}</output><button onClick={() => navigate(-1)}>Volver en historial</button></>;
}
function mount(path = '/catalogo') {
  render(<MemoryRouter initialEntries={[path]}><AppProviders><RouteObserver /><Routes>
    <Route path="/catalogo" element={<CatalogPage />} />
    <Route path="/productos/:id" element={<h1>Detalle de producto</h1>} />
    <Route path="/tiendas/:id" element={<h1>Detalle de tienda</h1>} />
    <Route path="/carrito" element={<h1>Tu carrito</h1>} />
  </Routes><ReplaceCartModal /></AppProviders></MemoryRouter>);
  return userEvent.setup();
}
function publicData() { return getPublicCatalog(LocalStoreRepository.getProducts(true), LocalStoreRepository.getBusinesses()); }
function resultCards() { return within(screen.getByRole('region', { name: 'Resultados del catálogo' })).queryAllByRole('article'); }

describe('Catálogo de JUÁCIL', () => {
  beforeEach(() => { cleanup(); localStorage.clear(); LocalStoreRepository.resetToInitial(); });

  it('publica solo productos publicados de negocios activos', () => {
    const data = publicData(); mount();
    expect(resultCards()).toHaveLength(data.products.length);
    const privateProducts = LocalStoreRepository.getProducts(true).filter(p => !data.products.some(publicProduct => publicProduct.id === p.id));
    privateProducts.forEach(product => expect(screen.queryByRole('heading', { name: product.name })).not.toBeInTheDocument());
  });

  it('encuentra café con el término de la cabecera en la URL aunque no tenga tilde', () => {
    mount('/catalogo?q=cafe');
    const cards = resultCards(); expect(cards.length).toBeGreaterThan(0);
    cards.forEach(card => expect(card.textContent?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()).toContain('cafe'));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('q=cafe');
  });

  it('abre filtros combinados de una URL compartida y permite retirar uno', async () => {
    const product = publicData().products[0]; const business = LocalStoreRepository.getBusinessById(product.businessId)!;
    const params = new URLSearchParams({ categoria: product.category, ubicacion: business.location });
    const user = mount(`/catalogo?${params}`);
    resultCards().forEach(card => expect(card).toHaveTextContent(business.location));
    expect(resultCards().length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: `Quitar filtro ${business.location}` }));
    expect(screen.getByLabelText('Ruta actual')).not.toHaveTextContent('ubicacion=');
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(`categoria=${product.category}`);
  });

  it('filtra precios en céntimos y ordena los resultados por menor precio', async () => {
    const user = mount('/catalogo?precio_min=10&precio_max=30&orden=precio_asc');
    const prices = resultCards().map(card => {
      const heading = within(card).getByRole('heading', { level: 3 });
      return publicData().products.find(product => product.name === heading.textContent)!.priceCents;
    });
    expect(prices.length).toBeGreaterThan(0); expect(prices.every(price => price >= 1000 && price <= 3000)).toBe(true);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'precio_desc');
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('orden=precio_desc');
  });

  it('muestra errores de rango y mantiene los demás criterios', async () => {
    const user = mount('/catalogo?categoria=cacao&precio_min=30&precio_max=10');
    expect(screen.getByText(/El rango de precio no se aplicó/)).toBeInTheDocument();
    expect(resultCards().length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Quitar filtro Desde S/ 30.00' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('categoria=cacao');
    expect(screen.getByLabelText('Ruta actual')).not.toHaveTextContent('precio_min');
  });

  it('renderiza la barra de filtros, categorías rápidas y selector de orden', () => {
    mount();
    expect(screen.getByRole('complementary', { name: 'Filtros del catálogo' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Categorías rápidas' })).toBeInTheDocument();
    expect(screen.getByLabelText('Ordenar por')).toBeInTheDocument();
  });

  it('el filtro de disponibilidad excluye productos agotados', async () => {
    const product = publicData().products[0]; LocalStoreRepository.saveProduct({ ...product, stock: 0 });
    mount('/catalogo?disponible=true');
    expect(screen.queryByRole('heading', { name: product.name })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('disponible=true');
  });

  it('limpia una búsqueda vacía sin cambiar la vista de tiendas', async () => {
    const user = mount('/catalogo?filtro=tiendas&q=sin-coincidencias');
    expect(screen.getByRole('heading', { name: 'No encontramos tiendas con estos criterios' })).toBeInTheDocument();
    await user.click(within(screen.getByRole('region', { name: 'Directorio de tiendas' })).getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/catalogo?filtro=tiendas');
    const cards = within(screen.getByRole('region', { name: 'Directorio de tiendas' })).getAllByRole('article');
    expect(cards).toHaveLength(publicData().businesses.length);
    expect(screen.queryByText(/Verificada/)).not.toBeInTheDocument();
  });

  it('conserva ofertas como un estado transparente sin descuentos inventados', async () => {
    const user = mount('/catalogo?ofertas=true');
    expect(screen.getByRole('heading', { name: 'Aún no hay promociones registradas' })).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Ver productos' }));
    expect(screen.getByRole('heading', { name: 'Catálogo de productos' })).toBeInTheDocument();
  });

  it('confirma el agregado y actualiza unidades sin navegar ni expandir la tarjeta', async () => {
    const product = publicData().products.find(product => product.stock >= 2)!;
    const user = mount(); await user.click(screen.getByRole('button', { name: `Agregar ${product.name} al carrito` }));
    const card = screen.getByRole('heading', { name: product.name }).closest('article')!;
    expect(within(card).getByRole('status')).toHaveTextContent(`${product.name} agregado al carrito.`);
    expect(within(card).getByRole('status')).toHaveClass('sr-only');
    expect(within(card).queryByRole('link', { name: 'Ver carrito' })).not.toBeInTheDocument();
    expect(within(card).getByText('Agregado')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Unidades en carrito')).toHaveTextContent('1');
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/catalogo');
    expect(JSON.parse(localStorage.getItem('juacil_cart_store_v1.0')!).items[0].productId).toBe(product.id);
    await user.click(within(card).getByRole('button', { name: `Agregar ${product.name} al carrito` }));
    expect(screen.getByLabelText('Unidades en carrito')).toHaveTextContent('2');
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/catalogo');
  });

  it('comprueba disponibilidad vigente antes de agregar y usa un fallback local de imagen', async () => {
    const product = publicData().products.find(product => product.stock > 0)!; const user = mount();
    const card = screen.getByRole('heading', { name: product.name }).closest('article')!;
    fireEvent.error(within(card).getByRole('img'));
    expect(within(card).getByText('Imagen no disponible')).toBeInTheDocument();
    LocalStoreRepository.saveProduct({ ...product, stock: 0 });
    await user.click(within(card).getByRole('button', { name: `Agregar ${product.name} al carrito` }));
    expect(within(card).getByRole('alert')).toHaveTextContent('agotado');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el historial recupera el filtro anterior', async () => {
    const firstCategory = publicData().products[0].category;
    const user = mount(`/catalogo?categoria=${firstCategory}`);
    await user.click(screen.getByRole('button', { name: 'Limpiar todo' }));
    await user.click(screen.getByRole('button', { name: 'Volver en historial' }));
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent('/catalogo');
    expect(screen.getByLabelText('Ruta actual')).toHaveTextContent(`categoria=${firstCategory}`);
  });
});

describe('Validación de rangos monetarios', () => {
  it('acepta cero, coma decimal y límites abiertos', () => {
    expect(readPriceRange('0', '30,50')).toEqual({ min: 0, max: 3050, error: null });
    expect(readPriceRange('', '')).toEqual({ min: null, max: null, error: null });
  });
  it.each([['-1', '30'], ['NaN', ''], ['1.234', ''], ['20', '10'], ['99999999999999999999', '']])('rechaza rango inválido %s–%s', (min, max) => {
    expect(readPriceRange(min, max).error).not.toBeNull();
  });
});
