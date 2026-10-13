import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { MOCK_USERS } from '@/entities/user/model/mockUsers';
import { ROUTES } from '@/shared/config/routes';
import { UserCheck, Store, ArrowRight, ShoppingCart, UserPlus } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export const LoginPage: React.FC = () => {
  const { loginAs } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tipo') === 'tienda' ? 'tienda' : 'cliente';
  const [activeTab, setActiveTab] = useState<'cliente' | 'tienda'>(initialTab);

  // Form states simulados
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleSelectUser = (userId: string, isMerchantUser: boolean) => {
    loginAs(userId);
    if (isMerchantUser) {
      navigate(ROUTES.MERCHANT_DASHBOARD);
    } else {
      navigate(ROUTES.CATALOG);
    }
  };

  const handleSimulatedFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'tienda') {
      // Login como primer comerciante de prueba
      loginAs('user-merchant-01');
      navigate(ROUTES.MERCHANT_DASHBOARD);
    } else {
      // Login como primer cliente de prueba
      loginAs('user-client-01');
      navigate(ROUTES.CATALOG);
    }
  };

  const clientUsers = MOCK_USERS.filter((u) => u.role === 'cliente');
  const merchantUsers = MOCK_USERS.filter((u) => u.role === 'merchant');

  return (
    <div style={{ padding: '40px 16px 80px' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        {/* Selector de Rol / Pestañas de Acceso Separadas */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#e2e8f0',
            borderRadius: '16px',
            padding: '4px',
            marginBottom: '24px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('cliente')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'cliente' ? '#ffffff' : 'transparent',
              color: activeTab === 'cliente' ? 'var(--color-primary-800)' : '#64748b',
              boxShadow: activeTab === 'cliente' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.18s ease',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <ShoppingCart size={18} /> Soy Cliente / Comprador
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tienda')}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'tienda' ? '#ffffff' : 'transparent',
              color: activeTab === 'tienda' ? 'var(--color-primary-800)' : '#64748b',
              boxShadow: activeTab === 'tienda' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.18s ease',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Store size={18} /> Soy Tienda / Negocio MYPE
          </button>
        </div>

        {/* Tarjeta de Contenido según la Pestaña Seleccionada */}
        <div
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: '24px',
            padding: '36px 32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          {activeTab === 'cliente' ? (
            /* ========================================================
               SECCIÓN 1: ACCESO CLIENTE COMPRADOR
               ======================================================== */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: 'var(--color-primary-700)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    backgroundColor: '#e8f5e9',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    marginBottom: '8px',
                  }}
                >
                  PORTAL DEL CLIENTE COMPRADOR
                </span>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
                  Inicia Sesión para Comprar
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Compra canasta básica, abarrotes, insumos del hogar y especialidades de la región.
                </p>
              </div>

              {/* Formulario de Login de Cliente */}
              <form onSubmit={handleSimulatedFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-950)' }}>
                    Correo electrónico o Teléfono
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. cliente@gmail.com o 962881234"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-950)' }}>
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: '6px' }}>
                  Iniciar Sesión como Cliente
                </Button>
              </form>

              {/* Registro de Cliente */}
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '14px',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center',
                  marginBottom: '28px',
                }}
              >
                <span style={{ fontSize: '13.5px', color: 'var(--color-text-muted)' }}>
                  ¿Aún no tienes cuenta personal?
                </span>
                <Link
                  to={ROUTES.REGISTER_CUSTOMER}
                  style={{
                    display: 'block',
                    marginTop: '6px',
                    fontWeight: 700,
                    fontSize: '14px',
                    color: 'var(--color-primary-700)',
                  }}
                >
                  <UserPlus size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  Crear cuenta gratis como Cliente Comprador
                </Link>
              </div>

              {/* Acceso Rápido Demo Clientes */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <UserCheck size={15} /> O prueba con un clic (Cuentas demo de Clientes):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {clientUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user.id, false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary-600)';
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={user.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--color-primary-950)' }}>{user.name}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>{user.address}</span>
                        </div>
                      </div>
                      <ArrowRight size={15} color="var(--color-primary-700)" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================
               SECCIÓN 2: ACCESO TIENDA / NEGOCIO MYPE
               ======================================================== */
            <div>
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#135d38',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    backgroundColor: '#dcfce7',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    marginBottom: '8px',
                  }}
                >
                  PANEL EXCLUSIVO PARA TIENDAS Y MYPES
                </span>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)' }}>
                  Acceso al Panel de Tienda
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Gestiona tu inventario, actualiza precios, confirma pedidos y recibe alertas en tiempo real.
                </p>
              </div>

              {/* Formulario de Login de Tienda */}
              <form onSubmit={handleSimulatedFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-950)' }}>
                    RUC, DNI o Correo de la Empresa
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. 20608912345 o tienda@gmail.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--color-primary-950)' }}>
                    Contraseña de Administrador
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--color-border)',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>

                <Button type="submit" variant="primary" size="lg" style={{ width: '100%', marginTop: '6px', backgroundColor: '#135d38' }}>
                  Ingresar a mi Panel de Tienda
                </Button>
              </form>

              {/* Registro de Tienda / MYPE */}
              <div
                style={{
                  padding: '18px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '14px',
                  border: '1.5px solid #bbf7d0',
                  textAlign: 'center',
                  marginBottom: '28px',
                }}
              >
                <strong style={{ display: 'block', fontSize: '14px', color: '#135d38', marginBottom: '2px' }}>
                  ¿Quieres vender tus productos en JUÁCIL?
                </strong>
                <p style={{ fontSize: '12px', color: '#166534', margin: '0 0 10px 0' }}>
                  Abierto para bodegas, distribuidores, productores agrícolas y empresas de cualquier tamaño.
                </p>
                <Link
                  to={ROUTES.REGISTER_BUSINESS}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    backgroundColor: '#135d38',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '9999px',
                    textDecoration: 'none',
                  }}
                >
                  <Store size={15} /> Registrar mi Tienda / MYPE Ahora
                </Link>
              </div>

              {/* Acceso Rápido Demo Emprendedores */}
              <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Store size={15} /> O prueba con un clic (Tiendas demo preconfiguradas):
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {merchantUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user.id, true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#135d38';
                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={user.avatarUrl} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <strong style={{ fontSize: '13.5px', display: 'block', color: 'var(--color-primary-950)' }}>{user.name}</strong>
                          <span style={{ fontSize: '12px', color: '#135d38', fontWeight: 600 }}>
                            {user.businessId === 'biz-cafe-aroma'
                              ? 'Café Aroma de Oxapampa & Monzón'
                              : user.businessId === 'biz-cacao-miel'
                              ? 'Chocolates & Miel Bella Durmiente'
                              : 'Distribuidora & Bodega Central'}
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={15} color="#135d38" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Ayuda y Recuperación */}
          <div style={{ borderTop: '1px solid var(--color-border-subtle)', marginTop: '24px', paddingTop: '16px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12.5px', color: '#64748b' }}>
            <Link to={ROUTES.HELP} style={{ color: 'var(--color-primary-800)', fontWeight: 600 }}>
              Centro de Ayuda
            </Link>
            <span>•</span>
            <Link to={ROUTES.RECOVER_ACCESS} style={{ color: 'var(--color-text-subtle)' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
