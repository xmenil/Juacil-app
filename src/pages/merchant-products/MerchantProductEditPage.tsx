import React, { useState } from 'react';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product } from '@/entities/product/model/types';
import { ProductForm } from '@/features/product-management/ProductForm';
import { ROUTES } from '@/shared/config/routes';
import { ProductEditorFrame } from '@/features/product-management/ProductEditorFrame';
import { Button } from '@/shared/ui/Button';

export const MerchantProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = id ? LocalStoreRepository.getProductById(id) : undefined;

  // Verificación estricta de propiedad (P06): Aislamiento y denegación de recurso ajeno
  if (!isMerchant || !businessId || (product && product.businessId !== businessId)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
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
      navigate(ROUTES.MERCHANT_PRODUCTS, { state: { productNotice: 'Cambios del producto guardados.' } });
    }, 200);
  };


  return (
    <ProductEditorFrame title="Editar producto" description={product.name}>
      <ProductForm initialProduct={product} onSubmit={handleUpdate} onCancel={() => navigate(ROUTES.MERCHANT_PRODUCTS)} isSubmitting={isSubmitting} />
    </ProductEditorFrame>
  );
};
