import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import styles from './Alert.module.css';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={18} className={styles.icon} />;
      case 'warning':
        return <AlertTriangle size={18} className={styles.icon} />;
      case 'danger':
        return <AlertCircle size={18} className={styles.icon} />;
      default:
        return <Info size={18} className={styles.icon} />;
    }
  };

  return (
    <div
      role="alert"
      className={[styles.alert, styles[variant], className].filter(Boolean).join(' ')}
    >
      {getIcon()}
      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  );
};
