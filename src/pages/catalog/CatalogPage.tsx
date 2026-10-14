import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, RotateCcw, Store, Package, Tag, ArrowRight } from 'lucide-react';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { BusinessCard } from '@/entities/business/ui/BusinessCard';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { formatMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Modal } from '@/shared/ui/Modal';
import { CatalogFilters } from './CatalogFilters';
import { filterCatalogProducts, getPublicCatalog, normalizeSearch, readPriceRange } from './catalogModel';
import styles from './CatalogPage.module.css';

const sortOptions = [
  { value: 'nuevos', label: 'Más recientes' }, { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' }, { value: 'nombre_asc', label: 'Nombre A–Z' },
];
const filterKeys = ['q', 'categoria', 'ubicacion', 'precio_min', 'precio_max', 'disponible', 'orden'];

export function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const view = params.get('filtro') === 'tiendas' ? 'tiendas' : params.get('ofertas') === 'true' ? 'ofertas' : 'productos';
  const query = params.get('q') || '';
  const category = params.get('categoria') || '';
  const location = params.get('ubicacion') || '';
  const minimum = params.get('precio_min') || '';
  const maximum = params.get('precio_max') || '';
  const availableOnly = params.get('disponible') === 'true';
  const sort = sortOptions.some(option => option.value === params.get('orden')) ? params.get('orden')! : 'nuevos';
  const range = readPriceRange(minimum, maximum);
  const catalog = getPublicCatalog(LocalStoreRepository.getProducts(), LocalStoreRepository.getBusinesses());
  const filteredProducts = filterCatalogProducts(catalog.products, catalog.businesses, { query, category, location, sort, availableOnly, minimum: range.error ? null : range.min, maximum: range.error ? null : range.max });
  const search = normalizeSearch(query);
  const categoryName = (id: string) => CATEGORIES.find(item => item.id === id)?.name || id;
  const filteredBusinesses = catalog.businesses.filter(business =>
    (!search || normalizeSearch([business.name, business.description, business.location, categoryName(business.category)].join(' ')).includes(search))
    && (!category || business.category === category)
    && (!location || normalizeSearch(business.location).includes(normalizeSearch(location)))
  ).sort((a, b) => a.name.localeCompare(b.name, 'es-PE'));
  const stores = view === 'tiendas';
  const count = stores ? filteredBusinesses.length : filteredProducts.length;
  const locations = [...new Set([...LOCATIONS, ...catalog.businesses.map(business => business.location)])];
  const productCount = (businessId: string) => catalog.products.filter(product => product.businessId === businessId).length;
  const values = { category, location, minimum, maximum, available: availableOnly };
  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: key === 'q' || key.startsWith('precio_') });
  };
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    filterKeys.forEach(key => next.delete(key)); setParams(next);
  };
  const viewUrl = (nextView: typeof view) => {
    const next = new URLSearchParams(params);
    next.delete('filtro'); next.delete('ofertas');
    if (nextView === 'tiendas') {
      next.set('filtro', 'tiendas');
      ['precio_min', 'precio_max', 'disponible', 'orden'].forEach(key => next.delete(key));
    }
    if (nextView === 'ofertas') next.set('ofertas', 'true');
    return `${ROUTES.CATALOG}${next.size ? `?${next}` : ''}`;
  };
  const activeFilters = [
    ...(query ? [{ key: 'q', label: `Búsqueda: ${query}` }] : []),
    ...(category ? [{ key: 'categoria', label: categoryName(category) }] : []),
    ...(location ? [{ key: 'ubicacion', label: location }] : []),
    ...(!stores && minimum ? [{ key: 'precio_min', label: range.min !== null && !Number.isNaN(range.min) ? `Desde ${formatMoney(range.min)}` : `Desde: ${minimum}` }] : []),
    ...(!stores && maximum ? [{ key: 'precio_max', label: range.max !== null && !Number.isNaN(range.max) ? `Hasta ${formatMoney(range.max)}` : `Hasta: ${maximum}` }] : []),
    ...(!stores && availableOnly ? [{ key: 'disponible', label: 'Con stock' }] : []),
  ];
  const quickCategories = CATEGORIES.filter(item => catalog.products.some(product => product.category === item.id));
  const title = stores ? 'Tiendas y emprendimientos' : view === 'ofertas' ? 'Ofertas de la comunidad' : 'Catálogo de productos';
  const noun = stores ? 'tiendas' : 'productos';

  return <div className={styles.page}><div className="container">
    <header className={styles.header}><p className={styles.eyebrow}>JUÁCIL / Catálogo</p><h1>{title}</h1><p className={styles.subtitle}>{stores ? 'Conoce los negocios, su ubicación y los productos que ofrecen.' : view === 'ofertas' ? 'Las promociones aparecerán aquí cuando estén registradas.' : 'Encuentra productos de las MYPES y elige con quién preparar tu pedido.'}</p></header>
    <nav className={styles.views} aria-label="Secciones del catálogo">
      {[{ id: 'productos', label: 'Productos', icon: Package }, { id: 'tiendas', label: 'Tiendas', icon: Store }, { id: 'ofertas', label: 'Ofertas', icon: Tag }].map(({ id, label, icon: Icon }) =>
        <Link key={id} to={viewUrl(id as typeof view)} className={view === id ? styles.viewActive : styles.view} aria-current={view === id ? 'page' : undefined}><Icon size={18} aria-hidden="true" />{label}</Link>)}
    </nav>
    {view === 'ofertas' ? <section className={styles.empty}><Tag size={32} aria-hidden="true" /><h2>Aún no hay promociones registradas</h2><p>No hay descuentos publicados por las tiendas. Puedes explorar los precios de catálogo y consultar directamente a cada negocio.</p><Link className={styles.primaryLink} to={viewUrl('productos')}>Ver productos <ArrowRight size={18} aria-hidden="true" /></Link></section> : <>
      <div className={styles.searchRow}>
        <Input id="catalog-search" label={stores ? 'Buscar tienda' : 'Buscar productos o negocios'} leftIcon={<Search size={19} />} value={query} placeholder={stores ? 'Nombre del negocio, rubro o ubicación' : 'Nombre, características o tienda'} onChange={event => updateParam('q', event.target.value)} />
        <Button className={styles.mobileFilters} variant="outline" leftIcon={<SlidersHorizontal size={18} />} onClick={() => setFiltersOpen(true)}>Filtros{activeFilters.filter(filter => filter.key !== 'q').length ? ` (${activeFilters.filter(filter => filter.key !== 'q').length})` : ''}</Button>
      </div>
      {!stores && <div className={styles.categories} role="group" aria-label="Categorías rápidas">
        <button className={!category ? styles.categoryActive : styles.category} aria-pressed={!category} onClick={() => updateParam('categoria', '')}>Todas</button>
        {quickCategories.map(item => <button key={item.id} className={category === item.id ? styles.categoryActive : styles.category} aria-pressed={category === item.id} onClick={() => updateParam('categoria', item.id)}>{item.name.split(' & ')[0]}</button>)}
      </div>}
      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Filtros del catálogo">
          <div className={styles.filterHeading}><h2>Filtrar {noun}</h2><SlidersHorizontal size={18} aria-hidden="true" /></div>
          <CatalogFilters prefix="desktop" values={values} locations={locations} stores={stores} onChange={updateParam} priceError={range.error} />
          {(activeFilters.length > 0 || sort !== 'nuevos') && <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={clearFilters}>Limpiar filtros</Button>}
        </aside>
        <section className={styles.results} aria-label={stores ? 'Directorio de tiendas' : 'Resultados del catálogo'}>
          <div className={styles.resultsHeader}>
            <p role="status"><strong>{count}</strong> {count === 1 ? stores ? 'tienda encontrada' : 'producto encontrado' : `${noun} encontrados`}</p>
            {!stores && <Select id="catalog-sort" label="Ordenar por" value={sort} options={sortOptions} onChange={event => updateParam('orden', event.target.value)} />}
          </div>
          {activeFilters.length > 0 && <div className={styles.activeFilters} aria-label="Filtros aplicados">{activeFilters.map(filter => <button key={filter.key} onClick={() => updateParam(filter.key, '')} aria-label={`Quitar filtro ${filter.label}`}>{filter.label}<X size={14} aria-hidden="true" /></button>)}<button className={styles.clearAll} onClick={clearFilters}>Limpiar todo</button></div>}
          {!stores && range.error && <p className={styles.priceNotice} role="status">El rango de precio no se aplicó. Corrígelo en los filtros; se mantienen los demás criterios.</p>}
          {count ? <div className={stores ? styles.storesGrid : styles.grid}>{stores
            ? filteredBusinesses.map(business => <BusinessCard key={business.id} business={business} productCount={productCount(business.id)} showContact />)
            : filteredProducts.map(product => <ProductCard key={product.id} product={product} />)}</div>
            : <div className={styles.empty}><Search size={30} aria-hidden="true" /><h2>{stores ? 'No encontramos tiendas con estos criterios' : 'No encontramos productos con estos filtros'}</h2><p>Prueba otra búsqueda o retira un filtro para ver más opciones.</p><Button variant="outline" onClick={clearFilters}>Limpiar filtros</Button></div>}
        </section>
      </div>
      <Modal isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title={`Filtrar ${noun}`} variant="drawer"
        footer={<div className={styles.filterFooter}><Button variant="outline" onClick={clearFilters}>Limpiar</Button><Button disabled={!stores && !!range.error} onClick={() => setFiltersOpen(false)}>Mostrar {count} {noun}</Button></div>}>
        <CatalogFilters prefix="mobile" values={values} locations={locations} stores={stores} onChange={updateParam} priceError={range.error} />
      </Modal>
    </>}
  </div></div>;
}
