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
import { Card } from '@/shared/ui/Card';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import {
  User,
  LogOut,
  Store,
  ShieldCheck,
  ArrowRight,
  Save,
} from 'lucide-react';
import styles from './CustomerProfilePage.module.css';

const profileSchema = z.object({
  name: z.string().min(3, 'Ingresa tu nombre completo, con al menos 3 caracteres.'),
  email: z.string().email('Ingresa un correo electrónico válido.'),
  phone: z
    .string()
    .regex(/^9\d{8}$/, 'Ingresa un celular de 9 dígitos que empiece con 9.'),
  dni: z
    .string()
    .refine((val) => val === '' || /^\d{8}$/.test(val), {
      message: 'Ingresa un DNI de 8 dígitos o deja este campo vacío.',
    }),
  address: z.string().min(5, 'Ingresa una dirección o referencia de al menos 5 caracteres.'),
  zone: z.string().min(1, 'Selecciona tu zona de entrega.'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export const CustomerProfilePage: React.FC = () => {
  const { currentUser } = useSession();
  const navigate = useNavigate();

  // Redirigir a login si no hay sesión
  React.useEffect(() => {
    if (!currentUser) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CUSTOMER_PROFILE)}`);
    }
  }, [currentUser, navigate]);

  return currentUser ? <CustomerAccountContent key={currentUser.id} /> : null;
};

const CustomerAccountContent: React.FC = () => {
  const { currentUser: sessionUser, isMerchant, isAdmin, logout, updateCurrentUser } = useSession();
  // La guarda de sesión monta este componente únicamente con un usuario.
  const currentUser = sessionUser!;
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  const userOrders = LocalStoreRepository.getOrdersByCustomer(currentUser.id);
  const pendingCount = userOrders.filter(
    (o) => o.status === 'pendiente' || o.status === 'confirmado' || o.status === 'preparado'
  ).length;

  const {
    register,
    handleSubmit,
    reset,
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

    setSuccessMessage(null);
    setSaveError(null);
    try {
      updateCurrentUser(updated);
      reset(values);
      setSuccessMessage('Tus datos se guardaron.');
    } catch {
      setSaveError('No pudimos guardar tus datos. Intenta nuevamente.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Cabecera Principal del Perfil */}
        <header className={styles.profileHeaderCard}>
          <div className={styles.headerIntro}>
            <h1>Mi cuenta</h1>
            <p>Actualiza tus datos para coordinar tus pedidos con las tiendas.</p>
          </div>
          <div className={styles.headerLeft}>
            <div className={styles.avatarWrapper}>
              {currentUser.avatarUrl && currentUser.avatarUrl !== failedAvatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt=""
                  className={styles.avatarImg}
                  onError={() => setFailedAvatarUrl(currentUser.avatarUrl || null)}
                />
              ) : (
                <div className={styles.avatarFallback} aria-hidden="true">
                  {currentUser.name.trim().charAt(0).toUpperCase() || <User />}
                </div>
              )}
            </div>

            <div className={styles.userInfo}>
              <p className={styles.userName}>{currentUser.name}</p>
              <p className={styles.userEmail}>{currentUser.email}</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {isMerchant && (
              <Link className={styles.panelLink} to={ROUTES.MERCHANT_DASHBOARD}>
                <Store aria-hidden="true" /> Ir a mi panel de tienda
              </Link>
            )}

            {isAdmin && (
              <Link className={styles.panelLink} to={ROUTES.ADMIN_DASHBOARD}>
                <ShieldCheck aria-hidden="true" /> Ir al panel de administración
              </Link>
            )}

          </div>
        </header>

        <section aria-labelledby="account-orders-title">
          <Card variant="subtle" className={styles.ordersOverview}>
            <div className={styles.ordersOverviewText}>
              <h2 id="account-orders-title">Mis pedidos</h2>
              <p>
                {userOrders.length === 0
                  ? 'Aún no tienes pedidos en JUÁCIL.'
                  : pendingCount === 0
                    ? 'No tienes pedidos en proceso.'
                    : pendingCount === 1
                      ? 'Tienes 1 pedido en proceso.'
                      : `Tienes ${pendingCount} pedidos en proceso.`}
              </p>
              {userOrders.length === 0 && (
                <p>Explora el catálogo y encuentra productos de las tiendas.</p>
              )}
            </div>
            <Link
              className={styles.ordersOverviewLink}
              to={userOrders.length === 0 ? ROUTES.CATALOG : ROUTES.CUSTOMER_ORDERS}
            >
              {userOrders.length === 0 ? 'Explorar catálogo' : 'Ver mis pedidos'}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Card>
        </section>

        {/* Grid Principal: Formulario de Datos + Resumen Lateral */}
        <div className={styles.mainLayout}>
          {/* Columna Izquierda: Formulario de Datos del Perfil */}
          <Card className={styles.profileFormCard}>
            <form
              className={styles.profileForm}
              noValidate
              onSubmit={handleSubmit(onSubmit)}
              onChange={() => { setSuccessMessage(null); setSaveError(null); }}
              aria-label="Editar mis datos"
            >
              <fieldset className={styles.formSection} disabled={isSubmitting}>
                <legend>Datos personales</legend>
                <p className={styles.formHint}>Los campos con * son obligatorios.</p>
              <div className={styles.formGrid}>
                <Input
                  label="Nombre completo"
                  autoComplete="name"
                  aria-required="true"
                  isRequired
                  placeholder="Ej. Lucía Ramos Córdova"
                  error={errors.name?.message}
                  {...register('name')}
                />

                <Input
                  label="Correo electrónico"
                  autoComplete="email"
                  aria-required="true"
                  isRequired
                  type="email"
                  placeholder="ejemplo@correo.pe"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>

              <div className={styles.formGrid}>
                <Input
                  label="Celular / WhatsApp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  aria-required="true"
                  isRequired
                  placeholder="Ej. 984512301"
                  helperText="Usa el número donde prefieres coordinar tus pedidos."
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                <Input
                  label="DNI (opcional)"
                  inputMode="numeric"
                  placeholder="Ej. 72391048"
                  error={errors.dni?.message}
                  {...register('dni')}
                />
              </div>
              </fieldset>

              <fieldset className={styles.formSection} disabled={isSubmitting}>
                <legend>Datos de entrega</legend>
                <Select
                  label="Zona de entrega"
                  aria-required="true"
                  isRequired
                  options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                  error={errors.zone?.message}
                  {...register('zone')}
                />
                <Input
                  label="Dirección o referencia"
                  autoComplete="street-address"
                  aria-required="true"
                  helperText="Incluye una referencia para facilitar la coordinación con la tienda."
                  isRequired
                  placeholder="Ej. Av. Tito Jaime 320, frente a la plaza principal"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </fieldset>

              {saveError && <Alert variant="danger">{saveError}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              {!isDirty && !successMessage && !saveError && (
                <p className={styles.formHint}>No tienes cambios pendientes.</p>
              )}

              <div className={styles.formActions}>
                <Button
                  type="submit"
                  variant="accent"
                  disabled={!isDirty}
                  isLoading={isSubmitting}
                  leftIcon={<Save className={styles.formActionIcon} />}
                >
                  {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={!isDirty || isSubmitting}
                  onClick={() => { reset(); setSuccessMessage(null); setSaveError(null); }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>

          {/* Columna Derecha: Acceso a Pedidos y Enlaces Útiles */}
          <aside className={styles.accountSidebar} aria-label="Pedidos recientes y ayuda">
            <Card className={styles.sidebarCard}>
              <h2 className={styles.sidebarTitle}>Últimos pedidos</h2>

              {userOrders.length > 0 ? (
                <ul className={styles.recentOrdersList}>
                  {userOrders.slice(0, 3).map((order) => (
                    <li key={order.id}>
                    <Link
                      to={ROUTES.CUSTOMER_ORDER_DETAIL(order.id)}
                      className={styles.recentOrderItem}
                    >
                      <div className={styles.recentOrderIdentity}>
                        <span className={styles.recentOrderCode}>{order.orderCode}</span>
                        <div className={styles.recentOrderStore}>
                          {order.businessName}
                        </div>
                      </div>

                      <div className={styles.recentOrderDetails}>
                        <span className={styles.recentOrderTotal}>
                          {formatMoney(order.totalCents)}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyOrders}>
                  <p>Aún no tienes pedidos en JUÁCIL.</p>
                  <p>Cuando hagas tu primera compra, podrás ver su estado aquí.</p>
                </div>
              )}
            </Card>

            {/* Tarjeta de Seguridad y Ayuda */}
            <section className={styles.helpSection} aria-labelledby="account-help-title">
              <h2 id="account-help-title" className={styles.sidebarTitle}>Ayuda con tus pedidos</h2>
              <p>
                Consulta cómo comprar y coordinar con una tienda.
              </p>
              <Link className={styles.ordersOverviewLink} to={ROUTES.HELP}>
                Ir al centro de ayuda <ArrowRight aria-hidden="true" />
              </Link>
            </section>
          </aside>
        </div>
        <div className={styles.sessionActions}>
          <Button
            variant="ghost"
            leftIcon={<LogOut className={styles.formActionIcon} />}
            onClick={handleLogout}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </div>
  );
};
