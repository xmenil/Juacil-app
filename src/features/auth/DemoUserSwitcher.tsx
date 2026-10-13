import React, { useState } from 'react';
import { useSession } from '@/app/providers/SessionProvider';
import { useConnectivity } from '@/app/providers/ConnectivityProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { MOCK_USERS } from '@/entities/user/model/mockUsers';
import { Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import styles from './DemoUserSwitcher.module.css';

export const DemoUserSwitcher: React.FC = () => {
  const { currentUser, loginAs, logout } = useSession();
  const { isOnline, isSimulatedOffline, toggleSimulatedOffline } = useConnectivity();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'guest') {
      logout();
    } else {
      loginAs(val);
    }
  };

  const handleConfirmReset = () => {
    LocalStoreRepository.resetToFactoryDefaults();
    setIsResetModalOpen(false);
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
            <optgroup label="Clientes Compradores">
              {MOCK_USERS.filter((u) => u.role === 'cliente').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} (Cliente)
                </option>
              ))}
            </optgroup>
            <optgroup label="Emprendedores de la Selva (MYPES)">
              {MOCK_USERS.filter((u) => u.role === 'merchant').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.businessId === 'biz-cafe-aroma' ? 'Café Aroma' : u.businessId === 'biz-cacao-miel' ? 'Cacao & Miel' : 'Artesanías Yánesha'})
                </option>
              ))}
            </optgroup>
            <option value="guest">Visitante no autenticado</option>
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
