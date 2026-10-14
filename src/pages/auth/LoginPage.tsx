import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Store, ShieldCheck } from 'lucide-react';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import type { User } from '@/entities/user/model/types';
import { ROUTES } from '@/shared/config/routes';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Alert } from '@/shared/ui/Alert';
import { AuthLayout } from './AuthLayout';
import styles from './Auth.module.css';

export function LoginPage() {
  const { loginAs } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [credential, setCredential] = useState('');
  const [error, setError] = useState('');
  const users = LocalStoreRepository.getUsers();
  const demoUsers = [
    { user: users.find(u => u.id === 'user-client-01'), label: 'Explorar como comprador', Icon: ShoppingBag },
    { user: users.find(u => u.id === 'user-merchant-01'), label: 'Gestionar un negocio', Icon: Store },
    { user: users.find(u => u.id === 'user-admin-01'), label: 'Administrar la plataforma', Icon: ShieldCheck },
  ];
  const redirect = params.get('redirect');
  const returnPath = redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.includes('\\') ? redirect : null;
  const enter = (user: User) => {
    if (user.status === 'suspended') {
      setError('Esta cuenta está suspendida. Consulta con el administrador de la demostración.');
      return;
    }
    if (!loginAs(user.id)) {
      setError('No pudimos abrir este perfil. Selecciona otro perfil de prueba.');
      return;
    }
    const destination = user.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : user.role === 'merchant' ? ROUTES.MERCHANT_DASHBOARD : ROUTES.CUSTOMER_PROFILE;
    navigate(returnPath || destination);
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = credential.trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === value || u.phone === value);
    if (!user) {
      setError('No encontramos una cuenta con esos datos. Revisa tu correo o celular, o elige un perfil de prueba.');
      return;
    }
    enter(user);
  };
  return (
    <AuthLayout title="Qué bueno tenerte de vuelta." description="Entra a tu cuenta para consultar tus pedidos o continuar con tu negocio.">
      {returnPath && <Alert variant="info">Inicia sesión para continuar con el proceso que estabas realizando.</Alert>}
      <form className={styles.form} onSubmit={onSubmit}>
        <Input id="login-credential" label="Correo electrónico o celular" autoComplete="username" required isRequired placeholder="Tu correo o celular de 9 dígitos" value={credential} error={error || undefined} onChange={e => { setCredential(e.target.value); setError(''); }} />
        <p className={styles.note}><strong>Acceso de demostración.</strong> Usa el correo o celular de una cuenta registrada en este navegador. No necesitas contraseña.</p>
        <Button type="submit" size="lg" fullWidth rightIcon={<ArrowRight size={18} />}>Entrar a mi cuenta</Button>
        <div className={styles.secondary}><Link className={styles.link} to={ROUTES.RECOVER_ACCESS}>¿No recuerdas tus datos?</Link></div>
      </form>
      <div className={styles.switch}>
        <p>¿Primera vez aquí? <Link className={styles.link} to={ROUTES.REGISTER_CUSTOMER}>Crear cuenta de comprador</Link></p>
        <p>¿Tienes un negocio? <Link className={styles.link} to={ROUTES.REGISTER_BUSINESS}>Registrar mi emprendimiento</Link></p>
      </div>
      <section className={styles.demo} aria-labelledby="demo-title">
        <h2 id="demo-title">Prueba JUÁCIL con un perfil de ejemplo</h2>
        <p className={styles.note}>Recorre cada área sin completar un registro.</p>
        <div className={styles.demoList}>
          {demoUsers.map(({ user, label, Icon }) => user && (
            <button key={user.id} type="button" className={styles.demoButton} onClick={() => enter(user)}>
              <Icon size={20} aria-hidden="true" /><span><strong>{label}</strong><small>{user.name}</small></span><ArrowRight size={18} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </AuthLayout>
  );
}

