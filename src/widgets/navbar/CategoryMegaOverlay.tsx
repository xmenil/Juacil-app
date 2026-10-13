import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  ShoppingBasket,
  Sparkles,
  Coffee,
  Sun,
  Apple,
  Feather,
  ShieldCheck,
  Wine,
  ArrowRight,
  Store,
  Tag,
} from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import styles from './CategoryMegaOverlay.module.css';

interface CategoryMegaOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CategoryItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}

export const CategoryMegaOverlay: React.FC<CategoryMegaOverlayProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories: CategoryItem[] = [
    {
      id: 'abarrotes',
      name: 'Abarrotes & Canasta Básica',
      badge: 'Esencial',
      description: 'Arroz, azúcar, aceites, fideos, menestras y conservas familiares y mayoristas.',
      icon: <ShoppingBasket size={22} />,
    },
    {
      id: 'hogar',
      name: 'Hogar, Papelería & Limpieza',
      badge: 'Empresas & Hogar',
      description: 'Papel higiénico, servilletas, detergentes, lejía y útiles de aseo.',
      icon: <Sparkles size={22} />,
    },
    {
      id: 'cafe',
      name: 'Café de Especialidad & Altura',
      badge: '84+ Puntos',
      description: 'Cafés de altura del Monzón y Castillo Grande, molido y grano tostado.',
      icon: <Coffee size={22} />,
    },
    {
      id: 'cacao',
      name: 'Cacao, Chocolate & Confitería',
      badge: 'Cacao Nativo',
      description: 'Tabletas al 70%, pasta pura para taza tradicional y nibs crocantes.',
      icon: <Sparkles size={22} />,
    },
    {
      id: 'miel',
      name: 'Miel Pura & Apicultura',
      badge: '100% Virgen',
      description: 'Miel de monte de la Bella Durmiente, propóleo silvestre y polen puro.',
      icon: <Sun size={22} />,
    },
    {
      id: 'frutas',
      name: 'Frutas, Chifles & Snacks',
      badge: 'Crocantes',
      description: 'Chifles de plátano bellaco de Castillo Grande, frutas deshidratadas y snacks.',
      icon: <Apple size={22} />,
    },
    {
      id: 'licores',
      name: 'Bebidas & Licores Amazónicos',
      badge: 'Tradicional',
      description: 'Uvachado, 7 Raíces, chuchuhuasi y macerados típicos de Tingo María.',
      icon: <Wine size={22} />,
    },
    {
      id: 'artesania',
      name: 'Artesanías & Cultura Amazónica',
      badge: 'Hecho a Mano',
      description: 'Tallados en madera noble, huayruro y recuerdos emblemáticos de la selva.',
      icon: <Feather size={22} />,
    },
    {
      id: 'superfoods',
      name: 'Superfoods & Derivados del Campo',
      badge: 'Nutrición',
      description: 'Sacha inchi, harina de plátano, aguaje y productos naturales de Leoncio Prado.',
      icon: <ShieldCheck size={22} />,
    },
  ];

  const handleCategoryClick = (catId: string) => {
    navigate(`${ROUTES.CATALOG}?categoria=${catId}`);
    onClose();
  };

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Catálogo completo de categorías"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Cabecera del Modal */}
        <div className={styles.modalHeader}>
          <div className={styles.headerText}>
            <span className={styles.eyebrow}>Explorador de Categorías</span>
            <h2 className={styles.title}>Todas las Categorías de JUÁCIL</h2>
            <p className={styles.subtitle}>
              Todo lo que necesitas en un solo lugar: de la canasta familiar y abarrotes para empresas y hogares,
              hasta los cafés de especialidad, cacao fino y artesanías de la Amazonía.
            </p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar ventana de categorías"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cuadrícula de Categorías */}
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={styles.categoryCard}
              onClick={() => handleCategoryClick(cat.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(cat.id)}
            >
              <div className={styles.categoryIconBox}>{cat.icon}</div>
              <div className={styles.categoryCardContent}>
                <div className={styles.categoryTitleRow}>
                  <span className={styles.categoryName}>{cat.name}</span>
                  <span className={styles.categoryBadge}>{cat.badge}</span>
                </div>
                <p className={styles.categoryDesc}>{cat.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pie del Modal con Enlaces Rápidos */}
        <div className={styles.modalFooter}>
          <div className={styles.footerLinks}>
            <Link
              to={ROUTES.CATALOG}
              className={styles.footerButton}
              onClick={onClose}
            >
              Ver Catálogo Completo
            </Link>
            <Link
              to={`${ROUTES.CATALOG}?ofertas=true`}
              className={styles.footerButton}
              onClick={onClose}
            >
              <Tag size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Ver Ofertas
            </Link>
            <Link
              to={`${ROUTES.CATALOG}?ubicacion=Tingo%20Mar%C3%ADa`}
              className={styles.footerButton}
              onClick={onClose}
            >
              <Store size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Tiendas de Tingo María
            </Link>
          </div>

          <button
            type="button"
            className={styles.footerButton}
            onClick={() => {
              navigate(ROUTES.CATALOG);
              onClose();
            }}
            style={{ backgroundColor: 'var(--color-primary-700)', color: '#ffffff', borderColor: 'var(--color-primary-700)' }}
          >
            Explorar Todo <ArrowRight size={13} style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
          </button>
        </div>
      </div>
    </div>
  );
};
