import type { Product } from '@/entities/product/model/types';
import type { Business } from '@/entities/business/model/types';
import { decimalToCents } from '@/shared/lib/money';

export function normalizeSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}
export function readPriceRange(minimum: string, maximum: string) {
  const parse = (value: string) => {
    if (!value.trim()) return null;
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) return NaN;
    const cents = decimalToCents(value.trim());
    return Number.isSafeInteger(cents) ? cents : NaN;
  };
  const min = parse(minimum);
  const max = parse(maximum);
  const error = (min !== null && Number.isNaN(min)) || (max !== null && Number.isNaN(max))
    ? 'Ingresa precios válidos, con hasta dos decimales.'
    : min !== null && max !== null && min > max ? 'El precio desde no puede superar el precio hasta.' : null;
  return { min, max, error };
}

export interface CatalogCriteria {
  query: string; category: string; location: string; sort: string;
  availableOnly: boolean; minimum: number | null; maximum: number | null;
}
export function getPublicCatalog(products: Product[], businesses: Business[]) {
  const stores = businesses.filter(business => !business.status || business.status === 'active');
  const storeIds = new Set(stores.map(business => business.id));
  return { businesses: stores, products: products.filter(product => product.status === 'published' && storeIds.has(product.businessId)) };
}
export function filterCatalogProducts(products: Product[], businesses: Business[], criteria: CatalogCriteria) {
  const storeMap = new Map(businesses.map(business => [business.id, business]));
  const query = normalizeSearch(criteria.query);
  return products.filter(product => {
    const business = storeMap.get(product.businessId);
    const text = normalizeSearch([product.name, product.description, ...product.features, business?.name || ''].join(' '));
    return (!query || text.includes(query))
      && (!criteria.category || product.category === criteria.category)
      && (!criteria.location || normalizeSearch(business?.location || '').includes(normalizeSearch(criteria.location)))
      && (!criteria.availableOnly || product.stock > 0)
      && (criteria.minimum === null || product.priceCents >= criteria.minimum)
      && (criteria.maximum === null || product.priceCents <= criteria.maximum);
  }).sort((a, b) => {
    if (criteria.sort === 'precio_asc') return a.priceCents - b.priceCents;
    if (criteria.sort === 'precio_desc') return b.priceCents - a.priceCents;
    if (criteria.sort === 'nombre_asc') return a.name.localeCompare(b.name, 'es-PE');
    return b.createdAt.localeCompare(a.createdAt);
  });
}
