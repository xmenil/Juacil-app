import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Search, RotateCcw, PackageX, Filter } from 'lucide-react';
import styles from './CatalogPage.module.css';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('categoria') || '';
  const location = searchParams.get('ubicacion') || '';
  const sort = searchParams.get('orden') || 'nuevos';

  const allProducts = useMemo(() => LocalStoreRepository.getProducts(), []);
  const allBusinesses = useMemo(() => LocalStoreRepository.getBusinesses(), []);

  const businessLocationMap = useMemo(() => {
    const map = new Map<string, string>();
    allBusinesses.forEach((b) => map.set(b.id, b.location));
    return map;
  }, [allBusinesses]);

  // Filtrado y ordenamiento de productos
  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((prod) => {
        // Búsqueda por texto (nombre, descripción, características)
        if (query) {
          const q = query.toLowerCase();
          const matchName = prod.name.toLowerCase().includes(q);
          const matchDesc = prod.description.toLowerCase().includes(q);
          const matchFeat = prod.features.some((f) => f.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchFeat) return false;
        }

        // Filtro por categoría
        if (category && prod.category !== category) {
          return false;
        }

        // Filtro por ubicación de la MYPE
        if (location) {
          const bizLoc = businessLocationMap.get(prod.businessId) || '';
          if (!bizLoc.toLowerCase().includes(location.toLowerCase())) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sort === 'precio_asc') return a.priceCents - b.priceCents;
        if (sort === 'precio_desc') return b.priceCents - a.priceCents;
        if (sort === 'nombre_asc') return a.name.localeCompare(b.name);
        // Por defecto: más recientes
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [allProducts, query, category, location, sort, businessLocationMap]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = Boolean(query || category || location || sort !== 'nuevos');

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Catálogo de la Selva Central</h1>
          <p className={styles.subtitle}>
            Productos representativos de Oxapampa, Villa Rica, Satipo y Chanchamayo directamente de
            sus productores.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Barra Lateral de Filtros */}
          <aside className={styles.sidebar} aria-label="Filtros del catálogo">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 className={styles.filterLabel}>
                <Filter size={16} />
                <span>Filtros</span>
              </h2>
              {hasActiveFilters && (
                <Button size="sm" variant="ghost" onClick={handleClearFilters} leftIcon={<RotateCcw size={12} />}>
                  Limpiar
                </Button>
              )}
            </div>

            {/* Búsqueda */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-search" className={styles.filterLabel}>
                Buscar producto
              </label>
              <Input
                id="catalog-search"
                placeholder="Ej. Café, miel, bolso..."
                value={query}
                onChange={(e) => updateParam('q', e.target.value)}
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Categoría */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-category" className={styles.filterLabel}>
                Categoría
              </label>
              <Select
                id="catalog-category"
                value={category}
                onChange={(e) => updateParam('categoria', e.target.value)}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...CATEGORIES.map((c) => ({ value: c.id, label: c.name })),
                ]}
              />
            </div>

            {/* Ubicación */}
            <div className={styles.filterGroup}>
              <label htmlFor="catalog-location" className={styles.filterLabel}>
                Origen / Ubicación
              </label>
              <Select
                id="catalog-location"
                value={location}
                onChange={(e) => updateParam('ubicacion', e.target.value)}
                options={[
                  { value: '', label: 'Toda la Selva Central' },
                  ...LOCATIONS.map((loc) => ({ value: loc, label: loc })),
                ]}
              />
            </div>
          </aside>

          {/* Contenido Principal y Listado */}
          <main className={styles.mainContent}>
            <div className={styles.topBar}>
              <div className={styles.counter}>
                Mostrando <strong className={styles.counterStrong}>{filteredProducts.length}</strong>{' '}
                {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}
              </div>

              {/* Ordenamiento */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label htmlFor="catalog-sort" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Ordenar por:
                </label>
                <Select
                  id="catalog-sort"
                  value={sort}
                  onChange={(e) => updateParam('orden', e.target.value)}
                  options={[
                    { value: 'nuevos', label: 'Más recientes' },
                    { value: 'precio_asc', label: 'Menor precio' },
                    { value: 'precio_desc', label: 'Mayor precio' },
                    { value: 'nombre_asc', label: 'Nombre A-Z' },
                  ]}
                  style={{ width: 'auto' }}
                />
              </div>
            </div>

            {/* Grilla o Estado Vacío */}
            {filteredProducts.length > 0 ? (
              <div className={styles.grid}>
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconBox}>
                  <PackageX size={32} />
                </div>
                <h3 className={styles.emptyTitle}>No hay productos con estos filtros</h3>
                <p className={styles.emptyText}>
                  Intenta cambiar el término de búsqueda o limpia los filtros para explorar otras
                  opciones de la Selva Central.
                </p>
                <Button variant="primary" onClick={handleClearFilters} leftIcon={<RotateCcw size={16} />}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
