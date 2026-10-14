import React from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { Product } from '@/entities/product/model/types';
import { CATEGORIES } from '@/shared/config/constants';
import { formatMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { Alert } from '@/shared/ui/Alert';
import { ProductPhoto } from './ProductPhoto';
import { PRODUCT_FILTERS } from './productFilters';
import styles from './ProductList.module.css';

interface ProductListProps {
  products: Product[];
  filteredProducts: Product[];
  filter: string;
  search: string;
  feedback?: { type: 'success' | 'danger'; message: string } | null;
  onFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  onCreate: () => void;
  onEdit: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products, filteredProducts, filter, search, feedback, onFilterChange, onSearchChange,
  onClearFilters, onCreate, onEdit, onToggleStatus, onDelete,
}) => (
  <div className={styles.page}><div className="container">
    <header className={styles.header}>
      <div><p className={styles.eyebrow}>Catálogo de tu tienda</p><h1>Productos</h1><p>Actualiza precios, stock y lo que ven tus compradores.</p></div>
      <Button variant="accent" leftIcon={<Plus size={18} />} className={styles.createButton} onClick={onCreate}>Agregar producto</Button>
    </header>
    {feedback && <Alert variant={feedback.type} className={styles.feedback}>{feedback.message}</Alert>}
    <div className={styles.searchRow}>
      <Input id="merchant-product-search" label="Buscar producto" placeholder="Escribe el nombre del producto"
        leftIcon={<Search size={18} />} value={search} onChange={event => onSearchChange(event.target.value)} />
      {search && <Button variant="ghost" onClick={() => onSearchChange('')}>Limpiar búsqueda</Button>}
    </div>
    <div className={styles.filters} role="group" aria-label="Filtrar productos">
      {PRODUCT_FILTERS.map(({ value, label }) => {
        const count = value === 'all' ? products.length : products.filter(product =>
          value === 'outOfStock' ? product.stock === 0 : product.status === value).length;
        return <Button key={value} variant={filter === value ? 'primary' : 'outline'}
          className={styles.filterButton} aria-pressed={filter === value} onClick={() => onFilterChange(value)}>{label} ({count})</Button>;
      })}
    </div>
    <p className={styles.resultCount} role="status">Mostrando {filteredProducts.length} de {products.length} {products.length === 1 ? 'producto' : 'productos'}.</p>
    {filteredProducts.length > 0 ? (
      <div className={styles.listSurface}>
        <div className={styles.listHeader} aria-hidden="true"><span>Producto</span><span>Precio</span><span>Stock</span><span>Visibilidad</span><span>Acciones</span></div>
        <ul className={styles.productList} aria-label="Productos de tu tienda">
          {filteredProducts.map(product => (
            <li key={product.id} className={styles.productRow}>
              <div className={styles.identity}>
                <ProductPhoto key={product.imageUrl} src={product.imageUrl} className={styles.thumbnail} />
                <div><strong>{product.name}</strong><span>{CATEGORIES.find(category => category.id === product.category)?.name || product.category}</span></div>
              </div>
              <div className={styles.price}><span className={styles.mobileLabel}>Precio</span><strong>{formatMoney(product.priceCents)}</strong></div>
              <div className={styles.stock}><span className={styles.mobileLabel}>Stock</span>
                {product.stock <= 4 ? <Badge variant={product.stock === 0 ? 'danger' : 'warning'}>{product.stock === 0 ? 'Agotado' : `${product.stock} ${product.stock === 1 ? 'unidad' : 'unidades'}`}</Badge>
                  : <strong>{product.stock} unidades</strong>}
              </div>
              <div className={styles.visibility}><span className={styles.mobileLabel}>Visibilidad</span><Badge variant={product.status === 'published' ? 'success' : 'neutral'}>{product.status === 'published' ? 'Publicado' : 'Borrador'}</Badge></div>
              <div className={styles.actions}>
                <Button variant="outline" leftIcon={<Edit2 size={16} />} aria-label={`Editar ${product.name}`} onClick={() => onEdit(product)}>Editar</Button>
                <Button variant="ghost" leftIcon={product.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                  aria-label={`${product.status === 'published' ? 'Pasar a borrador' : 'Publicar'}: ${product.name}`}
                  onClick={() => onToggleStatus(product)}>{product.status === 'published' ? 'Pasar a borrador' : 'Publicar'}</Button>
                <Button variant="ghost" className={styles.deleteButton} title={`Eliminar ${product.name}`}
                  aria-label={`Eliminar ${product.name}`} onClick={() => onDelete(product)}><Trash2 size={17} aria-hidden="true" /></Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <section className={styles.emptyState} aria-labelledby="products-empty-title">
        <Package size={28} aria-hidden="true" /><h2 id="products-empty-title">{products.length === 0 ? 'Todavía no tienes productos registrados' : 'No encontramos productos con estos filtros'}</h2>
        <p>{products.length === 0 ? 'Agrega tu primer producto con su precio, stock y una foto.' : 'Prueba otro nombre o limpia los filtros para ver tu catálogo.'}</p>
        {products.length > 0 && <Button variant="outline" onClick={onClearFilters}>Limpiar filtros</Button>}
      </section>
    )}
  </div></div>
);
