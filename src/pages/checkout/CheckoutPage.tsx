import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCart } from '@/app/providers/CartProvider';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { buildOrderWhatsAppMessage, createWhatsAppLink } from '@/shared/lib/whatsapp';
import { Order } from '@/entities/order/model/types';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Alert } from '@/shared/ui/Alert';
import {
  CheckCircle2,
  Truck,
  Store,
  MessageCircle,
  Lock,
} from 'lucide-react';
import styles from './CheckoutPage.module.css';

const checkoutSchema = z.object({
  customerName: z.string().min(3, 'Ingresa tu nombre completo (mínimo 3 caracteres).'),
  customerPhone: z
    .string()
    .regex(/^9\d{8}$/, 'Ingresa un número de celular peruano válido (9 dígitos comenzando con 9).'),
  deliveryType: z.enum(['pickup', 'delivery']),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { currentUser, loginAs } = useSession();
  const { isOnline } = useConnectivity();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: currentUser?.name || '',
      customerPhone: currentUser?.phone || '',
      deliveryType: 'delivery',
      deliveryAddress: currentUser?.address || '',
      notes: '',
    },
  });

  const selectedDeliveryType = watch('deliveryType');

  // Si no hay productos en carrito y no acabamos de completar una orden
  if (cart.items.length === 0 && !completedOrder) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ textAlign: 'center', padding: '64px 16px' }}>
          <h2>No tienes productos para confirmar</h2>
          <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
            Tu carrito se encuentra vacío. Selecciona artículos en el catálogo para iniciar un pedido.
          </p>
          <Button variant="primary" onClick={() => navigate(ROUTES.CATALOG)}>
            Ver Catálogo
          </Button>
        </div>
      </div>
    );
  }

  // Si no ha iniciado sesión, requerir login antes de completar la orden
  if (!currentUser && !completedOrder) {
    return (
      <div className={styles.page}>
        <div className="container" style={{ maxWidth: '580px', padding: '48px 16px' }}>
          <div className={styles.formCard} style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Lock size={32} />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0b4526', marginBottom: '8px' }}>
              Inicia sesión para confirmar tu pedido
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
              Para garantizar la entrega y permitir que la tienda <strong>{cart.businessName}</strong> se comunique contigo vía WhatsApp con el seguimiento de tu compra, por favor identifícate en JUÁCIL.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                variant="accent"
                size="lg"
                onClick={() => navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CHECKOUT)}`)}
              >
                Iniciar Sesión / Registrarme
              </Button>
              <Button
                variant="outline"
                size="md"
                onClick={() => loginAs('user-client-01')}
              >
                Continuar con 1 Clic (Lucía Ramos - Cliente Demo)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vista de Éxito tras registrar el pedido (Criterio 2)
  if (completedOrder) {
    const business = LocalStoreRepository.getBusinessById(completedOrder.businessId);
    const waText = business
      ? buildOrderWhatsAppMessage({
          orderCode: completedOrder.orderCode,
          customerName: completedOrder.customerName,
          businessName: completedOrder.businessName,
          items: completedOrder.items.map((i) => ({
            name: i.productName,
            quantity: i.quantity,
            subtotalFormatted: formatMoney(i.subtotalCents),
          })),
          totalFormatted: formatMoney(completedOrder.totalCents),
          deliveryType: completedOrder.deliveryType,
          deliveryAddress: completedOrder.deliveryAddress,
        })
      : '';
    const waLink = business ? createWhatsAppLink(business.whatsapp, waText) : '#';

    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.successCard}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-success)' }}>
              <CheckCircle2 size={36} />
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              ¡Pedido Registrado con Éxito!
            </h1>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Tu orden ha sido reservada en el sistema de demostración de JUÁCIL.
            </p>

            <div>
              <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)', display: 'block', marginBottom: '4px' }}>
                CÓDIGO DE SEGUIMIENTO:
              </span>
              <span className={styles.orderCodeBadge}>{completedOrder.orderCode}</span>
            </div>

            <div style={{ background: 'var(--color-surface-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', textAlign: 'left', fontSize: '13px' }}>
              <p><strong>MYPE:</strong> {completedOrder.businessName}</p>
              <p><strong>Total:</strong> {formatMoney(completedOrder.totalCents)}</p>
              <p><strong>Modalidad:</strong> {completedOrder.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Envío a domicilio'}</p>
            </div>

            <Alert variant="info">
              Para coordinar el pago (Yape/Plin/Transferencia) y la entrega, pulsa el botón a continuación
              para contactar a la tienda con el mensaje estructurado de tu orden.
            </Alert>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <a href={waLink} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button fullWidth size="lg" variant="accent" leftIcon={<MessageCircle size={18} color="#062413" />}>
                  Coordinar con la tienda por WhatsApp
                </Button>
              </a>

              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate(ROUTES.CUSTOMER_ORDER_DETAIL(completedOrder.id))}
              >
                Ver Detalle en "Mis Pedidos"
              </Button>

              <Button variant="ghost" onClick={() => navigate(ROUTES.CATALOG)}>
                Seguir explorando el Catálogo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (values: CheckoutFormValues) => {
    if (!isOnline) {
      setSubmissionError('No es posible registrar nuevos pedidos sin conexión a internet.');
      return;
    }

    if (!cart.businessId) return;

    // Prevención de doble clic y reserva única (P05)
    setIsSubmitting(true);
    setSubmissionError(null);

    // Simulación de retraso de red (250ms)
    setTimeout(() => {
      const result = LocalStoreRepository.createOrder({
        businessId: cart.businessId!,
        customerId: currentUser ? currentUser.id : 'guest-client',
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        deliveryType: values.deliveryType,
        deliveryAddress: values.deliveryType === 'delivery' ? values.deliveryAddress : undefined,
        notes: values.notes,
        items: cart.items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
        })),
      });

      if (result.success) {
        clearCart();
        setCompletedOrder(result.order);
      } else {
        setSubmissionError(result.error);
        setIsSubmitting(false);
      }
    }, 250);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        <h1 className={styles.title}>Confirmar Pedido</h1>

        {!isOnline && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="danger" title="Sin conexión a internet">
              No es posible registrar nuevos pedidos en modo offline. Por favor, desactiva la
              simulación sin conexión en la barra superior para continuar.
            </Alert>
          </div>
        )}

        {submissionError && (
          <div style={{ marginBottom: '24px' }}>
            <Alert variant="danger" title="No se pudo procesar el pedido">
              {submissionError}
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={styles.layout}>
          {/* Formulario de Datos */}
          <div className={styles.formCard}>
            <div className={styles.sectionHeader}>
              <Store size={20} color="var(--color-primary-800)" />
              <span>Datos del Comprador</span>
            </div>

            <Input
              label="Nombre y Apellidos"
              isRequired
              placeholder="Ej. Lucía Ramos Córdova"
              error={errors.customerName?.message}
              {...register('customerName')}
            />

            <Input
              label="Número de WhatsApp para coordinar"
              isRequired
              placeholder="Ej. 984512301"
              helperText="El negocio se comunicará a este número para confirmar tu pedido."
              error={errors.customerPhone?.message}
              {...register('customerPhone')}
            />

            <div className={styles.sectionHeader}>
              <Truck size={20} color="var(--color-primary-800)" />
              <span>Modalidad de Entrega</span>
            </div>

            <div className={styles.radioGroup}>
              <label
                className={[
                  styles.radioOption,
                  selectedDeliveryType === 'delivery' ? styles.radioOptionSelected : '',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value="delivery"
                  {...register('deliveryType')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>Envío a Domicilio</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Coordinarás la dirección y el costo del flete con la MYPE.
                  </span>
                </div>
              </label>

              <label
                className={[
                  styles.radioOption,
                  selectedDeliveryType === 'pickup' ? styles.radioOptionSelected : '',
                ].join(' ')}
              >
                <input
                  type="radio"
                  value="pickup"
                  {...register('deliveryType')}
                  style={{ marginTop: '3px' }}
                />
                <div>
                  <strong style={{ display: 'block', fontSize: '14px' }}>Recojo en Tienda</strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                    Pasarás a recoger el paquete al local del productor en la Selva.
                  </span>
                </div>
              </label>
            </div>

            {selectedDeliveryType === 'delivery' && (
              <Input
                label="Dirección o Referencia de Entrega"
                isRequired
                placeholder="Ej. Av. Circunvalación 450, cerca al parque principal"
                error={errors.deliveryAddress?.message}
                {...register('deliveryAddress')}
              />
            )}

            <Textarea
              label="Instrucciones o notas adicionales (opcional)"
              placeholder="Ej. Prefiero que me escriban por WhatsApp después de las 3:00 pm."
              {...register('notes')}
            />
          </div>

          {/* Resumen Lateral */}
          <aside className={styles.summaryCard} aria-label="Resumen de la orden">
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Resumen de Compra</h2>

            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              Comprando en: <strong>{cart.businessName}</strong>
            </div>

            <div className={styles.itemsSummary}>
              {cart.items.map((item) => (
                <div key={item.productId} className={styles.summaryItem}>
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <strong>{formatMoney(item.subtotalCents)}</strong>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800 }}>
              <span>Total a Pagar:</span>
              <span>{formatMoney(cart.totalCents)}</span>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)', lineHeight: 1.4 }}>
              🔒 <strong>Simulación Segura:</strong> Al pulsar confirmar, se valida y descuenta el
              stock en tiempo real. No se solicita número de tarjeta de crédito real.
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              variant="accent"
              isLoading={isSubmitting}
              disabled={isSubmitting || !isOnline}
              leftIcon={<Lock size={16} />}
            >
              Confirmar Pedido (Simulado)
            </Button>
          </aside>
        </form>
      </div>
    </div>
  );
};
