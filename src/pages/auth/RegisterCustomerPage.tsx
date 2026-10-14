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
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';

const registerCustomerSchema = z.object({
  name: z.string().min(3, 'Ingresa tu nombre completo.'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  phone: z.string().regex(/^9\d{8}$/, 'Ingresa un número de 9 dígitos.'),
  address: z.string().min(5, 'Ingresa tu dirección o ciudad para envíos.'),
});

type RegisterCustomerValues = z.infer<typeof registerCustomerSchema>;

export const RegisterCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAs } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterCustomerValues>({
    resolver: zodResolver(registerCustomerSchema),
  });

  const onSubmit = (values: RegisterCustomerValues) => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newUserId = generateId('user-client');
      LocalStoreRepository.saveUser({
        id: newUserId,
        name: values.name,
        email: values.email,
        role: 'cliente',
        phone: values.phone,
        address: values.address,
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      });
      loginAs(newUserId);
      setIsSubmitting(false);
      navigate(ROUTES.CATALOG);
    }, 200);
  };

  return (
    <AuthLayout title="Tu próxima compra empieza aquí." description="Crea tu cuenta para comprar a negocios de la Selva y consultar tus pedidos.">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <Input label="Nombre completo" isRequired autoComplete="name" placeholder="Ej. Ana Belén Flores" error={errors.name?.message} {...register('name')} />
        <Input label="Correo electrónico" isRequired type="email" autoComplete="email" placeholder="ana@ejemplo.pe" error={errors.email?.message} {...register('email')} />
        <Input label="Celular de contacto" isRequired type="tel" inputMode="tel" autoComplete="tel-national" maxLength={9} placeholder="Ej. 987123456" helperText="Un celular peruano de 9 dígitos." error={errors.phone?.message} {...register('phone')} />
        <Input label="Dirección o ciudad de entrega" isRequired autoComplete="street-address" placeholder="Ej. Jr. Las Orquídeas 120, Chanchamayo" error={errors.address?.message} {...register('address')} />
        <p className={styles.note}>Tu cuenta se crea en esta demostración y se guarda en este navegador. No necesitas configurar una contraseña.</p>
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>Crear mi cuenta</Button>
      </form>
      <div className={styles.switch}>
        <p>¿Ya tienes cuenta? <Link to={ROUTES.LOGIN} className={styles.link}>Iniciar sesión</Link></p>
        <p>¿Quieres vender tus productos? <Link to={ROUTES.REGISTER_BUSINESS} className={styles.link}>Registrar mi negocio</Link></p>
      </div>
    </AuthLayout>
  );
};

