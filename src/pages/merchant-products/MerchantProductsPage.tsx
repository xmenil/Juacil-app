import React, { useState } from 'react';
import { Navigate, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product, ProductStatus } from '@/entities/product/model/types';
import { ROUTES } from '@/shared/config/routes';
import { ProductList } from '@/features/product-management/ProductList';
import { DeleteProductModal } from '@/features/product-management/DeleteProductModal';
import { getProductFilter } from '@/features/product-management/productFilters';

export const MerchantProductsPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStatus = getProductFilter(searchParams.get('filtro'));
  const search = searchParams.get('q') || '';
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(
    state?.productNotice ? { type: 'success', message: state.productNotice } : null);

  if (!isMerchant || !businessId) return <Navigate to={ROUTES.FORBIDDEN} replace />;
  const products = LocalStoreRepository.getProductsByBusiness(businessId);
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'published') return matchesSearch && product.status === 'published';
    if (filterStatus === 'draft') return matchesSearch && product.status === 'draft';
    if (filterStatus === 'outOfStock') return matchesSearch && product.stock === 0;
    return matchesSearch;
  });

  const changeFilter = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filtro', value);
    setSearchParams(nextParams);
  };
  const changeSearch = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('q', value); else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };
  const clearFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filtro', 'all');
    nextParams.delete('q');
    setSearchParams(nextParams);
  };
  const handleToggleStatus = (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'published' ? 'draft' : 'published';
    LocalStoreRepository.saveProduct({ ...product, status: nextStatus });
    setFeedback({ type: 'success', message: nextStatus === 'published' ? `Producto publicado: ${product.name}.` : `Producto en borrador: ${product.name}.` });
  };
  const handleConfirmDelete = () => {
    if (deleteProductCandidate) {
      const deleted = LocalStoreRepository.deleteProduct(deleteProductCandidate.id);
      setFeedback({ type: deleted ? 'success' : 'danger', message: deleted ? 'Producto eliminado del catálogo.' : 'No pudimos eliminar el producto. Intenta nuevamente.' });
      if (deleted) setDeleteProductCandidate(null);
    }
  };
  return <>
    <ProductList products={products} filteredProducts={filteredProducts} filter={filterStatus} search={search} feedback={deleteProductCandidate ? null : feedback}
      onFilterChange={changeFilter} onSearchChange={changeSearch} onClearFilters={clearFilters}
      onCreate={() => navigate(ROUTES.MERCHANT_PRODUCT_NEW)} onEdit={product => navigate(ROUTES.MERCHANT_PRODUCT_EDIT(product.id))}
      onToggleStatus={handleToggleStatus} onDelete={product => { setFeedback(null); setDeleteProductCandidate(product); }} />
    <DeleteProductModal product={deleteProductCandidate} onClose={() => setDeleteProductCandidate(null)} onConfirm={handleConfirmDelete}
      error={feedback?.type === 'danger' ? feedback.message : undefined} />
  </>;
};
