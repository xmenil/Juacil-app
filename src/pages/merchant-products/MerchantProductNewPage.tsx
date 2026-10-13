import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-management/ProductForm';
import { ROUTES } from '@/shared/config/routes';
import { ArrowLeft } from 'lucide-react';

export const MerchantProductNewPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isMerchant || !businessId) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const handleCreate = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true);
    setTimeout(() => {
      LocalStoreRepository.saveProduct({
        ...data,
        id: '', // será generado automáticamente
        businessId,
        createdAt: new Date().toISOString(),
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
              Publicar Nuevo Producto
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Completa los datos técnicos y la fotografía para exhibir tu producto en el catálogo.
            </p>
          </div>

          <ProductForm
            onSubmit={handleCreate}
            onCancel={() => navigate(ROUTES.MERCHANT_PRODUCTS)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
