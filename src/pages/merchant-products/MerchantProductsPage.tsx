import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { formatMoney } from '@/shared/lib/money';
import { Product, ProductStatus } from '@/entities/product/model/types';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  ArrowLeft,
  Package,
} from 'lucide-react';

export const MerchantProductsPage: React.FC = () => {
  const { isMerchant, businessId } = useSession();
  const navigate = useNavigate();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteProductCandidate, setDeleteProductCandidate] = useState<Product | null>(null);

  if (!isMerchant || !businessId) {
    navigate(ROUTES.FORBIDDEN);
    return null;
  }

  const products = LocalStoreRepository.getProductsByBusiness(businessId);

  const filteredProducts = products.filter((p) => {
    if (filterStatus === 'published') return p.status === 'published';
    if (filterStatus === 'draft') return p.status === 'draft';
    if (filterStatus === 'outOfStock') return p.stock === 0;
    return true;
  });

  const handleToggleStatus = (product: Product) => {
    const nextStatus: ProductStatus = product.status === 'published' ? 'draft' : 'published';
    LocalStoreRepository.saveProduct({
      ...product,
      status: nextStatus,
    });
    // Forzar actualización
    setFilterStatus((prev) => prev);
  };

  const handleConfirmDelete = () => {
    if (deleteProductCandidate) {
      LocalStoreRepository.deleteProduct(deleteProductCandidate.id);
      setDeleteProductCandidate(null);
    }
  };

  return (
    <div style={{ padding: '32px 0 64px' }}>
      <div className="container">
        <Link
          to={ROUTES.MERCHANT_DASHBOARD}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, marginBottom: '24px' }}
        >
          <ArrowLeft size={16} /> Volver al Panel
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
              Mis Productos
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              Catálogo de artículos administrados por tu MYPE ({products.length} registrados).
            </p>
          </div>

          <Button
            variant="accent"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate(ROUTES.MERCHANT_PRODUCT_NEW)}
          >
            Agregar Nuevo Producto
          </Button>
        </div>

        {/* Filtros de Pestañas */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            Todos ({products.length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'published' ? 'primary' : 'outline'}
            onClick={() => setFilterStatus('published')}
          >
            Publicados ({products.filter((p) => p.status === 'published').length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'draft' ? 'primary' : 'outline'}
            onClick={() => setFilterStatus('draft')}
          >
            Borradores ({products.filter((p) => p.status === 'draft').length})
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'outOfStock' ? 'primary' : 'outline'}
            onClick={() => setFilterStatus('outOfStock')}
          >
            Agotados ({products.filter((p) => p.stock === 0).length})
          </Button>
        </div>

        {/* Tabla o Listado */}
        {filteredProducts.length > 0 ? (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-subtle)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '14px 16px' }}>Producto</th>
                    <th style={{ padding: '14px 16px' }}>Categoría</th>
                    <th style={{ padding: '14px 16px' }}>Precio</th>
                    <th style={{ padding: '14px 16px' }}>Stock</th>
                    <th style={{ padding: '14px 16px' }}>Estado</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ display: 'block', color: 'var(--color-primary-950)' }}>
                              {p.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                              ID: {p.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', textTransform: 'capitalize' }}>
                        {p.category}
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                        {formatMoney(p.priceCents)}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {p.stock === 0 ? (
                          <Badge variant="danger">0 (Agotado)</Badge>
                        ) : p.stock <= 4 ? (
                          <Badge variant="warning">{p.stock} unids.</Badge>
                        ) : (
                          <span style={{ fontWeight: 600 }}>{p.stock} unids.</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        {p.status === 'published' ? (
                          <Badge variant="success">Publicado</Badge>
                        ) : (
                          <Badge variant="neutral">Borrador</Badge>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            title={p.status === 'published' ? 'Despublicar (pasar a borrador)' : 'Publicar producto'}
                            onClick={() => handleToggleStatus(p)}
                          >
                            {p.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </Button>

                          <Link to={ROUTES.MERCHANT_PRODUCT_EDIT(p.id)}>
                            <Button size="sm" variant="ghost" title="Editar detalles">
                              <Edit2 size={15} />
                            </Button>
                          </Link>

                          <Button
                            size="sm"
                            variant="ghost"
                            style={{ color: 'var(--color-danger)' }}
                            title="Eliminar producto"
                            onClick={() => setDeleteProductCandidate(p)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px dashed var(--color-border)', borderRadius: '16px', padding: '64px 20px', textAlign: 'center' }}>
            <Package size={36} color="var(--color-text-subtle)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 6px' }}>
              No hay productos con este filtro
            </h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Crea un nuevo producto para exhibirlo a los clientes de JUÁCIL.
            </p>
            <Button variant="accent" onClick={() => navigate(ROUTES.MERCHANT_PRODUCT_NEW)}>
              Crear Nuevo Producto
            </Button>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        isOpen={Boolean(deleteProductCandidate)}
        onClose={() => setDeleteProductCandidate(null)}
        title="¿Eliminar este producto?"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleteProductCandidate(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmDelete}>
              Sí, eliminar definitivamente
            </Button>
          </>
        }
      >
        <p>
          ¿Estás seguro de que deseas eliminar <strong>{deleteProductCandidate?.name}</strong>? Esta
          acción lo retirará del catálogo y del panel administrativo.
        </p>
      </Modal>
    </div>
  );
};
