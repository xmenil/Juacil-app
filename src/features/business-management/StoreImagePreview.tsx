import React, { useState } from 'react';
import styles from './StoreProfile.module.css';

interface StoreImagePreviewProps {
  logoUrl?: string;
  bannerUrl?: string;
  storeName?: string;
}

export const StoreImagePreview: React.FC<StoreImagePreviewProps> = ({
  logoUrl,
  bannerUrl,
  storeName,
}) => {
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null);
  const [failedBannerUrl, setFailedBannerUrl] = useState<string | null>(null);

  const cleanLogo = logoUrl?.trim() || '';
  const cleanBanner = bannerUrl?.trim() || '';
  const initial = (storeName?.trim() || 'T').charAt(0).toUpperCase();

  const isLogoFailed = cleanLogo ? failedLogoUrl === cleanLogo : false;
  const isBannerFailed = cleanBanner ? failedBannerUrl === cleanBanner : false;

  return (
    <div className={styles.imagePreviewSection} aria-label="Vista previa de cabecera">
      <div className={styles.previewHeader}>
        <span className={styles.previewLabel}>Vista previa en tienda pública</span>
        <span className={styles.previewBadge}>Cabecera referencial</span>
      </div>

      <div className={styles.previewCard}>
        <div className={styles.bannerMockup}>
          {cleanBanner && !isBannerFailed ? (
            <img
              key={cleanBanner}
              src={cleanBanner}
              alt=""
              className={styles.bannerImg}
              onError={() => setFailedBannerUrl(cleanBanner)}
            />
          ) : (
            <span className={styles.bannerFallback}>
              {isBannerFailed ? 'No se pudo cargar la portada' : 'Sin imagen de portada'}
            </span>
          )}

          <div className={styles.logoMockup}>
            {cleanLogo && !isLogoFailed ? (
              <img
                key={cleanLogo}
                src={cleanLogo}
                alt=""
                className={styles.logoImg}
                onError={() => setFailedLogoUrl(cleanLogo)}
              />
            ) : (
              <span className={styles.logoFallback} aria-hidden="true">
                {initial}
              </span>
            )}
          </div>
        </div>

        <div className={styles.previewBody}>
          <p className={styles.previewStoreName}>{storeName?.trim() || 'Tu tienda'}</p>
          <p className={styles.previewHint}>
            Así verán tus clientes el logo y la portada al visitar tu tienda en JUÁCIL.
          </p>
        </div>
      </div>
    </div>
  );
};
