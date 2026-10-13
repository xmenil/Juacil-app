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
    <div style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            Registro de Comprador
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
            Crea tu cuenta para comprar y dar seguimiento a tus pedidos de la Selva Central.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Nombre Completo"
              isRequired
              placeholder="Ej. Ana Belén Flores"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Correo Electrónico"
              isRequired
              type="email"
              placeholder="ana@ejemplo.pe"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Celular de Contacto"
              isRequired
              placeholder="Ej. 987123456"
              error={errors.phone?.message}
              {...register('phone')}
            />

            <Input
              label="Dirección o Ciudad de Entrega"
              isRequired
              placeholder="Ej. Jr. Las Orquídeas 120, Chanchamayo"
              error={errors.address?.message}
              {...register('address')}
            />

            <Button type="submit" size="lg" variant="primary" isLoading={isSubmitting} style={{ marginTop: '8px' }}>
              Crear Cuenta de Comprador
            </Button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>¿Ya tienes cuenta? </span>
            <Link to={ROUTES.LOGIN} style={{ color: 'var(--color-primary-800)', fontWeight: 700 }}>
              Ingresa aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
