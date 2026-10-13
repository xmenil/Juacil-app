import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product, ProductStatus } from '@/entities/product/model/types';
import { decimalToCents, centsToDecimal } from '@/shared/lib/money';
import { CATEGORIES } from '@/shared/config/constants';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select } from '@/shared/ui/Select';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { Image, Check } from 'lucide-react';

const PRESET_DEMO_IMAGES = [
  { label: 'Café en grano Villa Rica', url: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80' },
  { label: 'Café Geisha Especial', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80' },
  { label: 'Chocolate Bitter Artesanal', url: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=600&q=80' },
  { label: 'Miel Pura de Monte', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80' },
  { label: 'Nibs de Cacao', url: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=600&q=80' },
  { label: 'Bolso Artesanal de Tamshi', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80' },
  { label: 'Collar de Huayruro', url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80' },
  { label: 'Chips de Plátano Bellaco', url: 'https://images.unsplash.com/photo-1628172906162-8e1216d6fc3a?auto=format&fit=crop&w=600&q=80' },
];

const productFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  category: z.string().min(1, 'Selecciona una categoría para el producto.'),
  priceDecimal: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Ingresa un precio válido en Soles (ej. 25.00).')
    .refine((val) => parseFloat(val) > 0, 'El precio debe ser mayor a 0.'),
  stock: z
    .string()
    .regex(/^\d+$/, 'El inventario debe ser un número entero no negativo (0 o más).'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  featuresText: z.string().optional(),
  imageUrl: z.string().url('Ingresa una URL válida de imagen o selecciona una foto demo.'),
  status: z.enum(['published', 'draft']),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export interface ProductFormProps {
  initialProduct?: Product;
  onSubmit: (data: Omit<Product, 'id' | 'businessId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialProduct,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>(
    initialProduct?.imageUrl || PRESET_DEMO_IMAGES[0].url
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialProduct?.name || '',
      category: initialProduct?.category || 'cafe',
      priceDecimal: initialProduct ? centsToDecimal(initialProduct.priceCents) : '20.00',
      stock: initialProduct ? String(initialProduct.stock) : '10',
      description: initialProduct?.description || '',
      featuresText: initialProduct?.features?.join(', ') || '',
      imageUrl: initialProduct?.imageUrl || PRESET_DEMO_IMAGES[0].url,
      status: initialProduct?.status || 'published',
    },
  });

  const currentImageUrl = watch('imageUrl');

  const handleSelectPreset = (url: string) => {
    setSelectedPresetImage(url);
    setValue('imageUrl', url, { shouldValidate: true });
  };

  const handleFormSubmit = (values: ProductFormValues) => {
    const priceCents = decimalToCents(values.priceDecimal);
    const stock = parseInt(values.stock, 10);
    const features = values.featuresText
      ? values.featuresText.split(',').map((f) => f.trim()).filter(Boolean)
      : [];

    onSubmit({
      name: values.name,
      category: values.category,
      priceCents,
      stock,
      description: values.description,
      features,
      imageUrl: values.imageUrl,
      imageAlt: values.name,
      status: values.status as ProductStatus,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        <Input
          label="Nombre del Producto"
          isRequired
          placeholder="Ej. Café Villa Rica Tueste Medio 250g"
          error={errors.name?.message}
          {...register('name')}
        />

        <Select
          label="Categoría"
          isRequired
          options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
          error={errors.category?.message}
          {...register('category')}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Input
          label="Precio en Soles (PEN)"
          isRequired
          placeholder="Ej. 24.50"
          helperText="Se convertirá a céntimos enteros (ej. 2450 céntimos)."
          error={errors.priceDecimal?.message}
          {...register('priceDecimal')}
        />

        <Input
          label="Inventario / Stock Disponible"
          isRequired
          placeholder="Ej. 15"
          helperText="0 significa 'Agotado' y bloquea compras."
          error={errors.stock?.message}
          {...register('stock')}
        />

        <Select
          label="Estado de Visibilidad"
          isRequired
          options={[
            { value: 'published', label: 'Publicado (Visible en el catálogo)' },
            { value: 'draft', label: 'Borrador (Privado, solo en este panel)' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />
      </div>

      <Textarea
        label="Descripción Detallada"
        isRequired
        rows={4}
        placeholder="Describe el origen, notas de cata, proceso artesanal o características de la Selva..."
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Características clave (separadas por comas)"
        placeholder="Ej. 100% Arábica, Tueste Medio, Villa Rica 1600 msnm"
        helperText="Aparecerán como viñetas en la ficha del producto."
        {...register('featuresText')}
      />

      {/* Galería de Fotos Demo / Selección */}
      <div>
        <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
          Fotografía del Producto
        </label>

        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
          Selecciona una fotografía optimizada de la colección demo de la Amazonía o ingresa una URL:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px', marginBottom: '16px' }}>
          {PRESET_DEMO_IMAGES.map((preset, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectPreset(preset.url)}
              style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: currentImageUrl === preset.url ? '3px solid var(--color-primary-700)' : '1px solid var(--color-border)',
                cursor: 'pointer',
                position: 'relative',
                aspectRatio: '1/1',
              }}
            >
              <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {currentImageUrl === preset.url && (
                <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'var(--color-primary-800)', borderRadius: '50%', color: '#ffffff', padding: '2px' }}>
                  <Check size={12} />
                </div>
              )}
            </div>
          ))}
        </div>

        <Input
          label="URL de la Imagen"
          placeholder="https://..."
          error={errors.imageUrl?.message}
          {...register('imageUrl')}
        />
      </div>

      {/* Previsualización */}
      {currentImageUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'var(--color-surface-subtle)', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <img
            src={currentImageUrl}
            alt="Vista previa"
            style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <div>
            <strong style={{ fontSize: '14px', display: 'block' }}>Vista Previa de la Fotografía</strong>
            <span style={{ fontSize: '12px', color: 'var(--color-text-subtle)' }}>
              Esta imagen se presentará con zoom accesible en el catálogo.
            </span>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          {initialProduct ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};
