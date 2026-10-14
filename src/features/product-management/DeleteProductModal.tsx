import React from 'react';
import { Product } from '@/entities/product/model/types';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Alert } from '@/shared/ui/Alert';

export const DeleteProductModal: React.FC<{ product: Product | null; onClose: () => void; onConfirm: () => void; error?: string }> = ({ product, onClose, onConfirm, error }) => (
  <Modal isOpen={Boolean(product)} onClose={onClose} title="¿Eliminar este producto?"
    footer={<><Button variant="outline" onClick={onClose}>Volver al catálogo</Button><Button variant="danger" onClick={onConfirm}>Eliminar producto</Button></>}>
    <p>Se retirará <strong>{product?.name}</strong> del catálogo y de tu lista de productos.</p>
    {error && <Alert variant="danger">{error}</Alert>}
  </Modal>
);
