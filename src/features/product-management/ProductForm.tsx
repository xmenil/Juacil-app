import React, { useState, useRef } from 'react';
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
import { Check, Upload, Laptop, Image as ImageIcon, AlertCircle } from 'lucide-react';

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
  imageUrl: z
    .string()
    .min(1, 'Sube una fotografía desde tus archivos o selecciona una imagen.')
    .refine(
      (val) =>
        val.startsWith('data:image/') ||
        val.startsWith('http://') ||
        val.startsWith('https://') ||
        val.startsWith('/'),
      'La imagen debe ser un archivo cargado o una dirección web válida.'
    ),
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeImageTab, setActiveImageTab] = useState<'upload' | 'presets' | 'url'>('upload');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues, unknown, ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialProduct?.name || '',
      category: initialProduct?.category || 'cafe',
      priceDecimal: initialProduct ? centsToDecimal(initialProduct.priceCents) : '20.00',
      stock: initialProduct ? String(initialProduct.stock) : '10',
      description: initialProduct?.description || '',
      featuresText: initialProduct?.features?.join(', ') || '',
      imageUrl: initialProduct?.imageUrl || PRESET_DEMO_IMAGES[0].url,
      status: (initialProduct?.status === 'draft' ? 'draft' : 'published') as 'published' | 'draft',
    },
  });

  const currentImageUrl = watch('imageUrl');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setFileUploadError('Por favor selecciona un archivo de imagen (PNG, JPG, WEBP, etc.).');
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFileUploadError('La imagen no debe exceder 15 MB.');
      return;
    }
    setFileUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setValue('imageUrl', result, { shouldValidate: true });
      setUploadedFileName(`${file.name} (${Math.round(file.size / 1024)} KB)`);
    };
    reader.onerror = () => {
      setFileUploadError('Hubo un error al leer el archivo desde tu laptop. Intenta nuevamente.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSelectPreset = (url: string) => {
    setValue('imageUrl', url, { shouldValidate: true });
    setUploadedFileName(null);
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
    <form onSubmit={handleSubmit(handleFormSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <Input
          label="Precio en Soles (PEN)"
          isRequired
          placeholder="Ej. 24.50"
          helperText="Monto en Soles para tus compradores."
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
        rows={3}
        placeholder="Describe el origen, notas de cata, proceso artesanal o características de la Selva Central..."
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        label="Características clave (separadas por comas)"
        placeholder="Ej. 100% Arábica, Tueste Medio, Valle del Monzón, Cosecha 2026"
        helperText="Aparecerán como viñetas destacadas en la ficha del producto."
        {...register('featuresText')}
      />

      {/* Sección Fotografía del Producto con Carga de Archivos de la Laptop */}
      <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#0b4526', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ImageIcon size={16} /> Fotografía del Producto
            </label>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Sube una foto desde los archivos de tu laptop o elige de nuestra galería.
            </span>
          </div>

          {/* Opciones de Método de Imagen */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e2e8f0', padding: '3px', borderRadius: '8px' }}>
            <button
              type="button"
              onClick={() => setActiveImageTab('upload')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeImageTab === 'upload' ? '#ffffff' : 'transparent',
                color: activeImageTab === 'upload' ? '#0b4526' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Laptop size={13} /> Subir de Laptop
            </button>
            <button
              type="button"
              onClick={() => setActiveImageTab('presets')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeImageTab === 'presets' ? '#ffffff' : 'transparent',
                color: activeImageTab === 'presets' ? '#0b4526' : '#64748b',
              }}
            >
              Galería Selva
            </button>
            <button
              type="button"
              onClick={() => setActiveImageTab('url')}
              style={{
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                backgroundColor: activeImageTab === 'url' ? '#ffffff' : 'transparent',
                color: activeImageTab === 'url' ? '#0b4526' : '#64748b',
              }}
            >
              Por URL
            </button>
          </div>
        </div>

        {/* Input Oculto de Archivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/jpg"
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />

        {/* Pestaña: Subir desde Laptop / Archivos locales */}
        {activeImageTab === 'upload' && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: isDragging ? '2px dashed #16a34a' : '2px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '24px 16px',
                textAlign: 'center',
                backgroundColor: isDragging ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px',
                }}
              >
                <Upload size={22} />
              </div>
              <strong style={{ display: 'block', fontSize: '14px', color: '#0b4526', marginBottom: '4px' }}>
                Haz clic aquí para seleccionar una foto de tu laptop o computadora
              </strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b' }}>
                O arrastra y suelta tu archivo de imagen aquí (PNG, JPG o WebP hasta 15 MB)
              </p>
            </div>

            {fileUploadError && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontSize: '12px' }}>
                <AlertCircle size={14} />
                <span>{fileUploadError}</span>
              </div>
            )}
          </div>
        )}

        {/* Pestaña: Galería Predefinida */}
        {activeImageTab === 'presets' && (
          <div>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }}>
              Haz clic en cualquier imagen de muestra de la Amazonía para asignarla:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
              {PRESET_DEMO_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectPreset(preset.url)}
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: currentImageUrl === preset.url ? '3px solid #15803d' : '1px solid #cbd5e1',
                    cursor: 'pointer',
                    position: 'relative',
                    aspectRatio: '1/1',
                  }}
                  title={preset.label}
                >
                  <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {currentImageUrl === preset.url && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: '#15803d', borderRadius: '50%', color: '#ffffff', padding: '2px' }}>
                      <Check size={12} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pestaña: Por URL */}
        {activeImageTab === 'url' && (
          <div>
            <Input
              label="URL Web Directa de la Imagen"
              placeholder="https://..."
              error={errors.imageUrl?.message}
              {...register('imageUrl')}
            />
          </div>
        )}

        {/* Vista previa de la imagen seleccionada o cargada */}
        {currentImageUrl && (
          <div
            style={{
              marginTop: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              padding: '12px 14px',
              borderRadius: '12px',
              border: '1px solid #bbf7d0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={currentImageUrl}
                alt="Vista previa"
                style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #e2e8f0' }}
              />
              <div>
                <strong style={{ fontSize: '13.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={15} /> Fotografía lista
                </strong>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>
                  {uploadedFileName || (currentImageUrl.startsWith('data:image/') ? 'Cargada desde archivos locales' : 'Foto seleccionada')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar
              </Button>
            </div>
          </div>
        )}

        {errors.imageUrl && (
          <span style={{ fontSize: '12px', color: '#dc2626', display: 'block', marginTop: '6px' }}>
            {errors.imageUrl.message}
          </span>
        )}
      </div>

      {/* Botones de Acción */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting}>
          {initialProduct ? 'Guardar Cambios del Producto' : 'Publicar Producto'}
        </Button>
      </div>
    </form>
  );
};

