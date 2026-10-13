import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { Button } from '@/shared/ui/Button';
import { Compass, Home, Search } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '64px 16px', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'var(--color-surface-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary-800)' }}>
          <Compass size={40} />
        </div>

        <div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-primary-700)', letterSpacing: '0.05em' }}>
            ERROR 404 • PÁGINA NO ENCONTRADA
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-primary-950)', marginTop: '4px' }}>
            Parece que te perdiste en la espesura de la Selva
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', marginTop: '8px', lineHeight: 1.5 }}>
            La dirección que buscas no existe o fue movida. Puedes volver al catálogo principal o
            ir a la portada de JUÁCIL.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button variant="outline" leftIcon={<Search size={16} />} onClick={() => navigate(ROUTES.CATALOG)}>
            Explorar Catálogo
          </Button>
          <Button variant="primary" leftIcon={<Home size={16} />} onClick={() => navigate(ROUTES.HOME)}>
            Ir al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};
