import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-management/ProductForm';
import { ROUTES } from '@/shared/config/routes';
import { ProductEditorFrame } from '@/features/product-management/ProductEditorFrame';

export const MerchantProductNewPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isMerchant || !businessId) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
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
      navigate(ROUTES.MERCHANT_PRODUCTS, { state: { productNotice: 'Producto guardado.' } });
    }, 200);
  };


  return (
    <ProductEditorFrame title="Agregar producto" description="Completa la información y elige si lo publicas o lo guardas como borrador.">
      <ProductForm onSubmit={handleCreate} onCancel={() => navigate(ROUTES.MERCHANT_PRODUCTS)} isSubmitting={isSubmitting} />
    </ProductEditorFrame>
  );
};
