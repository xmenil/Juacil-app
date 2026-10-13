export const CATEGORIES = [
  { id: 'cafe', name: 'Café de Especialidad', icon: 'Coffee', description: 'Granos de altura, tueste artesanal de Villa Rica y Oxapampa' },
  { id: 'cacao', name: 'Cacao & Chocolatería', icon: 'Sparkles', description: 'Chocolates finos al 70%, nibs y manteca de Chanchamayo' },
  { id: 'miel', name: 'Miel & Apicultura', icon: 'Sun', description: 'Miel pura de monte, polen y propóleo virgen' },
  { id: 'artesania', name: 'Artesanía Indígena', icon: 'Feather', description: 'Tejidos y tallados ancestrales Yánesha y Asháninka' },
  { id: 'frutas', name: 'Frutas & Deshidratados', icon: 'Apple', description: 'Plátano bellaco, piña Golden y camu camu' },
  { id: 'superfoods', name: 'Superfoods & Aceites', icon: 'ShieldCheck', description: 'Sacha inchi, macambo y aguaje amazónico' },
] as const;

export const LOCATIONS = [
  'Villa Rica (Pasco)',
  'Oxapampa (Pasco)',
  'Chanchamayo (Junín)',
  'La Merced (Junín)',
  'Satipo (Junín)',
  'Pichanaqui (Junín)',
  'San Ramón (Junín)',
] as const;

export const APP_METADATA = {
  name: 'JUÁCIL',
  slogan: 'Tu tienda online',
  description: 'Plataforma para que las micro y pequeñas empresas (MYPES) de la Selva peruana exhiban y coordinen sus ventas fácilmente.',
  region: 'Selva Central del Perú',
  version: '1.0.0-prototipo',
};
