import React from 'react';
import { Link } from 'react-router-dom';
import { Business } from '../model/types';
import { ROUTES } from '@/shared/config/routes';
import { MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import styles from './BusinessCard.module.css';

export interface BusinessCardProps {
  business: Business;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <article className={styles.card}>
      <img
        src={business.bannerUrl}
        alt={`Portada de ${business.name}`}
        className={styles.banner}
        loading="lazy"
      />
      <div className={styles.body}>
        <div className={styles.logoWrapper}>
          <img src={business.logoUrl} alt={`Logo de ${business.name}`} className={styles.logo} />
        </div>

        <h3 className={styles.name}>
          <Link to={ROUTES.STORE_DETAIL(business.id)}>{business.name}</Link>
        </h3>

        <div className={styles.location}>
          <MapPin size={13} />
          <span>{business.location}</span>
        </div>

        <p className={styles.desc}>{business.description}</p>

        <div className={styles.footer}>
          <Link to={ROUTES.STORE_DETAIL(business.id)}>
            <Button size="sm" variant="outline" rightIcon={<ArrowRight size={14} />}>
              Ver productos
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};
