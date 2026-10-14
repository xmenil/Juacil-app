import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { AuthLayout } from './AuthLayout';
import styles from './Auth.module.css';

export function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };
  return (
    <AuthLayout title={submitted ? 'Solicitud de prueba completada.' : 'Recupera el acceso a tu cuenta.'} description={submitted ? 'Así se vería la confirmación de recuperación en JUÁCIL.' : 'Ingresa el correo que usaste al registrarte para probar este recorrido.'}>
      {submitted ? (
        <div className={styles.success}>
          <div className={styles.successIcon}><Check aria-hidden="true" /></div>
          <p role="status">Si existe una cuenta asociada a <strong>{email}</strong>, el flujo real permitiría solicitar instrucciones de recuperación.</p>
          <p className={styles.note}>Esta es una simulación: no se envió ningún correo ni se cambió tu cuenta. Puedes volver al acceso y usar un perfil de prueba.</p>
          <Link className={styles.link} to={ROUTES.LOGIN}>Volver a iniciar sesión</Link>
          <Button variant="outline" onClick={() => setSubmitted(false)}>Usar otro correo</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input id="recovery-email" label="Correo electrónico" type="email" autoComplete="email" required isRequired placeholder="tu@correo.pe" value={email} onChange={e => setEmail(e.target.value)} />
          <p className={styles.note}>En este prototipo no se envían correos. Tus datos se conservan mientras pruebas la recuperación.</p>
          <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>Probar recuperación</Button>
          <Link className={styles.link} to={ROUTES.LOGIN}>Volver a iniciar sesión</Link>
        </form>
      )}
    </AuthLayout>
  );
}

