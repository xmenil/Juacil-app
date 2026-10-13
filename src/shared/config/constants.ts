export const CATEGORIES = [
  { id: 'abarrotes', name: 'Abarrotes & Canasta Básica', icon: 'ShoppingBasket', description: 'Arroz, azúcar, fideos, aceites, menestras y conservas para el hogar y empresas' },
  { id: 'hogar', name: 'Hogar, Papelería & Limpieza', icon: 'Sparkles', description: 'Papel higiénico, servilletas, detergentes y suministros de aseo' },
  { id: 'cafe', name: 'Café de Especialidad', icon: 'Coffee', description: 'Cafés de altura del Valle del Monzón y Castillo Grande' },
  { id: 'cacao', name: 'Cacao & Chocolatería', icon: 'Sparkles', description: 'Chocolates finos al 70%, nibs y manteca de Tingo María' },
  { id: 'miel', name: 'Miel & Apicultura', icon: 'Sun', description: 'Miel pura de monte virgen de Naranjillo y Las Palmas' },
  { id: 'frutas', name: 'Frutas, Chifles & Snacks', icon: 'Apple', description: 'Chifles de plátano bellaco, cecina, camu camu y cocona' },
  { id: 'licores', name: 'Licores & Bebidas Amazónicas', icon: 'Sparkles', description: 'Uvachado, 7 Raíces, chuchuhuasi y macerados de Tingo María' },
  { id: 'artesania', name: 'Artesanía & Souvenirs', icon: 'Feather', description: 'Tallados en madera noble, huayruro y recuerdos de la Bella Durmiente' },
  { id: 'superfoods', name: 'Superfoods & Derivados', icon: 'ShieldCheck', description: 'Sacha inchi, harina de plátano y aguaje de Leoncio Prado' },
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
