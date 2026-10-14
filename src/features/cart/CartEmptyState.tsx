import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './CartEmptyState.module.css';

export function CartEmptyState({ onBrowse, compact = false }: { onBrowse: () => void; compact?: boolean }) {
  const Heading = compact ? 'h3' : 'h1';
  return <div className={styles.empty}>
    <span className={styles.icon}><ShoppingBag size={32} aria-hidden="true" /></span>
    <Heading>Tu carrito está vacío</Heading>
    <p>Encuentra productos de las MYPES de la Selva y agrégalos para preparar tu pedido.</p>
    <Button onClick={onBrowse} rightIcon={<ArrowRight size={18} />}>Explorar productos</Button>
  </div>;
}
