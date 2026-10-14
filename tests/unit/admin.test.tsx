import { beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/app/providers/SessionProvider';
import { AdminLayout } from '@/app/layouts/AdminLayout';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { LocalStoreRepository } from '@/shared/lib/storage';

function mount(path = '/admin') {
  render(<MemoryRouter initialEntries={[path]}><SessionProvider><Routes>
    <Route element={<ProtectedRoute requiredRole="admin" />}><Route element={<AdminLayout />}>
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/:section" element={<AdminDashboardPage />} />
    </Route></Route>
    <Route path="/403" element={<p>Acceso denegado</p>} />
  </Routes></SessionProvider></MemoryRouter>);
  return userEvent.setup();
}

describe('Administración de JUÁCIL', () => {
  beforeEach(() => { cleanup(); localStorage.clear(); LocalStoreRepository.resetToInitial(); localStorage.setItem('juacil_active_user_id_v1.0', 'user-admin-01'); });

  it('abre rutas directas y enlaces de navegación con el contenido correspondiente', async () => {
    const user = mount('/admin/usuarios');
    expect(screen.getByRole('heading', { name: 'Usuarios y accesos' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Pedidos' }));
    expect(screen.getByRole('heading', { name: 'Pedidos de la plataforma' })).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Resumen' }));
    expect(screen.getByRole('heading', { name: 'Resumen de la plataforma' })).toBeInTheDocument();
  });

  it('mantiene los enlaces anteriores con parámetro tab', () => {
    mount('/admin?tab=usuarios');
    expect(screen.getByRole('heading', { name: 'Usuarios y accesos' })).toBeInTheDocument();
  });

  it('deniega administración a un cliente', () => {
    localStorage.setItem('juacil_active_user_id_v1.0', 'user-client-01'); mount();
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Exportar datos' })).not.toBeInTheDocument();
  });

  it('filtra tiendas y no cambia su estado hasta confirmar', async () => {
    const business = LocalStoreRepository.getBusinesses()[0];
    LocalStoreRepository.updateBusinessStatus(business.id, 'active');
    const user = mount('/admin/tiendas');
    await user.type(screen.getByLabelText('Buscar tienda'), business.name);
    const row = screen.getByText(business.name).closest('tr')!;
    await user.click(within(row).getByRole('button', { name: 'Suspender' }));
    expect(LocalStoreRepository.getBusinessById(business.id)?.status).toBe('active');
    await user.click(screen.getByRole('button', { name: 'Confirmar cambio' }));
    expect(LocalStoreRepository.getBusinessById(business.id)?.status).toBe('suspended');
    expect(screen.getByText(`La tienda «${business.name}» está suspendida.`)).toBeInTheDocument();
  });

  it('permite cancelar la eliminación y protege la cuenta del administrador activo', async () => {
    const user = mount('/admin/usuarios');
    const admin = LocalStoreRepository.getUserById('user-admin-01')!;
    const adminRow = screen.getByText(admin.email).closest('tr')!;
    expect(within(adminRow).queryByRole('button', { name: /Eliminar usuario/ })).not.toBeInTheDocument();
    const candidate = LocalStoreRepository.getUserById('user-client-01')!;
    await user.click(screen.getByRole('button', { name: `Eliminar usuario ${candidate.name}` }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(LocalStoreRepository.getUserById(candidate.id)).toBeDefined();
    await user.click(screen.getByRole('button', { name: `Eliminar usuario ${candidate.name}` }));
    await user.click(screen.getByRole('button', { name: 'Eliminar registro' }));
    expect(LocalStoreRepository.getUserById(candidate.id)).toBeUndefined();
    expect(LocalStoreRepository.getUserById(admin.id)).toBeDefined();
  });

  it('crea un emprendedor vinculado al negocio seleccionado', async () => {
    const business = LocalStoreRepository.getBusinesses()[0];
    const user = mount('/admin/usuarios');
    await user.click(screen.getByRole('button', { name: 'Crear usuario' }));
    await user.type(screen.getByLabelText('Nombre completo'), 'Rosa de prueba');
    await user.type(screen.getByLabelText('Correo electrónico'), 'rosa.admin@ejemplo.pe');
    await user.type(screen.getByLabelText('Celular'), '987654321');
    await user.selectOptions(within(screen.getByRole('dialog')).getByLabelText('Rol', { exact: true }), 'merchant');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear usuario' }));
    expect(await screen.findByText('Selecciona el negocio que administrará este emprendedor.')).toBeInTheDocument();
    expect(LocalStoreRepository.getUsers().find(u => u.email === 'rosa.admin@ejemplo.pe')).toBeUndefined();
    await user.selectOptions(screen.getByLabelText('Negocio asignado'), business.id);
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Crear usuario' }));
    const created = LocalStoreRepository.getUsers().find(u => u.email === 'rosa.admin@ejemplo.pe');
    expect(created?.businessId).toBe(business.id); expect(created?.role).toBe('merchant');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('el diálogo conserva el foco, cierra con Escape y lo devuelve al disparador', async () => {
    const user = mount('/admin/tiendas');
    const trigger = screen.getByRole('button', { name: 'Registrar tienda' });
    await user.click(trigger);
    expect(screen.getByLabelText('Nombre comercial')).toHaveFocus();
    const dialog = screen.getByRole('dialog');
    within(dialog).getByRole('button', { name: 'Registrar tienda' }).focus();
    await user.tab();
    expect(within(dialog).getByRole('button', { name: 'Cerrar ventana emergente' })).toHaveFocus();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(trigger).toHaveFocus();
  });

  it('registra una tienda con los datos ingresados y los conserva en el repositorio', async () => {
    const user = mount('/admin/tiendas');
    await user.click(screen.getByRole('button', { name: 'Registrar tienda' }));
    await user.type(screen.getByLabelText('Nombre comercial'), 'Café de prueba');
    await user.type(screen.getByLabelText('WhatsApp de contacto'), '987654321');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Registrar tienda' }));
    const business = LocalStoreRepository.getBusinesses().find(b => b.name === 'Café de prueba');
    expect(business?.whatsapp).toBe('987654321'); expect(business?.status).toBe('active');
    expect(business?.ownerId).toBe('user-admin-01');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra importes históricos al abrir el detalle del pedido', async () => {
    const order = LocalStoreRepository.getOrders()[0];
    const user = mount('/admin/pedidos');
    await user.click(screen.getByRole('button', { name: order.orderCode }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(order.items[0].productName, { exact: false })).toBeInTheDocument();
    expect(within(dialog).getByText('Historial de estados')).toBeInTheDocument();
    expect(LocalStoreRepository.getOrderById(order.id)?.status).toBe(order.status);
  });
});
