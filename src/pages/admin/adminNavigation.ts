export type AdminSection = 'resumen' | 'tiendas' | 'usuarios' | 'pedidos' | 'encuestas';

export function getAdminSection(pathname: string, tab: string | null): AdminSection {
  const segment = pathname.split('/')[2];
  if (segment === 'tiendas' || segment === 'usuarios' || segment === 'pedidos' || segment === 'encuestas') return segment;
  if (tab === 'tiendas' || tab === 'usuarios' || tab === 'pedidos' || tab === 'encuestas') return tab;
  return 'resumen';
}
