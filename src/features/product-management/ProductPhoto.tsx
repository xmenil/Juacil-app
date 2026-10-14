import React, { useState } from 'react';
import { Package } from 'lucide-react';
import styles from './ProductList.module.css';

export const ProductPhoto: React.FC<{ src: string; alt?: string; className?: string }> = ({ src, alt = '', className = '' }) => {
  const [failed, setFailed] = useState(false);
  return src && !failed
    ? <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />
    : <span role="img" aria-label="Foto no disponible" className={`${styles.photoFallback} ${className}`}><Package size={24} aria-hidden="true" /></span>;
};
