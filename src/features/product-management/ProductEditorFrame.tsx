import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import styles from './ProductForm.module.css';

export const ProductEditorFrame: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className={styles.editorPage}><div className={`container ${styles.editorContainer}`}>
    <Link to={ROUTES.MERCHANT_PRODUCTS} className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" />Volver a productos</Link>
    <header className={styles.editorHeader}><p className={styles.eyebrow}>Catálogo de tu tienda</p><h1>{title}</h1><p>{description}</p></header>
    <div className={styles.editorSurface}>{children}</div>
  </div></div>
);
