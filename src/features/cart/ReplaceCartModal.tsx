import React from 'react';
import { useCart } from '@/app/providers/CartProvider';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { AlertTriangle } from 'lucide-react';
import styles from './ReplaceCartModal.module.css';

export const ReplaceCartModal: React.FC = () => {
  const {
    isReplaceModalOpen,
    pendingItem,
    currentBusinessName,
    confirmReplaceCart,
    cancelReplaceCart,
  } = useCart();

  if (!isReplaceModalOpen || !pendingItem) return null;

  return (
    <Modal
      isOpen={isReplaceModalOpen}
      onClose={cancelReplaceCart}
      title="¿Reemplazar productos del carrito?"
      footer={
        <>
          <Button variant="outline" onClick={cancelReplaceCart}>
            Conservar carrito actual
          </Button>
          <Button variant="accent" onClick={confirmReplaceCart}>
            Sí, cambiar de tienda
          </Button>
        </>
      }
    >
      <div className={styles.container}>
        <div className={styles.iconBox} aria-hidden="true">
          <AlertTriangle size={28} className={styles.icon} />
        </div>
        <div className={styles.content}>
          <p className={styles.lead}>
            Tu carrito ya contiene artículos de <strong>{currentBusinessName}</strong>.
          </p>
          <p className={styles.detail}>
            Para garantizar la frescura y la coordinación directa con las MYPES de la Selva,
            cada pedido en <strong>JUÁCIL</strong> se gestiona con un solo emprendimiento a la vez.
          </p>
          <div className={styles.replacementBox}>
            <span className={styles.sublabel}>Nuevo producto a ingresar:</span>
            <span className={styles.newProdName}>{pendingItem.product.name}</span>
          </div>
          <p className={styles.warningNote}>
            Si continúas, los productos de {currentBusinessName} se retirarán del carrito.
          </p>
        </div>
      </div>
    </Modal>
  );
};
