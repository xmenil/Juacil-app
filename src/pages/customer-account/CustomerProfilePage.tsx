import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { LOCATIONS } from '@/shared/config/constants';
import { formatMoney } from '@/shared/lib/money';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Alert } from '@/shared/ui/Alert';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  CheckCircle,
  LogOut,
  Store,
  ShieldCheck,
  ArrowRight,
  Save,
  Package,
} from 'lucide-react';
import styles from './CustomerProfilePage.module.css';

const profileSchema = z.object({
  name: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres.'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  phone: z
    .string()
    .regex(/^9\d{8}$/, 'Ingresa un número de celular de 9 dígitos que inicie con 9.'),
  dni: z
    .string()
    .refine((val) => val === '' || /^\d{8}$/.test(val), {
      message: 'El DNI debe tener 8 dígitos numéricos (opcional).',
    }),
  address: z.string().min(5, 'Ingresa tu dirección o referencia para envíos a domicilio.'),
  zone: z.string().min(1, 'Selecciona tu zona o distrito de entrega.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const CustomerProfilePage: React.FC = () => {
  const { currentUser, isMerchant, isAdmin, logout, updateCurrentUser } = useSession();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirigir a login si no hay sesión
  React.useEffect(() => {
    if (!currentUser) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CUSTOMER_PROFILE)}`);
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const userOrders = LocalStoreRepository.getOrdersByCustomer(currentUser.id);
  const pendingCount = userOrders.filter(
    (o) => o.status === 'pendiente' || o.status === 'confirmado' || o.status === 'preparado'
  ).length;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      dni: currentUser.dni || '',
      address: currentUser.address || '',
      zone: currentUser.zone || LOCATIONS[0] || 'Tingo María (Centro)',
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    const updated = {
      ...currentUser,
      name: values.name,
      email: values.email,
      phone: values.phone,
      dni: values.dni || undefined,
      address: values.address,
      zone: values.zone,
    };

    updateCurrentUser(updated);
    setSuccessMessage('¡Tus datos personales y de envío fueron actualizados con éxito!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Cabecera Principal del Perfil */}
        <div className={styles.profileHeaderCard}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarWrapper}>
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className={styles.avatarImg}
                />
              ) : (
                <div className={styles.avatarFallback}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className={styles.statusIndicator} title="Cuenta en línea y activa" />
            </div>

            <div className={styles.userInfo}>
              <h1>{currentUser.name}</h1>
              <span className={styles.userEmail}>
                <Mail size={14} /> {currentUser.email}
              </span>
              <div className={styles.badgesRow}>
                <span className={styles.roleBadge}>
                  {isAdmin
                    ? '🛡️ Super Administrador'
                    : isMerchant
                    ? '🏪 Emprendedor MYPE'
                    : '👤 Cliente Comprador'}
                </span>
                <span className={styles.statusBadgeActive}>
                  <CheckCircle size={12} /> Cuenta Activa
                </span>
              </div>
            </div>
          </div>

          <div className={styles.headerActions}>
            {isMerchant && (
              <Link to={ROUTES.MERCHANT_DASHBOARD}>
                <Button size="sm" variant="accent" leftIcon={<Store size={15} />}>
                  Ir a mi Panel de Tienda
                </Button>
              </Link>
            )}

            {isAdmin && (
              <Link to={ROUTES.ADMIN_DASHBOARD}>
                <Button size="sm" variant="accent" leftIcon={<ShieldCheck size={15} />}>
                  Ir al Panel Super Admin
                </Button>
              </Link>
            )}

            <Button
              size="sm"
              variant="outline"
              style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}
              leftIcon={<LogOut size={15} />}
              onClick={handleLogout}
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Tarjetas de Métricas Rápidas del Usuario */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className={styles.statLabel}>Mis Pedidos Totales</span>
              <span className={styles.statValue}>{userOrders.length} compras</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ color: '#b45309', backgroundColor: '#fef3c7' }}>
              <Package size={22} />
            </div>
            <div>
              <span className={styles.statLabel}>En Proceso / Espera</span>
              <span className={styles.statValue}>{pendingCount} pedidos</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ color: '#15803d', backgroundColor: '#dcfce7' }}>
              <MapPin size={22} />
            </div>
            <div>
              <span className={styles.statLabel}>Zona Preferida</span>
              <span className={styles.statValue} style={{ fontSize: '15px' }}>
                {currentUser.zone || 'Tingo María'}
              </span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ color: '#0369a1', backgroundColor: '#e0f2fe' }}>
              <Phone size={22} />
            </div>
            <div>
              <span className={styles.statLabel}>WhatsApp de Contacto</span>
              <span className={styles.statValue} style={{ fontSize: '15px' }}>
                {currentUser.phone}
              </span>
            </div>
          </div>
        </div>

        {/* Notificación de Éxito al Guardar */}
        {successMessage && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="success">{successMessage}</Alert>
          </div>
        )}

        {/* Grid Principal: Formulario de Datos + Resumen Lateral */}
        <div className={styles.mainLayout}>
          {/* Columna Izquierda: Formulario de Datos del Perfil */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <User size={20} color="#0b4526" /> Mis Datos del Perfil
            </h2>
            <p className={styles.cardSubtitle}>
              Mantén tu información y dirección actualizadas para que las tiendas de Tingo María y la Selva Central coordinen tus pedidos de forma rápida y segura.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGrid}>
                <Input
                  label="Nombre Completo"
                  isRequired
                  placeholder="Ej. Lucía Ramos Córdova"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Correo Electrónico"
                  isRequired
                  type="email"
                  placeholder="ejemplo@correo.pe"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className={styles.formGrid} style={{ marginTop: '16px' }}>
                <Input
                  label="Celular / WhatsApp para Coordinar"
                  isRequired
                  placeholder="Ej. 984512301"
                  helperText="Las tiendas te escribirán a este número."
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label="DNI o Carné de Extranjería (Opcional)"
                  placeholder="Ej. 72391048"
                  error={errors.dni?.message}
                  {...register('dni')}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <Select
                  label="Distrito / Zona en Tingo María y Selva Central"
                  isRequired
                  options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                  error={errors.zone?.message}
                  {...register('zone')}
                />
              </div>

              <div style={{ marginTop: '16px' }}>
                <Input
                  label="Dirección o Referencia de Entrega Domiciliaria"
                  isRequired
                  placeholder="Ej. Av. Tito Jaime 320, frente a la plaza principal"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>

              <div className={styles.formActions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(ROUTES.CATALOG)}
                >
                  Ir al Catálogo
                </Button>

                <Button
                  type="submit"
                  variant="accent"
                  isLoading={isSubmitting}
                  leftIcon={<Save size={16} />}
                >
                  {isDirty ? 'Guardar Cambios' : 'Datos Guardados'}
                </Button>
              </div>
            </form>
          </div>

          {/* Columna Derecha: Acceso a Pedidos y Enlaces Útiles */}
          <div>
            <div className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0b4526', margin: 0 }}>
                  Mis Últimas Compras
                </h3>
                <Link
                  to={ROUTES.CUSTOMER_ORDERS}
                  style={{ fontSize: '12px', fontWeight: 700, color: '#166534', textDecoration: 'none' }}
                >
                  Ver todos ›
                </Link>
              </div>

              {userOrders.length > 0 ? (
                <div className={styles.recentOrdersList}>
                  {userOrders.slice(0, 3).map((order) => (
                    <Link
                      key={order.id}
                      to={ROUTES.CUSTOMER_ORDER_DETAIL(order.id)}
                      className={styles.recentOrderItem}
                    >
                      <div>
                        <span className={styles.recentOrderCode}>{order.orderCode}</span>
                        <div className={styles.recentOrderStore}>
                          {order.businessName.length > 25
                            ? `${order.businessName.substring(0, 25)}...`
                            : order.businessName}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={styles.recentOrderTotal}>
                          {formatMoney(order.totalCents)}
                        </span>
                        <div style={{ marginTop: '4px' }}>
                          <OrderStatusBadge status={order.status} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 8px', color: '#64748b', fontSize: '13px' }}>
                  <ShoppingBag size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                  <p style={{ margin: '0 0 10px 0' }}>Aún no has registrado pedidos en JUÁCIL.</p>
                  <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.CATALOG)}>
                    Explorar Productos
                  </Button>
                </div>
              )}

              {userOrders.length > 0 && (
                <Link
                  to={ROUTES.CUSTOMER_ORDERS}
                  style={{ textDecoration: 'none', display: 'block', marginTop: '16px' }}
                >
                  <Button fullWidth size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
                    Ver Historial Completo ({userOrders.length})
                  </Button>
                </Link>
              )}
            </div>

            {/* Tarjeta de Seguridad y Ayuda */}
            <div className={styles.card} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', marginBottom: '8px' }}>
                <ShieldCheck size={20} />
                <strong style={{ fontSize: '14px' }}>Compras Seguras & Soporte</strong>
              </div>
              <p style={{ fontSize: '12px', color: '#14532d', margin: '0 0 12px 0', lineHeight: 1.5 }}>
                En JUÁCIL todos tus pedidos van directamente a los productores locales de Leoncio Prado. ¿Tienes alguna duda con una compra?
              </p>
              <Link to={ROUTES.HELP} style={{ textDecoration: 'none' }}>
                <Button size="sm" variant="outline" fullWidth style={{ borderColor: '#86efac', color: '#166534', backgroundColor: '#ffffff' }}>
                  Centro de Ayuda & WhatsApp
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
