import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { generateId } from '@/shared/lib/id';
import { CATEGORIES, LOCATIONS } from '@/shared/config/constants';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { Store, ArrowRight } from 'lucide-react';

const registerBusinessSchema = z.object({
  ownerName: z.string().min(3, 'Ingresa tu nombre y apellido (mínimo 3 caracteres).'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  businessName: z.string().min(3, 'El nombre del negocio debe tener al menos 3 caracteres.'),
  category: z.string().min(1, 'Selecciona la categoría o rubro.'),
  location: z.string().min(1, 'Selecciona la ciudad o distrito de origen.'),
  whatsapp: z
    .string()
    .regex(/^9\d{8}$/, 'Ingresa un número de celular peruano de 9 dígitos para WhatsApp.'),
  ruc: z
    .string()
    .refine((val) => val === '' || /^\d{11}$/.test(val), {
      message: 'El RUC debe tener 11 dígitos numéricos (o déjalo en blanco si aún no tienes).',
    }),
  description: z.string().min(10, 'Cuéntanos un poco sobre tus productos (mínimo 10 caracteres).'),
});

type RegisterBusinessValues = z.infer<typeof registerBusinessSchema>;

export const RegisterBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBusinessValues>({
    resolver: zodResolver(registerBusinessSchema),
    defaultValues: {
      ownerName: '',
      email: '',
      businessName: '',
      category: 'cafe',
      location: 'Villa Rica (Pasco)',
      whatsapp: '',
      ruc: '',
      description: '',
    },
  });

  const onSubmit = (values: RegisterBusinessValues) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newUserId = generateId('user-merchant');
      const newBizId = generateId('biz');

      // Guardar negocio
      LocalStoreRepository.saveBusiness({
        id: newBizId,
        name: values.businessName,
        category: values.category,
        location: values.location,
        whatsapp: values.whatsapp,
        ruc: values.ruc || undefined,
        description: values.description,
        logoUrl: 'https://images.unsplash.com/photo-1559525839-8f8ec320b95c?auto=format&fit=crop&w=200&q=80',
        bannerUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        ownerId: newUserId,
        onboardingStep: 2,
        createdAt: new Date().toISOString(),
      });

      // Guardar usuario
      LocalStoreRepository.saveUser({
        id: newUserId,
        name: values.ownerName,
        email: values.email,
        role: 'merchant',
        phone: values.whatsapp,
        businessId: newBizId,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      });

      loginAs(newUserId);
      setIsSubmitting(false);
      navigate(ROUTES.MERCHANT_DASHBOARD);
    }, 250);
  };

  return (
    <div style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              REGISTRO DE MYPE AMAZÓNICA
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)', marginTop: '4px' }}>
              Vende tus productos en JUÁCIL
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '6px' }}>
              Paso 1 del onboarding: Cuéntanos sobre tu negocio para habilitar tu catálogo digital.
            </p>
          </div>

          <Alert variant="info">
            💡 <strong>Asistencia RUC:</strong> Si no cuentas con RUC, puedes dejar el campo vacío.
            En JUÁCIL te ayudaremos a formalizarte sin costo para potenciar tus ventas regionales.
          </Alert>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <Input
                label="Nombre del Responsable"
                isRequired
                placeholder="Ej. Juan Pérez Santos"
                error={errors.ownerName?.message}
                {...register('ownerName')}
              />

              <Input
                label="Correo Electrónico"
                isRequired
                type="email"
                placeholder="juan@ejemplo.pe"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            <Input
              label="Nombre del Emprendimiento / Marca"
              isRequired
              placeholder="Ej. Café Finca Bellavista"
              error={errors.businessName?.message}
              {...register('businessName')}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Select
                label="¿Qué vendes? (Rubro)"
                isRequired
                options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                error={errors.category?.message}
                {...register('category')}
              />

              <Select
                label="Ciudad / Distrito"
                isRequired
                options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                error={errors.location?.message}
                {...register('location')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input
                label="WhatsApp para Ventas"
                isRequired
                placeholder="Ej. 987654321"
                error={errors.whatsapp?.message}
                {...register('whatsapp')}
              />

              <Input
                label="RUC (Opcional)"
                placeholder="11 dígitos (si tienes)"
                helperText="Déjalo en blanco si aún no tienes."
                error={errors.ruc?.message}
                {...register('ruc')}
              />
            </div>

            <Textarea
              label="Breve descripción de lo que ofreces"
              isRequired
              rows={3}
              placeholder="Ej. Producimos café orgánico bajo sombra en Villa Rica desde hace 15 años..."
              error={errors.description?.message}
              {...register('description')}
            />

            <Button
              type="submit"
              size="lg"
              variant="accent"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight size={18} />}
            >
              Registrar Emprendimiento y Continuar
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>¿Ya tienes cuenta? </span>
            <Link to={ROUTES.LOGIN} style={{ color: 'var(--color-primary-800)', fontWeight: 700 }}>
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
