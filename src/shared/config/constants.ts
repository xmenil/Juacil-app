export const CATEGORIES = [
  { id: 'abarrotes', name: 'Abarrotes & Canasta Básica', badge: 'Esencial', icon: 'ShoppingBasket', description: 'Arroz, azúcar, aceites, fideos, menestras y conservas familiares y mayoristas.' },
  { id: 'hogar', name: 'Hogar, Papelería & Limpieza', badge: 'Empresas & Hogar', icon: 'Sparkles', description: 'Papel higiénico, servilletas, detergentes, lejía y útiles de aseo.' },
  { id: 'cafe', name: 'Café de Especialidad & Altura', badge: '84+ Puntos', icon: 'Coffee', description: 'Cafés de altura del Monzón y Castillo Grande, molido y grano tostado.' },
  { id: 'cacao', name: 'Cacao, Chocolate & Confitería', badge: 'Cacao Nativo', icon: 'Sparkles', description: 'Tabletas al 70%, pasta pura tradicional y nibs crocantes.' },
  { id: 'miel', name: 'Miel Pura & Apicultura', badge: '100% Virgen', icon: 'Sun', description: 'Miel de monte de la Bella Durmiente, propóleo silvestre y polen puro.' },
  { id: 'frutas', name: 'Frutas, Chifles & Snacks', badge: 'Crocantes', icon: 'Apple', description: 'Chifles de plátano bellaco, frutas deshidratadas y snacks.' },
  { id: 'licores', name: 'Bebidas & Licores Amazónicos', badge: 'Tradicional', icon: 'Wine', description: 'Uvachado, 7 Raíces, chuchuhuasi y macerados típicos de Tingo María.' },
  { id: 'artesania', name: 'Artesanías & Cultura Amazónica', badge: 'Hecho a Mano', icon: 'Feather', description: 'Tallados en madera noble, huayruro y recuerdos emblemáticos de la selva.' },
  { id: 'superfoods', name: 'Superfoods & Derivados del Campo', badge: 'Nutrición', icon: 'ShieldCheck', description: 'Sacha inchi, harina de plátano, aguaje y productos naturales de Leoncio Prado.' },
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
  description: 'Plataforma integral para comprar y vender cualquier producto: canasta básica, abarrotes, artículos del hogar y especialidades de la Amazonía para pequeñas y grandes empresas.',
  region: 'Tingo María y alrededores (Leoncio Prado, Huánuco)',
  version: '2.3.0-multitienda',
};
