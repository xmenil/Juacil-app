export const PRODUCT_FILTERS = [
  { value: 'all', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Borradores' },
  { value: 'outOfStock', label: 'Agotados' },
] as const;

export function getProductFilter(value: string | null) {
  return PRODUCT_FILTERS.find(filter => filter.value === value)?.value || 'all';
}
