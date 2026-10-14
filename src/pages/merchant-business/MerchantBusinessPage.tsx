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
import { ArrowLeft, Save } from 'lucide-react';
import styles from '@/features/business-management/StoreProfile.module.css';

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

  const business = businessId ? LocalStoreRepository.getBusinessById(businessId) : null;

  React.useEffect(() => {
    if (!isMerchant || !businessId) {
      navigate(ROUTES.FORBIDDEN);
    }
  }, [isMerchant, businessId, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    values: business
      ? {
          name: business.name,
          category: business.category,
          location: business.location,
          whatsapp: business.whatsapp,
          ruc: business.ruc || '',
          description: business.description,
        }
      : undefined,
  });

  if (!isMerchant || !businessId) {
    return null;
  }

  if (!business) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.emptyState}>
            <h2>No encontramos tu negocio</h2>
            <p>No pudimos cargar la información de tu emprendimiento.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.MERCHANT_DASHBOARD)}>
              Volver al panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
    setSuccessMessage('Los datos de tu tienda se actualizaron.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link
          to={`${ROUTES.MERCHANT_DASHBOARD}?tab=perfil`}
          className={styles.backLink}
        >
          <ArrowLeft size={16} aria-hidden="true" /> Volver a Mi tienda
        </Link>

        <header className={styles.pageHeader}>
          <p className={styles.eyebrow}>Perfil de tu negocio</p>
          <h1 className={styles.title}>Mi tienda</h1>
          <p className={styles.subtitle}>
            Actualiza la información que ven tus compradores.
          </p>
        </header>

        {successMessage && (
          <Alert variant="success" className={styles.feedback}>
            {successMessage}
          </Alert>
        )}

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <fieldset className={styles.section}>
              <div className={styles.sectionHeader}>
                <legend className={styles.sectionLegend}>Información del negocio</legend>
                <p className={styles.sectionHint}>
                  Datos principales que identifican a tu emprendimiento en JUÁCIL.
                </p>
              </div>

              <Input
                label="Nombre del negocio"
                isRequired
                error={errors.name?.message}
                {...register('name')}
              />

              <div className={styles.grid2}>
                <Select
                  label="Categoría"
                  isRequired
                  options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                  error={errors.category?.message}
                  {...register('category')}
                />

                <Select
                  label="Localidad"
                  isRequired
                  options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                  error={errors.location?.message}
                  {...register('location')}
                />
              </div>

              <div className={styles.grid2}>
                <Input
                  label="RUC"
                  placeholder="11 dígitos (ej. 20601234567)"
                  helperText="Opcional. Ingresa 11 dígitos."
                  error={errors.ruc?.message}
                  {...register('ruc')}
                />
              </div>

              <Textarea
                label="Descripción"
                isRequired
                rows={4}
                helperText="Describe tu negocio y la procedencia de tus productos."
                error={errors.description?.message}
                {...register('description')}
              />
            </fieldset>

            <fieldset className={`${styles.section} ${styles.sectionWithDivider}`}>
              <div className={styles.sectionHeader}>
                <legend className={styles.sectionLegend}>Contacto para ventas</legend>
                <p className={styles.sectionHint}>
                  Número de teléfono para coordinar compras por WhatsApp.
                </p>
              </div>

              <div className={styles.grid2}>
                <Input
                  label="WhatsApp"
                  isRequired
                  placeholder="Ej. 962881234"
                  helperText="Ingresa 9 dígitos, sin +51."
                  error={errors.whatsapp?.message}
                  {...register('whatsapp')}
                />
              </div>
            </fieldset>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`${ROUTES.MERCHANT_DASHBOARD}?tab=perfil`)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="accent"
                isLoading={isSubmitting}
                leftIcon={<Save size={18} aria-hidden="true" />}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
