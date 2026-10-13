import React from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'lime' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  return (
    <span className={[styles.badge, styles[variant], className].filter(Boolean).join(' ')}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
};
