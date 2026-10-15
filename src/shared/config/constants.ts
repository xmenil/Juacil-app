export const CATEGORIES = [
  { id: 'calzado-moda', name: 'Calzado & Zapatillas', badge: 'Moda & Deporte', icon: 'Footprints', description: 'Zapatillas urbanas, running, calzado escolar, sandalias y botas de jebe para el campo.' },
  { id: 'ropa-textil', name: 'Ropa & Polos', badge: 'Confección', icon: 'Shirt', description: 'Polos de algodón pima, polos deportivos dry-fit, jeans clásicos, pantalones cargo y casacas impermeables.' },
  { id: 'ferreteria', name: 'Ferretería & Herramientas', badge: 'Trabajo & Obra', icon: 'Hammer', description: 'Taladros percutores, machetes agrícolas, juegos de llaves, carretillas, cemento y candados.' },
  { id: 'plastiqueria', name: 'Plastiquería & Contenedores', badge: 'Hogar & Negocio', icon: 'Boxes', description: 'Baldes plásticos reforzados, sillas plásticas de alto tránsito, recipientes herméticos y tinas.' },
  { id: 'tecnologia', name: 'Tecnología & Celulares', badge: 'Garantía', icon: 'Smartphone', description: 'Auriculares inalámbricos, parlantes bluetooth, smartwatches, power banks y memorias USB.' },
  { id: 'abarrotes', name: 'Abarrotes & Canasta Básica', badge: 'Esencial', icon: 'ShoppingBasket', description: 'Arroz, azúcar rubia de caña, aceites, fideos y conservas familiares y mayoristas.' },
  { id: 'hogar', name: 'Hogar & Limpieza', badge: 'Empresas & Hogar', icon: 'Sparkles', description: 'Papel higiénico suave, detergentes multiuso y artículos de aseo.' },
  { id: 'cafe', name: 'Café de Especialidad', badge: '84+ Puntos', icon: 'Coffee', description: 'Cafés de altura del Monzón y Castillo Grande, molido y grano tostado.' },
  { id: 'cacao', name: 'Cacao, Chocolate & Miel', badge: 'Regional', icon: 'Sun', description: 'Tabletas al 70%, pasta tradicional, miel pura y derivados amazónicos.' },
  { id: 'frutas', name: 'Frutas, Chifles & Snacks', badge: 'Crocantes', icon: 'Apple', description: 'Chifles crocantes de plátano bellaco, frutos deshidratados y licores típicos.' },
] as const;

export const LOCATIONS = [
  'Tingo María (Centro / Rupa-Rupa)',
  'Castillo Grande',
  'Naranjillo / Luyando',
  'Valle del Monzón',
  'Mariano Dámaso Beraún (Las Palmas)',
  'Bella Durmiente (Zona Turística)',
  'Cueva de las Pavas',
  'Aucayacu (Leoncio Prado)',
  'Pueblo Nuevo',
] as const;

export const APP_METADATA = {
  name: 'JUÁCIL',
  slogan: 'Tu tienda online',
  description: 'Marketplace integral de Tingo María y la Selva Central: calzado, ropa, ferretería, plastiquería, tecnología, abarrotes y productos del campo para familias y negocios.',
  region: 'Tingo María y alrededores (Leoncio Prado, Huánuco)',
  version: '2.5.0-multicategoria',
};
