import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { LOCATIONS, CATEGORIES } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { ArrowLeft } from 'lucide-react';

const businessSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  category: z.string().min(1, 'Selecciona el rubro principal.'),
  location: z.string().min(1, 'Selecciona la localidad de la Selva Central.'),
  whatsapp: z
    .string()
    .regex(/^9\d{8}$/, 'Ingresa un número de celular de 9 dígitos para WhatsApp.'),
  ruc: z
    .string()
    .refine((val) => val === '' || /^\d{11}$/.test(val), {
      message: 'El RUC debe tener exactamente 11 dígitos numéricos (opcional).',
    }),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
});

type BusinessFormValues = z.infer<typeof businessSchema>;

export const MerchantBusinessPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isMerchant || !businessId) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const business = LocalStoreRepository.getBusinessById(businessId);

  if (!business) {
    return <div className="container" style={{ padding: '64px 16px' }}>Negocio no encontrado.</div>;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business.name,
      category: business.category,
      location: business.location,
      whatsapp: business.whatsapp,
      ruc: business.ruc || '',
      description: business.description,
    },
  });

  const onSubmit = (values: BusinessFormValues) => {
    LocalStoreRepository.saveBusiness({
      ...business,
      name: values.name,
      category: values.category,
      location: values.location,
      whatsapp: values.whatsapp,
      ruc: values.ruc || undefined,
      description: values.description,
    });
    setSuccessMessage('Datos del emprendimiento actualizados correctamente.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '760px' }}>
        <Link
          to={ROUTES.MERCHANT_DASHBOARD}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              Perfil Comercial del Emprendimiento
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Información visible para los compradores en tu página pública de tienda.
            </p>
          </div>

          {successMessage && (
            <div style={{ marginBottom: '20px' }}>
              <Alert variant="success">{successMessage}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Nombre Comercial de la MYPE"
              isRequired
              error={errors.name?.message}
              {...register('name')}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Select
                label="Rubro o Categoría Principal"
                isRequired
                options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                error={errors.category?.message}
                {...register('category')}
              />

              <Select
                label="Ciudad / Distrito de Origen"
                isRequired
                options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="WhatsApp para Coordinar Ventas"
                isRequired
                placeholder="Ej. 964882190"
                error={errors.whatsapp?.message}
                {...register('whatsapp')}
              />

              <Input
                label="RUC Referencial (Opcional)"
                placeholder="11 dígitos (ej. 20601234567)"
                helperText="Formato 11 dígitos sin consulta SUNAT en prototipo."
                error={errors.ruc?.message}
                {...register('ruc')}
              />
            </div>

            <Textarea
              label="Historia y Descripción del Negocio"
              isRequired
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
              <Button type="button" variant="outline" onClick={() => navigate(ROUTES.MERCHANT_DASHBOARD)}>
                Cancelar
              </Button>
              <Button type="submit" variant="accent" isLoading={isSubmitting}>
                Guardar Información
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
