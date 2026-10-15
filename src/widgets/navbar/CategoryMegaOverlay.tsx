import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  X,
  ShoppingBasket,
  Sparkles,
  Coffee,
  Sun,
  Apple,
  Footprints,
  Shirt,
  Hammer,
  Boxes,
  Smartphone,
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
      id: 'calzado-moda',
      name: 'Calzado & Zapatillas',
      badge: 'Moda & Deporte',
      description: 'Zapatillas urbanas, running, calzado escolar, sandalias y botas de jebe para el campo.',
      icon: <Footprints size={22} />,
    },
    {
      id: 'ropa-textil',
      name: 'Ropa & Polos',
      badge: 'Confección',
      description: 'Polos de algodón, deportivos dry-fit, jeans clásicos, pantalones cargo y casacas.',
      icon: <Shirt size={22} />,
    },
    {
      id: 'ferreteria',
      name: 'Ferretería & Herramientas',
      badge: 'Trabajo & Obra',
      description: 'Taladros percutores, machetes agrícolas, juegos de llaves, carretillas y candados.',
      icon: <Hammer size={22} />,
    },
    {
      id: 'plastiqueria',
      name: 'Plastiquería & Contenedores',
      badge: 'Hogar & Negocio',
      description: 'Baldes plásticos reforzados, sillas de alto tránsito y recipientes herméticos.',
      icon: <Boxes size={22} />,
    },
    {
      id: 'tecnologia',
      name: 'Tecnología & Celulares',
      badge: 'Garantía',
      description: 'Auriculares inalámbricos, parlantes bluetooth, smartwatches, power banks y USB.',
      icon: <Smartphone size={22} />,
    },
    {
      id: 'abarrotes',
      name: 'Abarrotes & Canasta Básica',
      badge: 'Esencial',
      description: 'Arroz superior, azúcar rubia de caña, aceites vegetales y fideos clásicos.',
      icon: <ShoppingBasket size={22} />,
    },
    {
      id: 'hogar',
      name: 'Hogar & Limpieza',
      badge: 'Empresas & Hogar',
      description: 'Papel higiénico suave pack familiar y detergentes multiuso poder activo.',
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
      name: 'Cacao, Chocolate & Miel',
      badge: 'Cacao Nativo',
      description: 'Tabletas al 70%, pasta pura para taza, nibs y miel pura de monte.',
      icon: <Sun size={22} />,
    },
    {
      id: 'frutas',
      name: 'Frutas, Chifles & Snacks',
      badge: 'Crocantes',
      description: 'Chifles de plátano bellaco de Castillo Grande, frutas y licores típicos.',
      icon: <Apple size={22} />,
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
              Todo lo que necesitas en un solo lugar: calzado, ropa, herramientas de trabajo, ferretería,
              plastiquería, tecnología, abarrotes y productos del campo de Tingo María.
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
