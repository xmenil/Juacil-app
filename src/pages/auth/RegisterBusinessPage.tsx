import { AuthLayout } from './AuthLayout';
import styles from './Auth.module.css';
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

import { ArrowRight } from 'lucide-react';

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
    <AuthLayout business title="Cuéntanos sobre tu negocio." description="Completa los datos de tu emprendimiento. Después podrás agregar tu primer producto al catálogo.">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <fieldset className={styles.fieldset}>
          <legend>Tu negocio</legend>
          <Input label="Nombre del emprendimiento" isRequired autoComplete="organization" placeholder="Ej. Café Finca Bellavista" error={errors.businessName?.message} {...register('businessName')} />
          <div className={styles.row}>
            <Select label="¿Qué vendes?" isRequired options={CATEGORIES.map(c => ({ value: c.id, label: c.name }))} error={errors.category?.message} {...register('category')} />
            <Select label="Ciudad o distrito" isRequired options={LOCATIONS.map(location => ({ value: location, label: location }))} error={errors.location?.message} {...register('location')} />
          </div>
          <Textarea label="Cuéntanos qué ofreces" isRequired rows={3} placeholder="Ej. Producimos café tostado y molido en Villa Rica." error={errors.description?.message} {...register('description')} />
        </fieldset>
        <fieldset className={styles.fieldset}>
          <legend>Responsable y contacto</legend>
          <Input label="Nombre del responsable" isRequired autoComplete="name" placeholder="Ej. Juan Pérez Santos" error={errors.ownerName?.message} {...register('ownerName')} />
          <Input label="Correo electrónico" isRequired type="email" autoComplete="email" placeholder="juan@ejemplo.pe" error={errors.email?.message} {...register('email')} />
          <div className={styles.row}>
            <Input label="WhatsApp de contacto" isRequired type="tel" inputMode="tel" autoComplete="tel-national" maxLength={9} placeholder="Ej. 987654321" error={errors.whatsapp?.message} {...register('whatsapp')} />
            <Input label="RUC (opcional)" inputMode="numeric" maxLength={11} placeholder="11 dígitos" helperText="Puedes registrarte sin RUC. No se valida con SUNAT." error={errors.ruc?.message} {...register('ruc')} />
          </div>
        </fieldset>
        <p className={styles.note}>Este registro crea un negocio de demostración en tu navegador. No envía mensajes de WhatsApp ni realiza trámites de formalización.</p>
        <Button type="submit" size="lg" variant="primary" fullWidth isLoading={isSubmitting} rightIcon={<ArrowRight size={18} />}>Registrar mi negocio</Button>
      </form>
      <div className={styles.switch}><p>¿Tu negocio ya está registrado? <Link to={ROUTES.LOGIN} className={styles.link}>Iniciar sesión</Link></p></div>
    </AuthLayout>
  );
};

