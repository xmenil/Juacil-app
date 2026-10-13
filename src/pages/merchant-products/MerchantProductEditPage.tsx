import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-management/ProductForm';
import { ROUTES } from '@/shared/config/routes';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const MerchantProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = id ? LocalStoreRepository.getProductById(id) : undefined;

  // Verificación estricta de propiedad (P06): Aislamiento y denegación de recurso ajeno
  if (!isMerchant || !businessId || (product && product.businessId !== businessId)) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '64px 16px', textAlign: 'center' }}>
        <h2>Producto no encontrado</h2>
        <Button variant="primary" onClick={() => navigate(ROUTES.MERCHANT_PRODUCTS)}>
          Volver a Mis Productos
        </Button>
      </div>
    );
  }

  const handleUpdate = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      LocalStoreRepository.saveProduct({
        ...data,
        id: product.id,
        businessId: product.businessId,
        createdAt: product.createdAt,
        updatedAt: new Date().toISOString(),
      });
      setIsSubmitting(false);
      navigate(ROUTES.MERCHANT_PRODUCTS);
    }, 200);
  };

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <Link
          to={ROUTES.MERCHANT_PRODUCTS}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver a Mis Productos
        </Link>

        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              Editar Producto: {product.name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Actualiza precios, disponibilidad de stock o detalles de presentación.
            </p>
          </div>

          <ProductForm
            initialProduct={product}
            onSubmit={handleUpdate}
            onCancel={() => navigate(ROUTES.MERCHANT_PRODUCTS)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
