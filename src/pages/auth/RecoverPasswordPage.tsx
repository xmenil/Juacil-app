import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';

export const RecoverPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: '64px 0' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '20px', padding: '36px', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
            Recuperar Acceso
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
            Ingresa tu correo para recibir instrucciones de recuperación simuladas.
          </p>

          {submitted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Alert variant="info" title="Instrucciones enviadas (Simulación)">
                Si la cuenta existe en el sistema demostrativo, se ha emitido un enlace de restablecimiento a <strong>{email}</strong>.
              </Alert>
              <Link to={ROUTES.LOGIN}>
                <Button fullWidth variant="outline">
                  Volver al Inicio de Sesión
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Correo Electrónico"
                type="email"
                isRequired
                placeholder="tu@correo.pe"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" size="lg" variant="primary">
                Enviar Enlace de Recuperación
              </Button>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link to={ROUTES.LOGIN} style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Regresar a Iniciar Sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
