import React, { useState, useRef, useId } from 'react';
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
import { Check, Upload } from 'lucide-react';
import { ProductPhoto } from './ProductPhoto';
import styles from './ProductForm.module.css';

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
  const fileInputId = useId();
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
  const imageErrorId = activeImageTab === 'url' ? 'imageUrl-error' : fileInputId + '-validation';

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
    <form onSubmit={handleSubmit(handleFormSubmit)} className={styles.form} aria-busy={isSubmitting}>
      <p className={styles.requiredHelp}>Los campos con * son obligatorios.</p>
      <fieldset className={styles.section}>
        <legend>Información del producto</legend>
        <div className={styles.twoColumn}>
          <Input label="Nombre del producto" isRequired placeholder="Ej. Café Villa Rica 250 g" error={errors.name?.message} {...register('name')} />
          <Select label="Categoría" isRequired options={CATEGORIES.map(category => ({ value: category.id, label: category.name }))} error={errors.category?.message} {...register('category')} />
        </div>
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Precio, stock y visibilidad</legend>
        <div className={styles.twoColumn}>
          <Input label="Precio (S/)" isRequired inputMode="decimal" placeholder="Ej. 24.50" helperText="Usa un punto para los decimales." error={errors.priceDecimal?.message} {...register('priceDecimal')} />
          <Input label="Stock disponible" isRequired inputMode="numeric" placeholder="Ej. 15" helperText="Con 0 unidades, el producto aparece como agotado." error={errors.stock?.message} {...register('stock')} />
        </div>
        <Select label="Visibilidad" isRequired options={[
          { value: 'published', label: 'Publicado: visible en el catálogo' },
          { value: 'draft', label: 'Borrador: visible solo en tu panel' },
        ]} error={errors.status?.message} {...register('status')} />
      </fieldset>

      <fieldset className={styles.section} aria-describedby={errors.imageUrl ? imageErrorId : undefined}>
        <legend>Fotografía del producto</legend>
        <p className={styles.sectionHelp}>Elige una foto de tu celular o computadora, una imagen de muestra o un enlace.</p>
        <div className={styles.imageMethods} role="group" aria-label="Cómo agregar la foto" aria-describedby={errors.imageUrl ? imageErrorId : undefined}>
          <Button type="button" variant={activeImageTab === 'upload' ? 'primary' : 'outline'} aria-pressed={activeImageTab === 'upload'} onClick={() => setActiveImageTab('upload')}>Subir foto</Button>
          <Button type="button" variant={activeImageTab === 'presets' ? 'primary' : 'outline'} aria-pressed={activeImageTab === 'presets'} onClick={() => setActiveImageTab('presets')}>Galería demo</Button>
          <Button type="button" variant={activeImageTab === 'url' ? 'primary' : 'outline'} aria-pressed={activeImageTab === 'url'} onClick={() => setActiveImageTab('url')}>Usar enlace</Button>
        </div>
        <input ref={fileInputRef} id={fileInputId} type="file" accept="image/png,image/jpeg,image/webp,image/jpg"
          hidden aria-label="Archivo de fotografía" onChange={handleFileInputChange} />

        {activeImageTab === 'upload' && (
          <div>
            <button type="button" className={`${styles.dropZone} ${isDragging ? styles.dropZoneActive : ''}`}
              aria-describedby={[fileUploadError ? fileInputId + '-error' : fileInputId + '-help', errors.imageUrl ? imageErrorId : null].filter(Boolean).join(' ')}
              onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}>
              <Upload size={24} aria-hidden="true" /><strong>Elegir una foto</strong>
              <span id={fileInputId + '-help'}>También puedes arrastrarla aquí. PNG, JPG o WebP, hasta 15 MB.</span>
            </button>
            {fileUploadError && <p id={fileInputId + '-error'} role="alert" className={styles.uploadError}>{fileUploadError}</p>}
          </div>
        )}

        {activeImageTab === 'presets' && (
          <div>
            <p className={styles.sectionHelp}>Imágenes de muestra para esta demostración. Elige la que corresponda a tu producto.</p>
            <div className={styles.presets} role="group" aria-label="Imágenes de muestra">
              {PRESET_DEMO_IMAGES.map(preset => (
                <button key={preset.url} type="button" className={`${styles.preset} ${currentImageUrl === preset.url ? styles.presetSelected : ''}`}
                  aria-pressed={currentImageUrl === preset.url} aria-describedby={errors.imageUrl ? imageErrorId : undefined} onClick={() => handleSelectPreset(preset.url)}>
                  <ProductPhoto src={preset.url} className={styles.presetPhoto} />
                  <span>{preset.label}</span>
                  {currentImageUrl === preset.url && <span className={styles.selectionMark}><Check size={16} aria-hidden="true" /><span className="sr-only">Seleccionada</span></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeImageTab === 'url' && (
          <Input label="Enlace de la imagen" placeholder="https://..." helperText="Pega el enlace directo de una foto."
            error={errors.imageUrl?.message} {...register('imageUrl')} />
        )}

        {currentImageUrl && (
          <div className={styles.preview} role="status">
            <ProductPhoto key={currentImageUrl} src={currentImageUrl} alt="Vista previa del producto" className={styles.previewPhoto} />
            <div><strong>Vista previa</strong><span>{uploadedFileName || (currentImageUrl.startsWith('data:image/') ? 'Foto cargada desde tus archivos' : 'Imagen seleccionada')}</span>
              <p>Si la foto no aparece, revisa el enlace o elige otra imagen.</p>
            </div>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>Cambiar foto</Button>
          </div>
        )}
        {errors.imageUrl && activeImageTab !== 'url' && <p id={imageErrorId} role="alert" className={styles.uploadError}>{errors.imageUrl.message}</p>}
      </fieldset>

      <fieldset className={styles.section}>
        <legend>Descripción y características</legend>
        <Textarea label="Descripción" isRequired rows={4} placeholder="Cuenta el origen, la presentación y las características de tu producto."
          error={errors.description?.message} {...register('description')} />
        <Input label="Características" placeholder="Ej. Tueste medio, 100% arábica, Bolsa de 250 g"
          helperText="Opcional. Separa cada característica con una coma." {...register('featuresText')} />
      </fieldset>

      <div className={styles.formActions}>
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="accent" isLoading={isSubmitting} className={styles.saveButton}>
          {initialProduct ? 'Guardar cambios' : 'Guardar producto'}
        </Button>
      </div>
    </form>
  );
};
