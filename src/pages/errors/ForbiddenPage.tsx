import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '64px 16px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '540px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--color-danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-danger)' }}>
          <ShieldAlert size={40} />
        </div>

        <div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-danger)', letterSpacing: '0.05em' }}>
            ERROR 403 • ACCESO DENEGADO
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)', marginTop: '4px' }}>
            No tienes permiso para acceder a este recurso
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '8px', lineHeight: 1.5 }}>
            Para garantizar la seguridad y privacidad de las MYPES y compradores, solo puedes
            administrar tus propios productos y consultar tus pedidos asignados.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
            Regresar a la página anterior
          </Button>
          <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => navigate(ROUTES.HOME)}>
            Ir al Inicio de JUÁCIL
          </Button>
        </div>
      </div>
    </div>
  );
};
