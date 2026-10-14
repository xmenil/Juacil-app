import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Business } from '../model/types';
import { ROUTES } from '@/shared/config/routes';
import { CATEGORIES } from '@/shared/config/constants';
import { createWhatsAppLink } from '@/shared/lib/whatsapp';
import { MapPin, ArrowUpRight, Store, MessageCircle } from 'lucide-react';
import styles from './BusinessCard.module.css';

export interface BusinessCardProps { business: Business; productCount?: number; showContact?: boolean; }
export function BusinessCard({ business, productCount, showContact = false }: BusinessCardProps) {
  const titleId = useId();
  const [imageFailed, setImageFailed] = useState(false);
  const category = CATEGORIES.find(item => item.id === business.category)?.name || business.category;
  return <article className={styles.card} aria-labelledby={titleId}>
    <Link to={ROUTES.STORE_DETAIL(business.id)} className={styles.cover} aria-label={`Ver tienda ${business.name}`}>
      {business.bannerUrl && !imageFailed ? <img src={business.bannerUrl} alt={`Portada de ${business.name}`} loading="lazy" onError={() => setImageFailed(true)} /> : <Store size={36} aria-hidden="true" />}
    </Link>
    <div className={styles.body}>
      <span className={styles.category}>{category}</span>
      <h3 id={titleId}><Link to={ROUTES.STORE_DETAIL(business.id)}>{business.name}</Link></h3>
      <div className={styles.location}><MapPin size={14} aria-hidden="true" />{business.location}</div>
      <p className={styles.description}>{business.description}</p>
      {business.status === 'pending' && <p className={styles.state}>En revisión</p>}
      {business.status === 'suspended' && <p className={styles.state}>Tienda suspendida</p>}
      <div className={styles.meta}>
        {productCount !== undefined && <span>{productCount} {productCount === 1 ? 'producto publicado' : 'productos publicados'}</span>}
        {business.schedule && <span>{business.schedule}</span>}
      </div>
      <div className={styles.actions}>
        <Link className={styles.visit} to={ROUTES.STORE_DETAIL(business.id)}>Ver productos <ArrowUpRight size={17} aria-hidden="true" /></Link>
        {showContact && business.whatsapp && <a href={createWhatsAppLink(business.whatsapp, `Hola, encontré ${business.name} en JUÁCIL y quisiera consultar sobre sus productos.`)} target="_blank" rel="noopener noreferrer" className={styles.contact} aria-label={`Consultar por WhatsApp a ${business.name}`}><MessageCircle size={17} aria-hidden="true" /><span>Consultar</span></a>}
      </div>
    </div>
  </article>;
}
