import React from 'react';
import styles from './Card.module.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isInteractive?: boolean;
  variant?: 'default' | 'subtle' | 'primaryBg';
}

export const Card: React.FC<CardProps> = ({
  children,
  isInteractive = false,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={[
        styles.card,
        isInteractive ? styles.interactive : '',
        variant !== 'default' ? styles[variant] : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </div>
  );
};
