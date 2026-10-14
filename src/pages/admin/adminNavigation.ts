export type AdminSection = 'resumen' | 'tiendas' | 'usuarios' | 'pedidos';

export function getAdminSection(pathname: string, tab: string | null): AdminSection {
  const segment = pathname.split('/')[2];
  if (segment === 'tiendas' || segment === 'usuarios' || segment === 'pedidos') return segment;
  if (tab === 'tiendas' || tab === 'usuarios' || tab === 'pedidos') return tab;
  return 'resumen';
}
