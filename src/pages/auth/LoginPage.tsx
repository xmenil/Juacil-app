import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import {
  UserCheck,
  Store,
  ArrowRight,
  ShoppingCart,
  UserPlus,
  ShieldAlert,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const LoginPage: React.FC = () => {
  const { loginAs } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Credenciales únicas del formulario
  const [credentialInput, setCredentialInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const handleSuccessfulAuth = (userId: string, targetRole: 'cliente' | 'merchant' | 'admin') => {
    const success = loginAs(userId);
    if (!success) return;

    if (redirectUrl) {
      navigate(redirectUrl);
    } else if (targetRole === 'admin') {
      navigate(ROUTES.ADMIN_DASHBOARD);
    } else if (targetRole === 'merchant') {
      navigate(ROUTES.MERCHANT_DASHBOARD);
    } else {
      navigate(ROUTES.CUSTOMER_PROFILE);
    }
  };

  const handleUnifiedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCredential = credentialInput.trim().toLowerCase();

    // 1. Buscar en la lista de usuarios guardados
    const allUsers = LocalStoreRepository.getUsers();
    const matchedUser = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanCredential ||
        u.phone.trim() === credentialInput.trim()
    );

    if (matchedUser) {
      handleSuccessfulAuth(matchedUser.id, matchedUser.role);
      return;
    }

    // 2. Detección inteligente por palabra clave si se usa credencial demo genérica
    if (cleanCredential.includes('admin')) {
      handleSuccessfulAuth('user-admin-01', 'admin');
    } else if (
      cleanCredential.includes('tienda') ||
      cleanCredential.includes('mype') ||
      cleanCredential.includes('cafe') ||
      cleanCredential.includes('faustino') ||
      cleanCredential.includes('vendedor')
    ) {
      handleSuccessfulAuth('user-merchant-01', 'merchant');
    } else {
      // Por defecto accede como cliente comprador
      handleSuccessfulAuth('user-client-01', 'cliente');
    }
  };

  const fillAndLogin = (email: string, userId: string, role: 'cliente' | 'merchant' | 'admin') => {
    setCredentialInput(email);
    setPasswordInput('••••••••');
    setLoginMessage(`Iniciando sesión con rol de ${role.toUpperCase()}...`);
    setTimeout(() => {
      handleSuccessfulAuth(userId, role);
    }, 250);
  };

  return (
    <div style={{ padding: '36px 16px 80px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 120px)' }}>
      <div className="container" style={{ maxWidth: '820px' }}>
        {/* Banner de Redirección si venía de intentar una compra o acción */}
        {redirectUrl && (
          <div style={{ marginBottom: '20px' }}>
            <Alert variant="warning" title="Inicio de Sesión Requerido">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <span>
                  Para completar tu pedido o continuar con este proceso, por favor inicia sesión o selecciona un usuario de prueba demo a continuación.
                </span>
              </div>
            </Alert>
          </div>
        )}

        {/* Tarjeta Principal de Inicio de Sesión Unificado */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            marginBottom: '36px',
          }}
        >
          {/* Cabecera */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <img
                src="/images/juacil-logo.png"
                alt="JUÁCIL"
                style={{ height: '42px', width: 'auto', objectFit: 'contain' }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#135d38',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  backgroundColor: '#e8f5e9',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                }}
              >
                ACCESO UNIVERSAL
              </span>
            </div>

            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0b4526', margin: '0 0 6px 0' }}>
              Iniciar Sesión en JUÁCIL
            </h1>
            <p style={{ color: '#64748b', fontSize: '14.5px', margin: 0, maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
              Ingresa con tus credenciales de <strong>Cliente</strong>, <strong>Tienda MYPE</strong> o <strong>Administrador general</strong>. El sistema detectará automáticamente tus permisos.
            </p>
          </div>

          {/* Formulario Unificado */}
          <form onSubmit={handleUnifiedSubmit} style={{ maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                Correo electrónico o Teléfono Celular
              </label>
              <input
                type="text"
                required
                placeholder="ej. lucia.ramos@ejemplo.pe o 984512301"
                value={credentialInput}
                onChange={(e) => setCredentialInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#135d38')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b' }}>
                  Contraseña
                </label>
                <Link
                  to={ROUTES.RECOVER_ACCESS}
                  style={{ fontSize: '12.5px', color: '#135d38', fontWeight: 600, textDecoration: 'none' }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 42px 12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#135d38')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                  }}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label="Alternar visibilidad de contraseña"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {loginMessage && (
              <div style={{ fontSize: '13px', color: '#166534', backgroundColor: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={15} />
                <span>{loginMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              style={{
                width: '100%',
                marginTop: '4px',
                fontWeight: 800,
                fontSize: '15px',
                padding: '14px',
                backgroundColor: '#135d38',
              }}
              rightIcon={<ArrowRight size={17} />}
            >
              Iniciar Sesión
            </Button>

            {/* Enlaces de Creación de Cuentas */}
            <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
              ¿Aún no tienes una cuenta?{' '}
              <Link to={ROUTES.REGISTER_CUSTOMER} style={{ color: '#135d38', fontWeight: 700 }}>
                Regístrate como Cliente
              </Link>
              <span style={{ margin: '0 8px' }}>•</span>
              <Link to={ROUTES.REGISTER_BUSINESS} style={{ color: '#135d38', fontWeight: 700 }}>
                Registrar Tienda MYPE
              </Link>
            </div>
          </form>
        </div>

        {/* ====================================================================
            SECCIÓN DE USUARIOS DE PRUEBA DEMO (CLIENTE, TIENDA Y SUPER ADMIN)
            ==================================================================== */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #e2e8f0',
            padding: '32px 28px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#0b4526',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                backgroundColor: '#dcfce7',
                padding: '4px 12px',
                borderRadius: '9999px',
                marginBottom: '8px',
              }}
            >
              <UserCheck size={14} /> USUARIOS DE PRUEBA (ACCESO RÁPIDO CON 1 CLIC)
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0b4526', margin: '0 0 6px 0' }}>
              Prueba los 3 Roles Independientes de la Plataforma
            </h2>
            <p style={{ color: '#64748b', fontSize: '13.5px', margin: 0 }}>
              Haz clic en cualquier tarjeta para ingresar de inmediato con su perfil, permisos y paneles correspondientes:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '16px',
            }}
          >
            {/* 1. Tarjeta Cliente Comprador */}
            <div
              onClick={() => fillAndLogin('lucia.ramos@ejemplo.pe', 'user-client-01', 'cliente')}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '20px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(22, 163, 74, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#166534',
                      backgroundColor: '#dcfce7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    🛒 CLIENTE
                  </span>
                  <ShoppingCart size={16} color="#166534" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                    alt="Lucía Ramos"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #bbf7d0' }}
                  />
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#0b4526', display: 'block' }}>
                      Lucía Ramos Córdova
                    </strong>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>lucia.ramos@ejemplo.pe</span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Compra canasta básica, abarrotes y productos selváticos con carrito y seguimiento de pedidos en vivo.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#166534',
                  color: '#ffffff',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Entrar como Cliente <ArrowRight size={14} />
              </div>
            </div>

            {/* 2. Tarjeta Tienda MYPE */}
            <div
              onClick={() => fillAndLogin('faustino@cafemonzon.pe', 'user-merchant-01', 'merchant')}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '20px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#d97706';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(217, 119, 6, 0.14)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#92400e',
                      backgroundColor: '#fef3c7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    🏪 TIENDA MYPE
                  </span>
                  <Store size={16} color="#92400e" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                    alt="Don Faustino"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fde68a' }}
                  />
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#0b4526', display: 'block' }}>
                      Don Faustino Alania
                    </strong>
                    <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>Café Valle del Monzón</span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Seller Center: edita productos, sube fotos desde tu laptop, atiende pedidos y gestiona horarios de tu negocio.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#b45309',
                  color: '#ffffff',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Entrar como Tienda <ArrowRight size={14} />
              </div>
            </div>

            {/* 3. Tarjeta Super Administrador de la Plataforma */}
            <div
              onClick={() => fillAndLogin('admin@juacil.pe', 'user-admin-01', 'admin')}
              style={{
                backgroundColor: '#f8fafc',
                border: '1.5px solid #cbd5e1',
                borderRadius: '16px',
                padding: '20px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#991b1b';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(153, 27, 27, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#991b1b',
                      backgroundColor: '#fee2e2',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    🛡️ SUPER ADMIN
                  </span>
                  <ShieldAlert size={16} color="#991b1b" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                    alt="Admin General"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fecaca' }}
                  />
                  <div>
                    <strong style={{ fontSize: '14.5px', color: '#0b4526', display: 'block' }}>
                      Admin General JUÁCIL
                    </strong>
                    <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 600 }}>admin@juacil.pe</span>
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: '#475569', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                  Control maestro: administra a <strong>todos los usuarios</strong>, activa o suspende tiendas MYPE y supervisa toda la app.
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  backgroundColor: '#0b4526',
                  color: '#ffffff',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                }}
              >
                Entrar como Super Admin <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Enlaces de Ayuda Inferior */}
        <div style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#64748b' }}>
          <Link to={ROUTES.HELP} style={{ color: '#135d38', fontWeight: 600, textDecoration: 'none' }}>
            Centro de Ayuda y Validación
          </Link>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>JUÁCIL - Tu tienda online • Tingo María y Selva Central</span>
        </div>
      </div>
    </div>
  );
};
