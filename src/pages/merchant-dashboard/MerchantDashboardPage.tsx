import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { Product, ProductStatus } from '@/entities/product/model/types';
import { OrderStatus } from '@/entities/order/model/types';
import { formatMoney } from '@/shared/lib/money';
import { ROUTES } from '@/shared/config/routes';
import { LOCATIONS, CATEGORIES } from '@/shared/config/constants';
import { buildOrderWhatsAppMessage, createWhatsAppLink } from '@/shared/lib/whatsapp';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Textarea } from '@/shared/ui/Textarea';
import { Alert } from '@/shared/ui/Alert';
import { ProductForm } from '@/features/product-management/ProductForm';
import { Save } from 'lucide-react';
import { MerchantSummary } from './MerchantSummary';
import { OrderList } from '@/features/order-management/OrderList';
import { OrderDetail, OrderNotFound } from '@/features/order-management/OrderDetail';
import { getOrderFilter } from '@/features/order-management/orderFilters';
import { ProductList } from '@/features/product-management/ProductList';
import { DeleteProductModal } from '@/features/product-management/DeleteProductModal';
import { getProductFilter } from '@/features/product-management/productFilters';
import profileStyles from '@/features/business-management/StoreProfile.module.css';
import { StoreImagePreview } from '@/features/business-management/StoreImagePreview';

