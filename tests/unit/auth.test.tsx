import { beforeEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterCustomerPage } from '@/pages/auth/RegisterCustomerPage';
import { RegisterBusinessPage } from '@/pages/auth/RegisterBusinessPage';
import { RecoverPasswordPage } from '@/pages/auth/RecoverPasswordPage';

function mount(path = '/acceso') {
  render(<MemoryRouter initialEntries={[path]}><SessionProvider><Routes>
    <Route path="/acceso" element={<LoginPage />} />
    <Route path="/registro/cliente" element={<RegisterCustomerPage />} />
    <Route path="/registro/emprendimiento" element={<RegisterBusinessPage />} />
    <Route path="/recuperar-acceso" element={<RecoverPasswordPage />} />
    <Route path="/perfil" element={<p>Destino cliente</p>} />
    <Route path="/panel" element={<p>Destino negocio</p>} />
    <Route path="/admin" element={<p>Destino administrador</p>} />
    <Route path="/catalogo" element={<p>Destino catálogo</p>} />
    <Route path="/pedido/confirmar" element={<p>Retorno al pedido</p>} />
  </Routes></SessionProvider></MemoryRouter>);
  return userEvent.setup();
}

describe('Recorridos del módulo de acceso', () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    LocalStoreRepository.resetToInitial();
  });

  it('no concede un perfil cuando el correo no existe', async () => {
    const user = mount();
    await user.type(screen.getByLabelText(/Correo electrónico o celular/), 'desconocido@ejemplo.pe');
    await user.click(screen.getByRole('button', { name: 'Entrar a mi cuenta' }));
    expect(screen.getByRole('alert')).toHaveTextContent('No encontramos una cuenta');
    expect(screen.queryByText('Destino cliente')).not.toBeInTheDocument();
  });

  it.each([
    ['Explorar como comprador', 'Destino cliente'],
    ['Gestionar un negocio', 'Destino negocio'],
    ['Administrar la plataforma', 'Destino administrador'],
  ])('abre el perfil demo: %s', async (button, destination) => {
    const user = mount();
    await user.click(screen.getByRole('button', { name: new RegExp(button) }));
    expect(await screen.findByText(destination)).toBeInTheDocument();
  });

  it('rechaza un perfil suspendido sin cambiar la sesión activa', async () => {
    LocalStoreRepository.updateUserStatus('user-merchant-01', 'suspended');
    const user = mount();
    await user.click(screen.getByRole('button', { name: /Gestionar un negocio/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('suspendida');
    expect(localStorage.getItem('juacil_active_user_id_v1.0')).toBe('user-client-01');
  });

  it('regresa al pedido después de entrar con un correo registrado', async () => {
    const user = mount('/acceso?redirect=%2Fpedido%2Fconfirmar');
    await user.type(screen.getByLabelText(/Correo electrónico o celular/), 'lucia.ramos@ejemplo.pe');
    await user.click(screen.getByRole('button', { name: 'Entrar a mi cuenta' }));
    expect(await screen.findByText('Retorno al pedido')).toBeInTheDocument();
  });

  it('ignora un retorno externo y mantiene la navegación en la aplicación', async () => {
    const user = mount('/acceso?redirect=%2F%2Fejemplo.pe');
    await user.click(screen.getByRole('button', { name: /Explorar como comprador/ }));
    expect(await screen.findByText('Destino cliente')).toBeInTheDocument();
  });

  it('guarda el cliente registrado e inicia su sesión', async () => {
    const user = mount('/registro/cliente');
    await user.type(screen.getByLabelText(/Nombre completo/), 'Ana Flores');
    await user.type(screen.getByLabelText(/Correo electrónico/), 'ana@ejemplo.pe');
    await user.type(screen.getByLabelText(/Celular de contacto/), '987123456');
    await user.type(screen.getByLabelText(/Dirección o ciudad/), 'Chanchamayo');
    await user.click(screen.getByRole('button', { name: 'Crear mi cuenta' }));
    expect(await screen.findByText('Destino catálogo')).toBeInTheDocument();
    const saved = LocalStoreRepository.getUsers().find(u => u.email === 'ana@ejemplo.pe');
    expect(saved?.role).toBe('cliente');
    await waitFor(() => expect(localStorage.getItem('juacil_active_user_id_v1.0')).toBe(saved?.id));
  });

  it('crea un negocio sin RUC y vincula al responsable', async () => {
    const user = mount('/registro/emprendimiento');
    await user.type(screen.getByLabelText(/Nombre del emprendimiento/), 'Finca de prueba');
    await user.type(screen.getByLabelText(/Cuéntanos qué ofreces/), 'Café tostado de nuestra finca.');
    await user.type(screen.getByLabelText(/Nombre del responsable/), 'Juan Santos');
    await user.type(screen.getByLabelText(/Correo electrónico/), 'juan@ejemplo.pe');
    await user.type(screen.getByLabelText(/WhatsApp de contacto/), '987654321');
    await user.click(screen.getByRole('button', { name: 'Registrar mi negocio' }));
    expect(await screen.findByText('Destino negocio')).toBeInTheDocument();
    const owner = LocalStoreRepository.getUsers().find(u => u.email === 'juan@ejemplo.pe');
    const business = LocalStoreRepository.getBusinessById(owner!.businessId!);
    expect(owner?.role).toBe('merchant');
    expect(business?.ownerId).toBe(owner?.id);
    expect(business?.ruc).toBeUndefined();
    expect(business?.onboardingStep).toBe(2);
  });

  it('muestra recuperación simulada y permite corregir el correo', async () => {
    const user = mount('/recuperar-acceso');
    await user.type(screen.getByLabelText(/Correo electrónico/), 'ana@ejemplo.pe');
    await user.click(screen.getByRole('button', { name: 'Probar recuperación' }));
    expect(screen.getByRole('status')).toHaveTextContent('ana@ejemplo.pe');
    expect(screen.getByText(/no se envió ningún correo/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Usar otro correo' }));
    expect(screen.getByLabelText(/Correo electrónico/)).toHaveValue('ana@ejemplo.pe');
  });
});
