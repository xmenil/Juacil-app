import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Store, Truck, MapPin } from 'lucide-react';
import { useCart } from '@/app/providers/CartProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import type { User } from '@/entities/user/model/types';
import type { Order } from '@/entities/order/model/types';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { checkoutSchema, reviewCheckoutCart, type CheckoutValues } from './checkoutModel';
import { CheckoutSummary } from './CheckoutSummary';
import styles from './CheckoutPage.module.css';
import { selectCartItems } from '@/features/cart/cartSelection';

const waitForDemo = () => new Promise<void>(resolve => window.setTimeout(resolve, 250));

export function CheckoutForm({ user, onCompleted, selectedIds = null }: { user: User; onCompleted: (orders: Order[]) => void; selectedIds?: string[] | null }) {
  const { cart: fullCart, removeItem } = useCart();
  const cart = selectCartItems(fullCart, selectedIds);
  const { isOnline } = useConnectivity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');
  const [, refreshReview] = useState(0);
  const review = reviewCheckoutCart(cart);
  const locked = useRef(false);
  const mounted = useRef(true);
  const latest = useRef({ cart, user, isOnline });
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => { latest.current = { cart, user, isOnline }; }, [cart, user, isOnline]);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (submissionError) errorRef.current?.focus(); }, [submissionError]);
  const { register, handleSubmit, control, formState: { errors } } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: user.name, customerPhone: user.phone, deliveryType: 'delivery', deliveryAddress: user.address || '', notes: '' },
  });
  const deliveryType = useWatch({ control, name: 'deliveryType' });
  const submit = async (values: CheckoutValues) => {
    if (locked.current) return;
    locked.current = true;
    setIsSubmitting(true); setSubmissionError('');
    try {
      await waitForDemo();
      if (!mounted.current) return;
      const snapshot = latest.current;
      if (!snapshot.isOnline) { setSubmissionError('Estás sin conexión. Tus datos se conservan; vuelve a intentar cuando tengas conexión.'); return; }
      const account = LocalStoreRepository.getUserById(snapshot.user.id);
      if (!account || account.role !== 'cliente' || account.status === 'suspended') { setSubmissionError('Tu cuenta no está disponible para registrar pedidos. Revisa tu acceso.'); return; }
      const freshReview = reviewCheckoutCart(snapshot.cart);
      if (freshReview.issue) { setSubmissionError(freshReview.issue); refreshReview(value => value + 1); return; }
      if (freshReview.signature !== review.signature) {
        setSubmissionError('El carrito o los precios cambiaron. Revisa el resumen actualizado y confirma nuevamente.');
        refreshReview(value => value + 1); return;
      }
      // Un pedido por tienda: cada negocio confirma y coordina su propia entrega.
      const created: Order[] = [];
      for (const group of freshReview.groups) {
        const result = LocalStoreRepository.createOrder({
          businessId: group.businessId, customerId: snapshot.user.id,
          customerName: values.customerName, customerPhone: values.customerPhone, deliveryType: values.deliveryType,
          deliveryAddress: values.deliveryType === 'delivery' ? values.deliveryAddress : undefined,
          notes: values.notes || undefined, items: group.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
        });
        if (!result.success) {
          setSubmissionError(created.length
            ? `Se registraron ${created.length} de ${freshReview.groups.length} pedidos (${created.map(order => order.orderCode).join(', ')}). ${result.error}`
            : result.error);
          refreshReview(value => value + 1);
          return;
        }
        created.push(result.order);
        group.items.forEach(item => removeItem(item.productId));
      }
      onCompleted(created);
    } catch {
      if (mounted.current) setSubmissionError('No se pudo registrar el pedido. Tus datos y tu carrito se conservan. Inténtalo nuevamente.');
    } finally {
      locked.current = false;
      if (mounted.current) setIsSubmitting(false);
    }
  };
  return <>
    <Link className={styles.backLink} to={ROUTES.CART}><ArrowLeft size={17} aria-hidden="true" />Volver al carrito</Link>
    <header className={styles.header}><p className={styles.eyebrow}>Carrito / Datos del pedido</p><h1>Completa tu pedido</h1><p>{review.groups.length > 1 ? `Tu carrito tiene productos de ${review.groups.length} tiendas: se registrará un pedido para cada una.` : 'Indica cómo contactarte y acuerda la entrega o el recojo con la tienda.'}</p></header>
    {!isOnline && <div className={styles.warning} role="status"><strong>Estás sin conexión</strong><p>Puedes completar los datos. Para registrar el pedido, necesitarás conexión.</p></div>}
    {review.issue && !submissionError && <div className={styles.warning} role="alert"><p>{review.issue}</p><Link to={ROUTES.CART}>Revisar carrito</Link></div>}
    {submissionError && <div ref={errorRef} className={styles.error} role="alert" tabIndex={-1}><strong>No se registró el pedido</strong><p>{submissionError}</p>{review.issue && <Link to={ROUTES.CART}>Revisar carrito</Link>}</div>}
    <form aria-label="Datos del pedido" noValidate onSubmit={event => { void handleSubmit(submit)(event); }} className={styles.layout}>
      <div className={styles.formPanel}>
        <fieldset disabled={isSubmitting} className={styles.fieldset}>
          <legend>1. Datos de contacto</legend><p className={styles.sectionNote}>La tienda usará estos datos para coordinar contigo.</p>
          <Input id="checkout-name" label="Nombre y apellidos" autoComplete="name" isRequired error={errors.customerName?.message} {...register('customerName')} />
          <Input id="checkout-phone" label="Celular para coordinar" autoComplete="tel" inputMode="tel" isRequired placeholder="987 654 321" error={errors.customerPhone?.message} {...register('customerPhone')} />
        </fieldset>
        <fieldset disabled={isSubmitting} className={styles.fieldset}>
          <legend>2. Entrega o recojo</legend><p className={styles.sectionNote}>La disponibilidad y los horarios se confirman con el negocio.</p>
          <div className={styles.deliveryOptions}>
            <label className={deliveryType === 'delivery' ? styles.deliverySelected : styles.deliveryOption}><input type="radio" value="delivery" {...register('deliveryType')} /><Truck size={21} aria-hidden="true" /><span><strong>Entrega a domicilio</strong><small>Dirección y costo por coordinar.</small></span></label>
            <label className={deliveryType === 'pickup' ? styles.deliverySelected : styles.deliveryOption}><input type="radio" value="pickup" {...register('deliveryType')} /><Store size={21} aria-hidden="true" /><span><strong>Recojo en tienda</strong><small>Acuerda el horario con el negocio.</small></span></label>
          </div>
          {deliveryType === 'delivery' ? <Input id="checkout-address" label="Dirección y referencia de entrega" autoComplete="street-address" isRequired placeholder="Calle, número y una referencia para llegar" helperText="La tienda confirmará si puede realizar la entrega a esta dirección." error={errors.deliveryAddress?.message} {...register('deliveryAddress')} />
            : <p className={styles.pickupLocation}><MapPin size={16} aria-hidden="true" /><span>{review.groups.length > 1 ? review.groups.map(group => group.business?.location).filter(Boolean).join(' · ') : review.business?.location || 'Consulta la ubicación con la tienda'}<small>Confirma el punto exacto de recojo al coordinar.</small></span></p>}
          <Textarea id="checkout-notes" label="Notas para la tienda (opcional)" placeholder="Ej. Escríbeme por WhatsApp para acordar el horario." maxLength={500} rows={3} error={errors.notes?.message} {...register('notes')} />
        </fieldset>
      </div>
      <CheckoutSummary review={review} deliveryType={deliveryType} isSubmitting={isSubmitting} isOnline={isOnline} />
    </form>
  </>;
}