export const MerchantDashboardPage: React.FC = () => {
  const { isMerchant, isAdmin, businessId } = useSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Si es admin o merchant pero no tiene businessId asignado, usar 'biz-cafe-aroma' por defecto
  const activeBusinessId = businessId || 'biz-cafe-aroma';
  const business = LocalStoreRepository.getBusinessById(activeBusinessId);

  // Pestaña activa sincronizada con la URL
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'pedidos' || tabParam === 'productos' || tabParam === 'perfil'
    ? tabParam : 'reportes';

  // Filtros de Productos y Pedidos
  const productFilter = getProductFilter(searchParams.get('filtro'));
  const productSearch = searchParams.get('q') || '';
  const [productFeedback, setProductFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const orderStatusFilter = getOrderFilter(searchParams.get('filtro'));
  const [orderFeedback, setOrderFeedback] = useState<{ orderId: string; type: 'success' | 'danger'; message: string } | null>(null);

  // Modales
  const [createProductModalOpen, setCreateProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  // Escuchar y sincronizar parámetros de la URL (?tab=..., ?crear=true, ?filtro=...)
  useEffect(() => {
    if (searchParams.get('crear') === 'true') {
      setCreateProductModalOpen(true);
    }

    const editId = searchParams.get('editar');
    if (editId) {
      const found = LocalStoreRepository.getProductById(editId);
      if (found) {
        setEditingProduct(found);
      }
    }
  }, [searchParams]);

  // Formulario de Datos de la Tienda
  const [storeName, setStoreName] = useState(business?.name || '');
  const [storeCategory, setStoreCategory] = useState(business?.category || 'cafe');
  const [storeLocation, setStoreLocation] = useState(business?.location || LOCATIONS[0] || 'Tingo María');
  const [storeWhatsapp, setStoreWhatsapp] = useState(business?.whatsapp || '');
  const [storeRuc, setStoreRuc] = useState(business?.ruc || '');
  const [storeSchedule, setStoreSchedule] = useState(business?.schedule || 'Lunes a Sábado: 8:00 am - 7:30 pm');
  const [storeDesc, setStoreDesc] = useState(business?.description || '');
  const [storeLogoUrl, setStoreLogoUrl] = useState(business?.logoUrl || '');
  const [storeBannerUrl, setStoreBannerUrl] = useState(business?.bannerUrl || '');
  const [storeUpdateSuccess, setStoreUpdateSuccess] = useState<string | null>(null);

  // Refresco de estado local
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  if (!isMerchant && !isAdmin) return <Navigate to={ROUTES.FORBIDDEN} replace />;

  if (!business) {
    return (
      <div className={profileStyles.page}>
        <div className={profileStyles.container}>
          <div className={profileStyles.emptyState}>
            <h2>No encontramos tu negocio</h2>
            <p>No pudimos cargar la información de tu emprendimiento.</p>
            <Button variant="primary" onClick={() => navigate(ROUTES.HOME)}>
              Volver al inicio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Datos de la tienda
  const products = LocalStoreRepository.getProductsByBusiness(business.id);
  const orders = LocalStoreRepository.getOrdersByBusiness(business.id);

  // Acciones de Pedidos
  const handleUpdateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    const result = LocalStoreRepository.updateOrderStatus(orderId, nextStatus);
    setOrderFeedback({ orderId, type: result.success ? 'success' : 'danger', message: result.success
      ? nextStatus === 'cancelado' ? 'Pedido cancelado. Las unidades reservadas volvieron al stock.' : nextStatus === 'confirmado' ? 'Pedido confirmado.' : nextStatus === 'preparado' ? 'Pedido preparado.' : 'Pedido entregado.'
      : result.error || 'No pudimos actualizar el pedido. Intenta nuevamente.' });
    refresh();
    return result.success;
  };

  // Acciones de Productos
  const closeCreateProduct = () => {
    setCreateProductModalOpen(false);
    if (searchParams.has('crear')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('crear');
      setSearchParams(nextParams, { replace: true });
    }
  };
  const closeEditProduct = () => {
    setEditingProduct(null);
    if (searchParams.has('editar')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('editar');
      setSearchParams(nextParams, { replace: true });
    }
  };
  const handleToggleProductStatus = (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'published' ? 'draft' : 'published';
    LocalStoreRepository.saveProduct({
      ...product,
      status: nextStatus,
    });
    setProductFeedback({ type: 'success', message: nextStatus === 'published' ? `Producto publicado: ${product.name}.` : `Producto en borrador: ${product.name}.` });
    refresh();
  };

  const handleCreateProductSubmit = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    LocalStoreRepository.saveProduct({
      ...data,
      id: '',
      businessId: business.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    closeCreateProduct();
    setProductFeedback({ type: 'success', message: 'Producto guardado.' });
    refresh();
  };

  const handleEditProductSubmit = (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      LocalStoreRepository.saveProduct({
        ...data,
        id: editingProduct.id,
        businessId: business.id,
        createdAt: editingProduct.createdAt,
        updatedAt: new Date().toISOString(),
      });
      closeEditProduct();
      setProductFeedback({ type: 'success', message: 'Cambios del producto guardados.' });
      refresh();
    }
  };

  const handleConfirmDeleteProduct = () => {
    if (deleteProductCandidate) {
      const deleted = LocalStoreRepository.deleteProduct(deleteProductCandidate.id);
      setProductFeedback({ type: deleted ? 'success' : 'danger', message: deleted ? 'Producto eliminado del catálogo.' : 'No pudimos eliminar el producto. Intenta nuevamente.' });
      if (deleted) setDeleteProductCandidate(null);
      refresh();
    }
  };

  // Guardar Datos de la Tienda
  const handleSaveStoreProfile = (e: React.FormEvent) => {
    e.preventDefault();
    LocalStoreRepository.saveBusiness({
      ...business,
      name: storeName.trim(),
      category: storeCategory,
      location: storeLocation,
      whatsapp: storeWhatsapp.trim(),
      ruc: storeRuc.trim() || undefined,
      schedule: storeSchedule.trim(),
      description: storeDesc.trim(),
      logoUrl: storeLogoUrl.trim() || business.logoUrl,
      bannerUrl: storeBannerUrl.trim() || business.bannerUrl,
    });
    setStoreUpdateSuccess('Los datos de tu tienda se actualizaron.');
    setTimeout(() => setStoreUpdateSuccess(null), 3500);
    refresh();
  };

  // Filtrado de Productos
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase());
    if (productFilter === 'published') return matchesSearch && p.status === 'published';
    if (productFilter === 'draft') return matchesSearch && p.status === 'draft';
    if (productFilter === 'outOfStock') return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  // Filtrado de Pedidos
  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'all') return o.status === orderStatusFilter;
    return true;
  });

  const ordersBackTo = `${ROUTES.MERCHANT_DASHBOARD}?tab=pedidos&filtro=${orderStatusFilter}`;
  const selectedOrderId = searchParams.get('pedido');
  const selectedOrder = orders.find(order => order.id === selectedOrderId);
  const changeOrderFilter = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'pedidos');
    nextParams.set('filtro', value);
    nextParams.delete('pedido');
    setSearchParams(nextParams);
  };
  let ordersContent: React.ReactNode;
  if (selectedOrderId) {
    if (selectedOrder) {
      const waText = buildOrderWhatsAppMessage({
        orderCode: selectedOrder.orderCode,
        customerName: selectedOrder.customerName,
        businessName: business.name,
        items: selectedOrder.items.map(item => ({
          name: item.productName,
          quantity: item.quantity,
          subtotalFormatted: formatMoney(item.subtotalCents),
        })),
        totalFormatted: formatMoney(selectedOrder.totalCents),
        deliveryType: selectedOrder.deliveryType,
        deliveryAddress: selectedOrder.deliveryAddress,
      });
      ordersContent = <OrderDetail key={selectedOrder.id} order={selectedOrder} backTo={ordersBackTo}
        whatsappUrl={createWhatsAppLink(selectedOrder.customerPhone, waText)}
        feedback={orderFeedback?.orderId === selectedOrder.id ? orderFeedback : null}
        onAdvance={status => { handleUpdateOrderStatus(selectedOrder.id, status); }}
        onCancel={() => handleUpdateOrderStatus(selectedOrder.id, 'cancelado')} />;
    } else {
      ordersContent = <OrderNotFound backTo={ordersBackTo} />;
    }
  } else {
    ordersContent = <OrderList orders={orders} filteredOrders={filteredOrders} filter={orderStatusFilter}
      onFilterChange={changeOrderFilter}
      detailHref={order => `${ordersBackTo}&pedido=${encodeURIComponent(order.id)}`} />;
  }

  const changeProductFilter = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'productos');
    nextParams.set('filtro', value);
    setSearchParams(nextParams);
  };
  const changeProductSearch = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set('q', value); else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };
  const clearProductFilters = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('filtro', 'all');
    nextParams.delete('q');
    setSearchParams(nextParams);
  };
  const productsContent = <ProductList products={products} filteredProducts={filteredProducts} filter={productFilter}
    search={productSearch} feedback={deleteProductCandidate ? null : productFeedback} onFilterChange={changeProductFilter}
    onSearchChange={changeProductSearch} onClearFilters={clearProductFilters}
    onCreate={() => setCreateProductModalOpen(true)} onEdit={product => setEditingProduct(product)}
    onToggleStatus={handleToggleProductStatus} onDelete={product => { setProductFeedback(null); setDeleteProductCandidate(product); }} />;

  const profileContent = (
    <div className={profileStyles.page}>
      <div className={profileStyles.container}>
        <header className={profileStyles.pageHeader}>
          <p className={profileStyles.eyebrow}>Perfil de tu negocio</p>
          <h1 className={profileStyles.title}>Mi tienda</h1>
          <p className={profileStyles.subtitle}>
            Actualiza la información que ven tus compradores.
          </p>
        </header>

        {storeUpdateSuccess && (
          <Alert variant="success" className={profileStyles.feedback}>
            {storeUpdateSuccess}
          </Alert>
        )}

        <div className={profileStyles.formCard}>
          <form onSubmit={handleSaveStoreProfile} className={profileStyles.form}>
            {/* 1. Información del negocio */}
            <fieldset className={profileStyles.section}>
              <div className={profileStyles.sectionHeader}>
                <legend className={profileStyles.sectionLegend}>Información del negocio</legend>
                <p className={profileStyles.sectionHint}>
                  Datos principales que identifican a tu emprendimiento en JUÁCIL.
                </p>
              </div>

              <Input
                label="Nombre del negocio"
                isRequired
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />

              <div className={profileStyles.grid2}>
                <Select
                  label="Categoría"
                  isRequired
                  options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
                  value={storeCategory}
                  onChange={(e) => setStoreCategory(e.target.value)}
                />

                <Select
                  label="Localidad"
                  isRequired
                  options={LOCATIONS.map((loc) => ({ value: loc, label: loc }))}
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                />
              </div>

              <div className={profileStyles.grid2}>
                <Input
                  label="RUC"
                  placeholder="11 dígitos (ej. 20601234567)"
                  helperText="Opcional. Ingresa 11 dígitos."
                  value={storeRuc}
                  onChange={(e) => setStoreRuc(e.target.value)}
                />
              </div>

              <Textarea
                label="Descripción"
                isRequired
                rows={4}
                helperText="Describe tu negocio y la procedencia de tus productos."
                value={storeDesc}
                onChange={(e) => setStoreDesc(e.target.value)}
              />
            </fieldset>

            {/* 2. Contacto y horario */}
            <fieldset className={`${profileStyles.section} ${profileStyles.sectionWithDivider}`}>
              <div className={profileStyles.sectionHeader}>
                <legend className={profileStyles.sectionLegend}>Contacto y horario de atención</legend>
                <p className={profileStyles.sectionHint}>
                  Canales de comunicación directa para coordinar con tus clientes.
                </p>
              </div>

              <div className={profileStyles.grid2}>
                <Input
                  label="WhatsApp"
                  isRequired
                  placeholder="Ej. 962881234"
                  helperText="Ingresa 9 dígitos, sin +51."
                  value={storeWhatsapp}
                  onChange={(e) => setStoreWhatsapp(e.target.value)}
                />

                <Input
                  label="Horario de atención"
                  isRequired
                  placeholder="Ej. Lunes a Sábado: 8:00 am - 7:30 pm"
                  helperText="Indica los días y horas en que atiendes."
                  value={storeSchedule}
                  onChange={(e) => setStoreSchedule(e.target.value)}
                />
              </div>
            </fieldset>

            {/* 3. Imágenes de tu tienda */}
            <fieldset className={`${profileStyles.section} ${profileStyles.sectionWithDivider}`}>
              <div className={profileStyles.sectionHeader}>
                <legend className={profileStyles.sectionLegend}>Imágenes de tu tienda</legend>
                <p className={profileStyles.sectionHint}>
                  Personaliza la apariencia de tu tienda pública en el marketplace.
                </p>
              </div>

              <div className={profileStyles.grid2}>
                <Input
                  label="Enlace del logo"
                  placeholder="https://ejemplo.com/logo.jpg"
                  helperText="Imagen cuadrada o circular para identificar tu tienda."
                  value={storeLogoUrl}
                  onChange={(e) => setStoreLogoUrl(e.target.value)}
                />

                <Input
                  label="Enlace de la portada"
                  placeholder="https://ejemplo.com/portada.jpg"
                  helperText="Imagen horizontal visible en la cabecera de tu tienda."
                  value={storeBannerUrl}
                  onChange={(e) => setStoreBannerUrl(e.target.value)}
                />
              </div>

              <StoreImagePreview
                logoUrl={storeLogoUrl}
                bannerUrl={storeBannerUrl}
                storeName={storeName}
              />
            </fieldset>

            <div className={profileStyles.actions}>
              <Button
                type="submit"
                variant="accent"
                leftIcon={<Save size={18} aria-hidden="true" />}
              >
                Guardar cambios
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
    {activeTab === 'reportes' ? <MerchantSummary business={business} products={products} orders={orders} /> : activeTab === 'pedidos' ? ordersContent : activeTab === 'productos' ? productsContent : profileContent}

      {/* Modal: Crear Producto */}
      <Modal
        isOpen={createProductModalOpen}
        onClose={closeCreateProduct}
        title="Agregar producto" size="lg"
      >
        <ProductForm
          onSubmit={handleCreateProductSubmit}
          onCancel={closeCreateProduct}
        />
      </Modal>

      {/* Modal: Editar Producto */}
      <Modal
        isOpen={Boolean(editingProduct)}
        onClose={closeEditProduct}
        title="Editar producto" size="lg"
      >
        {editingProduct && (
          <ProductForm
            key={editingProduct.id}
            initialProduct={editingProduct}
            onSubmit={handleEditProductSubmit}
            onCancel={closeEditProduct}
          />
        )}
      </Modal>

      <DeleteProductModal product={deleteProductCandidate} onClose={() => setDeleteProductCandidate(null)} onConfirm={handleConfirmDeleteProduct}
        error={productFeedback?.type === 'danger' ? productFeedback.message : undefined} />
    </>
  );
};
