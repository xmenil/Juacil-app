import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { CATEGORIES } from '@/shared/config/constants';
import styles from './CatalogPage.module.css';

export interface FilterValues { category: string; location: string; minimum: string; maximum: string; available: boolean; }
export function CatalogFilters({ prefix, values, locations, stores, onChange, priceError }: {
  prefix: string; values: FilterValues; locations: string[]; stores: boolean;
  onChange: (key: string, value: string) => void; priceError: string | null;
}) {
  const categoryOptions = [{ value: '', label: 'Todas las categorías' }, ...CATEGORIES.map(category => ({ value: category.id, label: category.name }))];
  if (values.category && !categoryOptions.some(option => option.value === values.category)) categoryOptions.push({ value: values.category, label: values.category });
  const locationOptions = [{ value: '', label: 'Todas las ubicaciones' }, ...locations.map(location => ({ value: location, label: location }))];
  if (values.location && !locationOptions.some(option => option.value === values.location)) locationOptions.push({ value: values.location, label: values.location });
  return <div className={styles.filterFields}>
    <Select id={`${prefix}-category`} label={stores ? 'Rubro del negocio' : 'Categoría'} value={values.category} onChange={event => onChange('categoria', event.target.value)} options={categoryOptions} />
    <Select id={`${prefix}-location`} label="Ubicación de la tienda" value={values.location} onChange={event => onChange('ubicacion', event.target.value)} options={locationOptions} />
    {!stores && <>
      <fieldset className={styles.priceFields}><legend>Precio por producto (S/)</legend>
        <Input id={`${prefix}-min`} label="Desde" placeholder="0.00" inputMode="decimal" value={values.minimum} aria-invalid={!!priceError} aria-describedby={priceError ? `${prefix}-price-error` : undefined} onChange={event => onChange('precio_min', event.target.value)} />
        <Input id={`${prefix}-max`} label="Hasta" placeholder="Sin límite" inputMode="decimal" value={values.maximum} aria-invalid={!!priceError} aria-describedby={priceError ? `${prefix}-price-error` : undefined} onChange={event => onChange('precio_max', event.target.value)} />
      </fieldset>
      {priceError && <p id={`${prefix}-price-error`} className={styles.filterError} role="alert">{priceError}</p>}
      <label className={styles.available}><input type="checkbox" checked={values.available} onChange={event => onChange('disponible', event.target.checked ? 'true' : '')} />Solo productos con stock</label>
    </>}
    <p className={styles.filterHint}>La ubicación corresponde al negocio. La entrega se coordina directamente con la tienda.</p>
  </div>;
}
