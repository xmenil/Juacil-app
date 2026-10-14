import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { generateId } from '@/shared/lib/id';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import type { Business } from '@/entities/business/model/types';
import styles from './AdminDashboardPage.module.css';

const phone = z.string().trim().regex(/^9\d{8}$/, 'Ingresa un celular peruano de 9 dígitos.');
const storeSchema = z.object({
  name: z.string().trim().min(3, 'Ingresa al menos 3 caracteres.'),
  category: z.string().min(1, 'Selecciona un rubro.'),
  location: z.string().min(1, 'Selecciona una ubicación.'),
  whatsapp: phone,
  ruc: z.string().trim().refine(value => !value || /^\d{11}$/.test(value), 'El RUC referencial debe tener 11 dígitos.'),
  description: z.string().trim(),
});
type StoreValues = z.infer<typeof storeSchema>;
const userSchema = z.object({
  name: z.string().trim().min(3, 'Ingresa al menos 3 caracteres.'),
  email: z.string().trim().email('Ingresa un correo válido.'),
  phone,
  role: z.enum(['cliente', 'merchant', 'admin']),
  businessId: z.string(),
  address: z.string().trim(),
  zone: z.string(),
}).refine(value => value.role !== 'merchant' || !!value.businessId, {
  message: 'Selecciona el negocio que administrará este emprendedor.', path: ['businessId'],
});
type UserValues = z.infer<typeof userSchema>;
interface Props { onCancel: () => void; onSaved: (message: string) => void; }

function registerStore(values: StoreValues, ownerId: string) {
  LocalStoreRepository.saveBusiness({
    ...values, id: generateId('biz'), ownerId, onboardingStep: 4, status: 'active',
    ruc: values.ruc || undefined, createdAt: new Date().toISOString(),
    logoUrl: '/images/juacil-logo.png',
    bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  });
}

function registerUser(values: UserValues) {
  LocalStoreRepository.saveUser({ ...values, email: values.email.toLowerCase(), id: generateId('user'),
    businessId: values.role === 'merchant' ? values.businessId : undefined, status: 'active', createdAt: new Date().toISOString() });
}

export function CreateStoreForm({ ownerId, onCancel, onSaved }: Props & { ownerId: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<StoreValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: { name: '', category: CATEGORIES[0]?.id || '', location: LOCATIONS[0] || '', whatsapp: '', ruc: '', description: '' },
  });
  const submit = (values: StoreValues) => {
    registerStore(values, ownerId);
    onSaved(`La tienda «${values.name}» se registró como activa.`);
  };
  return <form className={styles.form} onSubmit={handleSubmit(submit)}>
    <p className={styles.muted}>Registra los datos de la MYPE. Puedes vincular un emprendedor al crear su cuenta.</p>
    <Input label="Nombre comercial" id="store-name" required {...register('name')} error={errors.name?.message} placeholder="Ej. Café de Villa Rica" />
    <div className={styles.formGrid}>
      <Select label="Rubro" id="store-category" {...register('category')} error={errors.category?.message} options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))} />
      <Select label="Ubicación" id="store-location" {...register('location')} error={errors.location?.message} options={LOCATIONS.map(value => ({ value, label: value }))} />
      <Input label="WhatsApp de contacto" id="store-phone" required inputMode="tel" {...register('whatsapp')} error={errors.whatsapp?.message} placeholder="987654321" />
      <Input label="RUC referencial (opcional)" id="store-ruc" inputMode="numeric" {...register('ruc')} error={errors.ruc?.message} helperText="Solo se valida el formato, sin consulta a SUNAT." />
    </div>
    <Textarea label="Descripción (opcional)" id="store-description" rows={3} {...register('description')} />
    <div className={styles.formActions}><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit" isLoading={isSubmitting}>Registrar tienda</Button></div>
  </form>;
}

export function CreateUserForm({ businesses, onCancel, onSaved }: Props & { businesses: Business[] }) {
  const { register, handleSubmit, control, setError, formState: { errors, isSubmitting } } = useForm<UserValues>({
    resolver: zodResolver(userSchema), defaultValues: { name: '', email: '', phone: '', role: 'cliente', businessId: '', address: '', zone: LOCATIONS[0] || '' },
  });
  const role = useWatch({ control, name: 'role' });
  const submit = (values: UserValues) => {
    if (LocalStoreRepository.getUsers().some(u => u.email.toLowerCase() === values.email.toLowerCase())) {
      setError('email', { message: 'Ya existe una cuenta con este correo.' }); return;
    }
    registerUser(values);
    onSaved(`La cuenta de ${values.name} se creó correctamente.`);
  };
  return <form className={styles.form} onSubmit={handleSubmit(submit)}>
    <p className={styles.muted}>Esta cuenta estará disponible en el acceso demo de este navegador.</p>
    <Input label="Nombre completo" id="user-name" required {...register('name')} error={errors.name?.message} />
    <Input label="Correo electrónico" id="user-email" type="email" required {...register('email')} error={errors.email?.message} />
    <div className={styles.formGrid}>
      <Input label="Celular" id="user-phone" required inputMode="tel" {...register('phone')} error={errors.phone?.message} />
      <Select label="Rol" id="user-role" {...register('role')} options={[{ value: 'cliente', label: 'Cliente' }, { value: 'merchant', label: 'Emprendedor' }, { value: 'admin', label: 'Administrador' }]} />
    </div>
    {role === 'merchant' && <Select label="Negocio asignado" id="user-business" {...register('businessId')} error={errors.businessId?.message}
      options={[{ value: '', label: 'Selecciona un negocio' }, ...businesses.map(b => ({ value: b.id, label: b.name }))]} />}
    {role === 'admin' && <p className={styles.warning}>Este rol permite gestionar todas las tiendas y cuentas de la demostración.</p>}
    <Select label="Ubicación" id="user-zone" {...register('zone')} options={LOCATIONS.map(value => ({ value, label: value }))} />
    <Input label="Dirección (opcional)" id="user-address" {...register('address')} />
    <div className={styles.formActions}><Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button><Button type="submit" isLoading={isSubmitting}>Crear usuario</Button></div>
  </form>;
}
