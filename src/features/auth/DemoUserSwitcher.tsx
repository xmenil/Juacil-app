import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { ROUTES } from '@/shared/config/routes';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import styles from './DemoUserSwitcher.module.css';

export const DemoUserSwitcher: React.FC = () => {
  const { currentUser, loginAs, logout } = useSession();
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useConnectivity();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'guest') {
      try {
        sessionStorage.setItem('juacil_switching_to', ROUTES.HOME);
      } catch {}
      logout();
      navigate(ROUTES.HOME);
    } else {
      const user = LocalStoreRepository.getUserById(val);
      if (user) {
        const destination =
          user.role === 'admin'
            ? ROUTES.ADMIN_DASHBOARD
            : user.role === 'merchant'
            ? ROUTES.MERCHANT_DASHBOARD
            : ROUTES.HOME;

        try {
          sessionStorage.setItem('juacil_switching_to', destination);
        } catch {}
        loginAs(user.id);
        navigate(destination);
      }
    }
  };

  const handleConfirmReset = () => {
    LocalStoreRepository.resetToFactoryDefaults();
    loginAs('user-client-01');
    setIsResetModalOpen(false);
    navigate(ROUTES.HOME);
    window.location.reload();
  };

  return (
    <>
      <div className={styles.bar} role="region" aria-label="Controles de demostración de JUÁCIL">
        <div className={styles.leftGroup}>
          <span className={styles.tag}>Modo Prototipo</span>
          <label htmlFor="demo-user-selector" className="sr-only">
            Seleccionar perfil demo activo
          </label>
          <span>👤 Perfil activo:</span>
          <select
            id="demo-user-selector"
            className={styles.userSelect}
            value={currentUser ? currentUser.id : 'guest'}
            onChange={handleUserChange}
          >
            <option value="user-admin-01">🛡️ Administrador: Admin General JUÁCIL</option>
            <option value="user-merchant-01">🏪 Emprendedor: Don Faustino Alania (Café Aroma)</option>
            <option value="user-client-01">🛒 Cliente: Lucía Ramos Córdova</option>
            <option value="guest">👤 Visitante no autenticado (Sin sesión)</option>
          </select>
        </div>

        <div className={styles.rightGroup}>
          {/* Toggle Modo Offline (I02) */}
          <button
            type="button"
            className={[styles.offlineToggle, isSimulatedOffline ? styles.offlineActive : ''].join(' ')}
            onClick={toggleSimulatedOffline}
            title="Alternar simulación de conectividad a internet"
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Online' : 'Modo Offline'}</span>
          </button>

          {/* Reset Datos Demo */}
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() => setIsResetModalOpen(true)}
            title="Restablecer base de datos demo a los valores de fábrica"
          >
            <RotateCcw size={12} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="¿Restablecer datos de demostración?"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsResetModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleConfirmReset}>
              Sí, restablecer de fábrica
            </Button>
          </>
        }
      >
        <p>
          Esta acción restaurará el catálogo original con los 3 negocios de la Selva Central, los 14
          productos y los pedidos de ejemplo. Todos los cambios o pedidos nuevos se descartarán.
        </p>
      </Modal>
    </>
  );
};
