import { beforeEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SessionProvider, useSession } from '@/app/providers/SessionProvider';
import { ConnectivityProvider } from '@/app/providers/ConnectivityProvider';
import { DemoUserSwitcher } from '@/features/auth/DemoUserSwitcher';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { MOCK_USERS } from '@/entities/user/model/mockUsers';

function LocationTracker() {
  const location = useLocation();
  const { currentUser } = useSession();
  return (
    <div>
      <span data-testid="current-path">{location.pathname}</span>
      <span data-testid="current-user-role">{currentUser?.role || 'guest'}</span>
      <span data-testid="current-user-name">{currentUser?.name || 'Invitado'}</span>
    </div>
  );
}

function mount(initialPath = '/') {
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ConnectivityProvider>
        <SessionProvider>
          <DemoUserSwitcher />
          <LocationTracker />
          <Routes>
            <Route path="/" element={<p>Página Inicio</p>} />
            <Route element={<ProtectedRoute requiredRole="admin" />}>
              <Route path="/admin" element={<p>Panel Administrador</p>} />
            </Route>
            <Route element={<ProtectedRoute requiredRole="merchant" />}>
              <Route path="/panel" element={<p>Panel Emprendedor</p>} />
            </Route>
            <Route path="/403" element={<p>Error 403 Prohibido</p>} />
          </Routes>
        </SessionProvider>
      </ConnectivityProvider>
    </MemoryRouter>
  );
  return userEvent.setup();
}

describe('Manejo de sesiones y perfiles (3 usuarios)', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
    LocalStoreRepository.resetToInitial();
  });

  it('existen exactamente tres usuarios en la aplicación (admin, emprendedor, cliente)', () => {
    expect(MOCK_USERS).toHaveLength(3);

    const roles = MOCK_USERS.map((u) => u.role);
    expect(roles).toContain('admin');
    expect(roles).toContain('merchant');
    expect(roles).toContain('cliente');

    const admin = MOCK_USERS.find((u) => u.role === 'admin');
    const merchant = MOCK_USERS.find((u) => u.role === 'merchant');
    const client = MOCK_USERS.find((u) => u.role === 'cliente');

    expect(admin?.id).toBe('user-admin-01');
    expect(merchant?.id).toBe('user-merchant-01');
    expect(client?.id).toBe('user-client-01');

    const repoUsers = LocalStoreRepository.getUsers();
    expect(repoUsers).toHaveLength(3);
  });

  it('el selector DemoUserSwitcher incluye únicamente los 3 usuarios y el visitante', () => {
    mount('/');
    const select = screen.getByRole('combobox', { name: /Seleccionar perfil demo activo/ });
    const options = Array.from(select.querySelectorAll('option')).map((opt) => opt.value);

    expect(options).toEqual([
      'user-admin-01',
      'user-merchant-01',
      'user-client-01',
      'guest',
    ]);
  });

  it('al cambiar de admin a emprendedor NO lanza 403 y navega fluidamente a /panel', async () => {
    localStorage.setItem('juacil_active_user_id_v1.0', 'user-admin-01');
    const user = mount('/admin');

    expect(screen.getByText('Panel Administrador')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /Seleccionar perfil demo activo/ });
    await user.selectOptions(select, 'user-merchant-01');

    await waitFor(() => {
      expect(screen.queryByText('Error 403 Prohibido')).not.toBeInTheDocument();
      expect(screen.getByTestId('current-path')).toHaveTextContent('/panel');
      expect(screen.getByTestId('current-user-role')).toHaveTextContent('merchant');
      expect(screen.getByText('Panel Emprendedor')).toBeInTheDocument();
    });
  });

  it('al cambiar de emprendedor a cliente NO lanza 403 y navega fluidamente a /', async () => {
    localStorage.setItem('juacil_active_user_id_v1.0', 'user-merchant-01');
    const user = mount('/panel');

    expect(screen.getByText('Panel Emprendedor')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /Seleccionar perfil demo activo/ });
    await user.selectOptions(select, 'user-client-01');

    await waitFor(() => {
      expect(screen.queryByText('Error 403 Prohibido')).not.toBeInTheDocument();
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
      expect(screen.getByTestId('current-user-role')).toHaveTextContent('cliente');
      expect(screen.getByText('Página Inicio')).toBeInTheDocument();
    });
  });

  it('al cambiar de admin a cliente NO lanza 403 y navega fluidamente a /', async () => {
    localStorage.setItem('juacil_active_user_id_v1.0', 'user-admin-01');
    const user = mount('/admin');

    expect(screen.getByText('Panel Administrador')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /Seleccionar perfil demo activo/ });
    await user.selectOptions(select, 'user-client-01');

    await waitFor(() => {
      expect(screen.queryByText('Error 403 Prohibido')).not.toBeInTheDocument();
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
      expect(screen.getByTestId('current-user-role')).toHaveTextContent('cliente');
      expect(screen.getByText('Página Inicio')).toBeInTheDocument();
    });
  });

  it('al seleccionar visitante (guest) cierra sesión y navega a /', async () => {
    localStorage.setItem('juacil_active_user_id_v1.0', 'user-merchant-01');
    const user = mount('/panel');
    const select = screen.getByRole('combobox', { name: /Seleccionar perfil demo activo/ });

    await user.selectOptions(select, 'guest');

    await waitFor(() => {
      expect(screen.queryByText('Error 403 Prohibido')).not.toBeInTheDocument();
      expect(screen.getByTestId('current-path')).toHaveTextContent('/');
      expect(screen.getByTestId('current-user-role')).toHaveTextContent('guest');
      expect(screen.getByText('Página Inicio')).toBeInTheDocument();
    });
  });
});
