import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { MOCK_USERS } from '@/entities/user/model/mockUsers';
import { ROUTES } from '@/shared/config/routes';
import { UserCheck, Store, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginAs } = useSession();
  const navigate = useNavigate();

  const handleSelectUser = (userId: string, isMerchantUser: boolean) => {
    loginAs(userId);
    if (isMerchantUser) {
      navigate(ROUTES.MERCHANT_DASHBOARD);
    } else {
      navigate(ROUTES.CATALOG);
    }
  };

  const clientUsers = MOCK_USERS.filter((u) => u.role === 'cliente');
  const merchantUsers = MOCK_USERS.filter((u) => u.role === 'merchant');

  return (
    <div style={{ padding: '48px 0 64px' }}>
      <div className="container" style={{ maxWidth: '640px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary-700)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              DEMO DE ACCESO RÁPIDO
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-primary-950)', marginTop: '4px' }}>
              Inicia Sesión en JUÁCIL
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '6px' }}>
              Selecciona un perfil preconfigurado con 1 clic para probar los roles y permisos del prototipo.
            </p>
          </div>

          {/* Emprendedores */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-primary-900)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Store size={16} /> Perfiles de Emprendedores MYPE:
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {merchantUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id, true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: 'var(--color-surface)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-600)';
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={user.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{user.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {user.businessId === 'biz-cafe-aroma'
                          ? 'Café Aroma de Oxapampa'
                          : user.businessId === 'biz-cacao-miel'
                          ? 'Chanchamayo Cacao & Miel'
                          : 'Artesanías Ancestrales Yánesha'}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={16} color="var(--color-primary-700)" />
                </div>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} /> Perfiles de Clientes Compradores:
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {clientUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user.id, false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1.5px solid var(--color-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    backgroundColor: 'var(--color-surface)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-primary-600)';
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)';
                    e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={user.avatarUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                    <div>
                      <strong style={{ fontSize: '14px', display: 'block' }}>{user.name}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {user.address}
                      </span>
                    </div>
                  </div>

                  <ArrowRight size={16} color="var(--color-primary-700)" />
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <Link to={ROUTES.REGISTER_BUSINESS} style={{ color: 'var(--color-primary-800)', fontWeight: 600 }}>
              ¿Quieres registrar un nuevo emprendimiento? Haz clic aquí
            </Link>
            <Link to={ROUTES.RECOVER_ACCESS} style={{ color: 'var(--color-text-subtle)' }}>
              ¿Olvidaste tu contraseña? (Recuperación simulada)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
