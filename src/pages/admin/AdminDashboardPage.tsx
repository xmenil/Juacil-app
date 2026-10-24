import React, { useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Download, Plus, Search, Store, Users, ShoppingBag, Pause, Trash2, RotateCcw, BarChart3, Star, FileText } from 'lucide-react';
import { useSession } from '@/app/providers/SessionProvider';
import { LocalStoreRepository } from '@/shared/lib/storage';
import { SurveyRepository, type SurveySubmission, QUESTION_DEFINITIONS } from '@/entities/survey/model/surveyRepository';
import { formatMoney } from '@/shared/lib/money';
import { formatDateTime } from '@/shared/lib/date';
import { CATEGORIES } from '@/shared/config/constants';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Modal } from '@/shared/ui/Modal';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { OrderStatusBadge } from '@/entities/order/ui/OrderStatusBadge';
import type { Business } from '@/entities/business/model/types';
import type { User } from '@/entities/user/model/types';
import type { Order } from '@/entities/order/model/types';
import { ORDER_STATUS_LABELS } from '@/entities/order/model/orderStateMachine';
import { CreateStoreForm, CreateUserForm } from './AdminCreateForms';
import { getAdminSection } from './adminNavigation';
import styles from './AdminDashboardPage.module.css';

type Confirmation =
  | { kind: 'store-status'; business: Business; status: 'active' | 'suspended' }
  | { kind: 'user-status'; user: User; status: 'active' | 'suspended' }
  | { kind: 'delete-store'; business: Business }
  | { kind: 'delete-user'; user: User };
const roleLabels = { cliente: 'Cliente', merchant: 'Emprendedor', admin: 'Administrador' };
const storeStatuses = { active: 'Activa', pending: 'Pendiente', suspended: 'Suspendida' };
const headings = {
  resumen: { title: 'Resumen de la plataforma', description: 'Revisa los negocios que requieren atención y la actividad registrada en JUÁCIL.' },
  tiendas: { title: 'Tiendas de la comunidad', description: 'Consulta las MYPES registradas y gestiona su estado en la plataforma.' },
  usuarios: { title: 'Usuarios y accesos', description: 'Gestiona cuentas de clientes, emprendedores y administradores.' },
  pedidos: { title: 'Pedidos de la plataforma', description: 'Consulta las compras registradas y su estado. Los importes corresponden a pedidos demo.' },
  encuestas: { title: 'Validación de Usabilidad (UX)', description: 'Estadísticas y análisis de las 10 preguntas de validación para el informe de innovación (Capítulo III).' },
};

function StoreStatus({ business }: { business: Business }) {
  const status = business.status || 'active';
  return <Badge variant={status === 'active' ? 'success' : status === 'pending' ? 'warning' : 'danger'}>{storeStatuses[status]}</Badge>;
}
function EmptyResults({ onClear }: { onClear: () => void }) {
  return <div className={styles.empty}><Search size={28} aria-hidden="true" /><h2>No hay resultados</h2><p>Prueba otra búsqueda o retira los filtros.</p><Button variant="outline" onClick={onClear}>Limpiar filtros</Button></div>;
}

function downloadDemoData(businesses: Business[], users: User[], products: ReturnType<typeof LocalStoreRepository.getProducts>, orders: Order[]) {
  const exportedAt = new Date().toISOString();
  const blob = new Blob([JSON.stringify({ businesses, users, products, orders, exportedAt }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `juacil-datos-demo-${exportedAt.slice(0, 10)}.json`;
  anchor.click(); URL.revokeObjectURL(url);
}

function downloadSurveyCSV(submissions: SurveySubmission[]) {
  const headers = ['ID', 'Evaluador', 'Perfil', 'Dispositivo', 'Fecha', 'Puntaje_Total (10-50)', 'Porcentaje (%)', 'P1_Navegacion', 'P2_Catalogo', 'P3_Busqueda', 'P4_Carrito', 'P5_Checkout', 'P6_WhatsApp', 'P7_Celular', 'P8_Velocidad', 'P9_Utilidad_MYPE', 'P10_Recomendacion'];
  const rows = submissions.map(s => [
    s.id,
    `"${s.respondentName}"`,
    s.respondentType === 'merchant' ? 'Emprendedor MYPE' : 'Cliente Comprador',
    s.device,
    s.date.slice(0, 10),
    s.score,
    `${s.percentage}%`,
    `"${s.answers.q1 || ''}"`,
    `"${s.answers.q2 || ''}"`,
    `"${s.answers.q3 || ''}"`,
    `"${s.answers.q4 || ''}"`,
    `"${s.answers.q5 || ''}"`,
    `"${s.answers.q6 || ''}"`,
    `"${s.answers.q7 || ''}"`,
    `"${s.answers.q8 || ''}"`,
    `"${s.answers.q9 || ''}"`,
    `"${s.answers.q10 || ''}"`,
  ]);
  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = `juacil-resultados-encuesta-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click(); URL.revokeObjectURL(url);
}

export const AdminDashboardPage: React.FC = () => {
  const { currentUser, isAdmin } = useSession();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const section = getAdminSection(location.pathname, params.get('tab'));
  const [, setRevision] = useState(0);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [creating, setCreating] = useState<'store' | 'user' | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [detail, setDetail] = useState<Order | null>(null);
  const [surveyDetail, setSurveyDetail] = useState<SurveySubmission | null>(null);
  const businesses = LocalStoreRepository.getBusinesses();
  const users = LocalStoreRepository.getUsers();
  const orders = LocalStoreRepository.getOrders().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const products = LocalStoreRepository.getProducts(true);
  const surveyStats = SurveyRepository.getStatistics();
  const surveySubmissions = SurveyRepository.getAll();
  const query = params.get('q') || '';
  const statusFilter = params.get('estado') || 'all';
  const roleFilter = params.get('rol') || 'all';
  const search = query.trim().toLocaleLowerCase('es-PE');
  const matches = (...values: string[]) => values.some(value => value.toLocaleLowerCase('es-PE').includes(search));
  const categoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name || id;
  const pendingStores = businesses.filter(b => b.status === 'pending');
  const activeStores = businesses.filter(b => !b.status || b.status === 'active');
  const deliveredTotal = orders.filter(o => o.status === 'entregado').reduce((sum, o) => sum + o.totalCents, 0);
  const filteredStores = businesses.filter(b => matches(b.name, b.location, categoryName(b.category)) && (statusFilter === 'all' || (b.status || 'active') === statusFilter));
  const filteredUsers = users.filter(u => matches(u.name, u.email, u.phone) && (roleFilter === 'all' || u.role === roleFilter) && (statusFilter === 'all' || (u.status || 'active') === statusFilter));
  const filteredOrders = orders.filter(o => matches(o.orderCode, o.businessName, o.customerName) && (statusFilter === 'all' || o.status === statusFilter));
  const filteredSurveys = surveySubmissions.filter(s =>
    matches(s.respondentName, s.device, s.score.toString(), s.percentage.toString()) &&
    (roleFilter === 'all' || s.respondentType === roleFilter)
  );

  if (!isAdmin) return <Navigate to="/403" replace />;
  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
  };
  const clearFilters = () => {
    const next = new URLSearchParams(params);
    ['q', 'estado', 'rol'].forEach(key => next.delete(key));
    setParams(next, { replace: true });
  };
  const saved = (message: string) => {
    setCreating(null); setConfirmation(null); setError(''); setNotice(message); setRevision(value => value + 1);
  };
  const confirmAction = () => {
    if (!confirmation) return;
    let success = false;
    let message = '';
    switch (confirmation.kind) {
      case 'store-status':
        success = LocalStoreRepository.updateBusinessStatus(confirmation.business.id, confirmation.status);
        message = `La tienda «${confirmation.business.name}» está ${confirmation.status === 'active' ? 'activa' : 'suspendida'}.`; break;
      case 'user-status':
        if (confirmation.user.id === currentUser?.id) return;
        success = LocalStoreRepository.updateUserStatus(confirmation.user.id, confirmation.status);
        message = `La cuenta de ${confirmation.user.name} está ${confirmation.status === 'active' ? 'activa' : 'suspendida'}.`; break;
      case 'delete-store':
        success = LocalStoreRepository.deleteBusiness(confirmation.business.id);
        message = `Se eliminó la tienda «${confirmation.business.name}».`; break;
      case 'delete-user':
        if (confirmation.user.id === currentUser?.id) return;
        success = LocalStoreRepository.deleteUser(confirmation.user.id);
        message = `Se eliminó la cuenta de ${confirmation.user.name}.`; break;
    }
    if (success) saved(message); else { setConfirmation(null); setError('No se pudo actualizar el registro. Vuelve a intentarlo.'); }
  };
  const exportData = () => {
    downloadDemoData(businesses, users, products, orders);
    setNotice('Se descargó la exportación de datos demo en formato JSON.');
  };
  const storeActions = (business: Business) => <div className={styles.actions}>
    <Link className={styles.textLink} to={`/tiendas/${business.id}`}>Ver tienda <ArrowUpRight size={15} aria-hidden="true" /></Link>
    <Button variant="outline" leftIcon={(business.status || 'active') === 'active' ? <Pause size={15} /> : <Check size={15} />}
      onClick={() => setConfirmation({ kind: 'store-status', business, status: (business.status || 'active') === 'active' ? 'suspended' : 'active' })}>
      {(business.status || 'active') === 'active' ? 'Suspender' : 'Activar'}
    </Button>
    <button className={styles.deleteButton} aria-label={`Eliminar tienda ${business.name}`} title="Eliminar tienda"
      onClick={() => setConfirmation({ kind: 'delete-store', business })}><Trash2 size={17} aria-hidden="true" /></button>
  </div>;
  const userActions = (user: User) => <div className={styles.actions}>
    {user.id === currentUser?.id ? <span className={styles.muted}>Tu cuenta</span> : <>
      <Button variant="outline" leftIcon={user.status === 'suspended' ? <Check size={15} /> : <Pause size={15} />}
        onClick={() => setConfirmation({ kind: 'user-status', user, status: user.status === 'suspended' ? 'active' : 'suspended' })}>{user.status === 'suspended' ? 'Reactivar' : 'Suspender'}</Button>
      <button className={styles.deleteButton} aria-label={`Eliminar usuario ${user.name}`} title="Eliminar usuario" onClick={() => setConfirmation({ kind: 'delete-user', user })}><Trash2 size={17} aria-hidden="true" /></button>
    </>}
  </div>;
  const count = section === 'tiendas' ? filteredStores.length : section === 'usuarios' ? filteredUsers.length : section === 'encuestas' ? filteredSurveys.length : filteredOrders.length;
  const confirmationTitle = confirmation?.kind === 'delete-store' ? 'Eliminar tienda' : confirmation?.kind === 'delete-user' ? 'Eliminar usuario' : confirmation?.status === 'suspended' ? 'Confirmar suspensión' : 'Confirmar activación';
  const candidateName = confirmation && ('business' in confirmation ? confirmation.business.name : confirmation.user.name);

  return <div className={styles.page}>
    <header className={styles.pageHeader}>
      <div><p className={styles.eyebrow}>JUÁCIL / {section === 'resumen' ? 'Resumen general' : 'Gestión'}</p><h1>{headings[section].title}</h1><p className={styles.description}>{headings[section].description}</p></div>
      {section === 'tiendas' ? <Button leftIcon={<Plus size={18} />} onClick={() => setCreating('store')}>Registrar tienda</Button>
        : section === 'usuarios' ? <Button leftIcon={<Plus size={18} />} onClick={() => setCreating('user')}>Crear usuario</Button>
        : section === 'encuestas' ? <div className={styles.actions}><Button variant="outline" leftIcon={<Download size={17} />} onClick={() => { downloadSurveyCSV(filteredSurveys); setNotice('Se descargó el informe de encuestas en formato CSV.'); }}>Exportar CSV</Button><Link to="/ayuda#encuesta" target="_blank" className={styles.textLink}><FileText size={15} /> Probar Encuesta (Web)</Link></div>
        : <Button variant="outline" leftIcon={<Download size={17} />} onClick={exportData}>Exportar datos</Button>}
    </header>
    {notice && <div className={styles.notice} role="status"><Check size={18} aria-hidden="true" /><span>{notice}</span><button aria-label="Cerrar confirmación" onClick={() => setNotice('')}>Cerrar</button></div>}
    {error && <p className={styles.warning} role="alert">{error}</p>}

    {section === 'resumen' ? <>
      <dl className={styles.metrics}>
        <div><dt>Tiendas activas</dt><dd>{activeStores.length}<span>de {businesses.length} registradas</span></dd></div>
        <div><dt>Usuarios</dt><dd>{users.length}<span>{users.filter(u => u.role === 'merchant').length} emprendedores</span></dd></div>
        <div><dt>Pedidos registrados</dt><dd>{orders.length}<span>{orders.filter(o => o.status === 'pendiente').length} pendientes · {formatMoney(deliveredTotal)} entregados</span></dd></div>
        <div><dt>Validación de Usabilidad</dt><dd className={styles.money} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={20} fill="#f59e0b" color="#f59e0b" /> {surveyStats.avgScoreOutOf5}<span>{surveyStats.totalCount} encuestas · {surveyStats.globalPercentage}% UX</span></dd></div>
      </dl>
      <div className={styles.overviewGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div><h2>Tiendas por revisar</h2><p>{pendingStores.length ? `${pendingStores.length} solicitudes pendientes` : 'No hay solicitudes pendientes'}</p></div><Store size={21} aria-hidden="true" /></div>
          {pendingStores.length ? <ul className={styles.reviewList}>{pendingStores.slice(0, 5).map(b => <li key={b.id}><div><strong>{b.name}</strong><span>{b.location} · {categoryName(b.category)}</span></div><Button variant="outline" onClick={() => setConfirmation({ kind: 'store-status', business: b, status: 'active' })}>Revisar</Button></li>)}</ul>
            : <div className={styles.calmState}><Check size={24} aria-hidden="true" /><h3>La revisión está al día</h3><p>Las nuevas solicitudes aparecerán aquí cuando tengan estado pendiente.</p></div>}
          <Link className={styles.panelFooter} to="/admin/tiendas?estado=pending">Ver solicitudes <ArrowRight size={17} aria-hidden="true" /></Link>
        </section>
        <section className={styles.directory}>
          <h2>Gestiona tu comunidad</h2><p>Accede a los registros de negocios y personas que participan en JUÁCIL.</p>
          <Link to="/admin/tiendas"><Store size={23} aria-hidden="true" /><div><strong>Tiendas y emprendimientos</strong><span>{businesses.length} negocios registrados</span></div><ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link to="/admin/usuarios"><Users size={23} aria-hidden="true" /><div><strong>Cuentas de usuario</strong><span>Clientes, emprendedores y administradores</span></div><ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link to="/admin/pedidos"><ShoppingBag size={23} aria-hidden="true" /><div><strong>Pedidos de la plataforma</strong><span>Consulta estados y detalles de compra</span></div><ArrowUpRight size={18} aria-hidden="true" /></Link>
          <Link to="/admin/encuestas"><BarChart3 size={23} aria-hidden="true" /><div><strong>Validación de Usabilidad (UX)</strong><span>{surveyStats.totalCount} encuestas · {surveyStats.avgScoreOutOf5} / 5.0 ⭐ ({surveyStats.validationLevel})</span></div><ArrowUpRight size={18} aria-hidden="true" /></Link>
        </section>
      </div>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div><h2>Pedidos recientes</h2><p>Últimos registros de la demostración</p></div><Link className={styles.textLink} to="/admin/pedidos">Ver todos <ArrowRight size={16} aria-hidden="true" /></Link></div>
        {orders.length ? <ul className={styles.recentOrders}>{orders.slice(0, 5).map(o => <li key={o.id}><button className={styles.orderLink} onClick={() => setDetail(o)}>{o.orderCode}<span>{o.businessName}</span></button><span className={styles.recentCustomer}>{o.customerName}</span><OrderStatusBadge status={o.status} /><strong className={styles.money}>{formatMoney(o.totalCents)}</strong></li>)}</ul>
          : <div className={styles.calmState}><p>Los pedidos aparecerán cuando un cliente confirme una compra demo.</p></div>}
      </section>
    </> : section === 'encuestas' ? <>
      <div className={styles.kpiBar}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total Evaluadores</span>
          <span className={styles.kpiValue}>{surveyStats.totalCount}</span>
          <span className={styles.kpiSub}>{surveyStats.clientCount} clientes · {surveyStats.merchantCount} comerciantes MYPE</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Índice Global UX</span>
          <span className={styles.kpiValue} style={{ color: 'var(--color-primary-800)' }}>{surveyStats.globalPercentage}%</span>
          <span className={styles.kpiSub}>{surveyStats.avgScore} de 50 puntos promedio</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Puntuación Promedio</span>
          <span className={styles.kpiValue} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Star size={24} fill="#f59e0b" color="#f59e0b" /> {surveyStats.avgScoreOutOf5} <small style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/ 5.0</small>
          </span>
          <span className={styles.kpiSub}>{surveyStats.validationLevel}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Disposición de Adopción (P10)</span>
          <span className={styles.kpiValue} style={{ color: '#16a34a' }}>{surveyStats.recommendationRate}%</span>
          <span className={styles.kpiSub}>Compradores y MYPES dispuestos a usar JUÁCIL</span>
        </div>
      </div>

      <div className={styles.surveySectionTitle}>
        <span>Estadísticas por Dimensión de Usabilidad (10 Preguntas Cerradas)</span>
        <Badge variant="success">Baremo Académico Capítulo III</Badge>
      </div>
      <div className={styles.surveyQuestionsGrid}>
        {surveyStats.questions.map((q) => (
          <div key={q.key} className={styles.questionStatCard}>
            <div className={styles.questionTop}>
              <span className={styles.questionNum}>P{q.num}</span>
              <span className={styles.questionDim}>{q.dimension}</span>
              <span className={styles.questionScore}>
                <Star size={13} fill="#f59e0b" color="#f59e0b" /> {q.avgScore} <small>/ 5</small>
              </span>
            </div>
            <p className={styles.questionTitle}>{q.title}</p>
            <div className={styles.barTrack} title={`${q.percentage}% satisfacción`}>
              <div className={styles.barFill} style={{ width: `${q.percentage}%` }} />
            </div>
            <div className={styles.distRow}>
              <span className={styles.distPill}><strong>5★:</strong> {q.distribution[5]}</span>
              <span className={styles.distPill}><strong>4★:</strong> {q.distribution[4]}</span>
              <span className={styles.distPill}><strong>3★:</strong> {q.distribution[3]}</span>
              <span className={styles.distPill}><strong>2★:</strong> {q.distribution[2]}</span>
              <span className={styles.distPill}><strong>1★:</strong> {q.distribution[1]}</span>
              <span style={{ fontWeight: 700, color: 'var(--color-primary-800)' }}>{q.percentage}%</span>
            </div>
          </div>
        ))}
      </div>

      <section className={styles.panel} aria-label="Respuestas individuales de clientes">
        <div className={styles.panelHeader}>
          <div>
            <h2>Registro de Respuestas de Campo</h2>
            <p>Tabulación individual para el análisis del Capítulo III de Innovación II</p>
          </div>
          <Button variant="outline" leftIcon={<Download size={16} />} onClick={() => { downloadSurveyCSV(filteredSurveys); setNotice('Se descargó el archivo CSV de encuestas.'); }}>
            Exportar CSV
          </Button>
        </div>
        <div className={styles.filters}>
          <Input id="admin-search-survey" label="Buscar evaluador" leftIcon={<Search size={17} />} value={query} onChange={e => updateFilter('q', e.target.value)} placeholder="Nombre o dispositivo..." />
          <Select id="admin-role-survey" label="Perfil de evaluador" value={roleFilter} onChange={e => updateFilter('rol', e.target.value)} options={[{ value: 'all', label: 'Todos los perfiles' }, { value: 'cliente', label: 'Clientes compradores' }, { value: 'merchant', label: 'Comerciantes MYPE' }]} />
          {(query || roleFilter !== 'all') && <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={clearFilters}>Limpiar</Button>}
        </div>
        <div className={styles.resultCount} role="status">{filteredSurveys.length} evaluaciones registradas</div>
        
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">Respuestas de encuestas</caption>
            <thead>
              <tr>
                <th scope="col">ID / Evaluador</th>
                <th scope="col">Perfil</th>
                <th scope="col">Dispositivo</th>
                <th scope="col">Fecha</th>
                <th scope="col">Puntaje</th>
                <th scope="col">Índice UX</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurveys.map(s => (
                <tr key={s.id}>
                  <td data-label="ID / Evaluador">
                    <strong>{s.respondentName}</strong>
                    <span className={styles.cellSub}>{s.id}</span>
                  </td>
                  <td data-label="Perfil">
                    <Badge variant={s.respondentType === 'merchant' ? 'info' : 'neutral'}>
                      {s.respondentType === 'merchant' ? 'Comerciante MYPE' : 'Cliente Comprador'}
                    </Badge>
                  </td>
                  <td data-label="Dispositivo">{s.device}</td>
                  <td data-label="Fecha">{s.date.slice(0, 10)}</td>
                  <td data-label="Puntaje">
                    <strong>{s.score} / 50 pts</strong>
                  </td>
                  <td data-label="Índice UX">
                    <Badge variant={s.score >= 42 ? 'success' : s.score >= 34 ? 'warning' : 'danger'}>
                      {s.percentage}% {s.score >= 42 ? 'Excelente' : s.score >= 34 ? 'Aceptable' : 'Regular'}
                    </Badge>
                  </td>
                  <td data-label="Acciones">
                    <Button variant="outline" size="sm" onClick={() => setSurveyDetail(s)}>
                      Ver 10 respuestas
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className={styles.localNote}>Las respuestas se registran al escanear el QR o completar el formulario en /ayuda#encuesta.</p>
    </> : <>
      <section className={styles.panel} aria-label={headings[section].title}>
        <div className={styles.filters}>
          <Input id="admin-search" label={section === 'tiendas' ? 'Buscar tienda' : section === 'usuarios' ? 'Buscar usuario' : 'Buscar pedido'} leftIcon={<Search size={17} />} value={query} onChange={e => updateFilter('q', e.target.value)} placeholder={section === 'tiendas' ? 'Nombre, ubicación o rubro' : section === 'usuarios' ? 'Nombre, correo o celular' : 'Código, tienda o comprador'} />
          {section === 'usuarios' && <Select id="admin-role" label="Rol" value={roleFilter} onChange={e => updateFilter('rol', e.target.value)} options={[{ value: 'all', label: 'Todos los roles' }, ...Object.entries(roleLabels).map(([value, label]) => ({ value, label }))]} />}
          <Select id="admin-status" label="Estado" value={statusFilter} onChange={e => updateFilter('estado', e.target.value)}
            options={[{ value: 'all', label: 'Todos los estados' }, ...(section === 'pedidos' ? Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({ value, label })) : section === 'tiendas' ? Object.entries(storeStatuses).map(([value, label]) => ({ value, label })) : [{ value: 'active', label: 'Activo' }, { value: 'suspended', label: 'Suspendido' }])]} />
          {(query || statusFilter !== 'all' || roleFilter !== 'all') && <Button variant="ghost" leftIcon={<RotateCcw size={16} />} onClick={clearFilters}>Limpiar</Button>}
        </div>
        <div className={styles.resultCount} role="status">{count} {section === 'tiendas' ? 'tiendas' : section === 'usuarios' ? 'usuarios' : 'pedidos'} encontrados</div>
        {!count ? <EmptyResults onClear={clearFilters} /> : <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="sr-only">{headings[section].title}</caption>
            <thead><tr>
              {section === 'tiendas' ? <><th scope="col">Tienda</th><th scope="col">Ubicación / rubro</th><th scope="col">Contacto</th><th scope="col">Estado</th><th scope="col">Acciones</th></>
                : section === 'usuarios' ? <><th scope="col">Usuario</th><th scope="col">Rol / negocio</th><th scope="col">Celular</th><th scope="col">Estado</th><th scope="col">Acciones</th></>
                : <><th scope="col">Pedido</th><th scope="col">Tienda / comprador</th><th scope="col">Modalidad</th><th scope="col">Estado</th><th scope="col" className={styles.amount}>Total</th></>}
            </tr></thead>
            <tbody>
              {section === 'tiendas' && filteredStores.map(b => <tr key={b.id}>
                <td data-label="Tienda"><div className={styles.identity}><span className={styles.recordAvatar} aria-hidden="true">{b.name.charAt(0)}</span><div><strong>{b.name}</strong><span>RUC: {b.ruc || 'No registrado'}</span></div></div></td>
                <td data-label="Ubicación / rubro"><strong>{b.location}</strong><span className={styles.cellSub}>{categoryName(b.category)}</span></td>
                <td data-label="Contacto">{b.whatsapp || 'No registrado'}</td><td data-label="Estado"><StoreStatus business={b} /></td>
                <td data-label="Acciones">{storeActions(b)}</td>
              </tr>)}
              {section === 'usuarios' && filteredUsers.map(u => <tr key={u.id}>
                <td data-label="Usuario"><div className={styles.identity}><span className={styles.recordAvatar} aria-hidden="true">{u.name.charAt(0)}</span><div><strong>{u.name}</strong><span>{u.email}</span></div></div></td>
                <td data-label="Rol / negocio"><strong>{roleLabels[u.role]}</strong>{u.businessId && <span className={styles.cellSub}>{businesses.find(b => b.id === u.businessId)?.name || 'Negocio no disponible'}</span>}</td>
                <td data-label="Celular">{u.phone}</td><td data-label="Estado"><Badge variant={u.status === 'suspended' ? 'danger' : 'success'}>{u.status === 'suspended' ? 'Suspendido' : 'Activo'}</Badge></td>
                <td data-label="Acciones">{userActions(u)}</td>
              </tr>)}
              {section === 'pedidos' && filteredOrders.map(o => <tr key={o.id}>
                <td data-label="Pedido"><button className={styles.orderLink} onClick={() => setDetail(o)}>{o.orderCode}</button><span className={styles.cellSub}>{formatDateTime(o.createdAt)}</span></td>
                <td data-label="Tienda / comprador"><strong>{o.businessName}</strong><span className={styles.cellSub}>{o.customerName}</span></td>
                <td data-label="Modalidad">{o.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Entrega a domicilio'}</td>
                <td data-label="Estado"><OrderStatusBadge status={o.status} /></td><td data-label="Total" className={styles.amount}><strong className={styles.money}>{formatMoney(o.totalCents)}</strong></td>
              </tr>)}
            </tbody>
          </table>
        </div>}
      </section>
      <p className={styles.localNote}>Los cambios se guardan en este navegador y forman parte de la demostración.</p>
    </>}

    <Modal isOpen={creating === 'store'} onClose={() => setCreating(null)} title="Registrar tienda" size="lg">
      {creating === 'store' && <CreateStoreForm ownerId={currentUser!.id} onCancel={() => setCreating(null)} onSaved={saved} />}
    </Modal>
    <Modal isOpen={creating === 'user'} onClose={() => setCreating(null)} title="Crear usuario" size="lg">
      {creating === 'user' && <CreateUserForm businesses={businesses} onCancel={() => setCreating(null)} onSaved={saved} />}
    </Modal>
    <Modal isOpen={!!confirmation} onClose={() => setConfirmation(null)} title={confirmationTitle}
      footer={<><Button variant="outline" onClick={() => setConfirmation(null)}>Cancelar</Button><Button variant={confirmation?.kind.startsWith('delete') ? 'danger' : 'primary'} onClick={confirmAction}>{confirmation?.kind.startsWith('delete') ? 'Eliminar registro' : 'Confirmar cambio'}</Button></>}>
      <p className={styles.confirmName}>{candidateName}</p>
      {confirmation?.kind === 'delete-store' ? <><p>Se eliminará el registro de esta tienda. Esta acción no se puede deshacer desde el panel.</p><p className={styles.warning}>Sus {products.filter(p => p.businessId === confirmation.business.id).length} productos y {orders.filter(o => o.businessId === confirmation.business.id).length} pedidos no se eliminan automáticamente. Las cuentas vinculadas también se conservarán.</p></>
        : confirmation?.kind === 'delete-user' ? <><p>Se eliminará la cuenta. Sus pedidos y negocios relacionados se conservarán, pero la cuenta dejará de estar disponible para iniciar sesión.</p><p className={styles.muted}>Esta acción no se puede deshacer desde el panel.</p></>
        : confirmation?.kind === 'user-status' ? <p>{confirmation.status === 'suspended' ? 'La cuenta no podrá iniciar una nueva sesión demo mientras esté suspendida. Su historial se conservará.' : 'La cuenta volverá a estar disponible para iniciar sesión en la demostración.'}</p>
        : <p>{confirmation?.status === 'suspended' ? 'La tienda quedará marcada como suspendida. Sus productos y pedidos se conservarán; este cambio no cancela pedidos existentes.' : 'La tienda quedará marcada como activa en la demostración. Revisa su información antes de confirmar.'}</p>}
    </Modal>
    <Modal isOpen={!!detail} onClose={() => setDetail(null)} title={detail ? `Pedido ${detail.orderCode}` : 'Detalle del pedido'} size="lg">
      {detail && <div className={styles.orderDetail}><OrderStatusBadge status={detail.status} /><dl className={styles.detailGrid}>
        <div><dt>Tienda</dt><dd>{detail.businessName}</dd></div><div><dt>Comprador</dt><dd>{detail.customerName}</dd></div>
        <div><dt>Contacto</dt><dd>{detail.customerPhone}</dd></div><div><dt>Registrado</dt><dd>{formatDateTime(detail.createdAt)}</dd></div>
        <div><dt>Modalidad</dt><dd>{detail.deliveryType === 'pickup' ? 'Recojo en tienda' : 'Entrega a domicilio'}</dd></div>
        {detail.deliveryAddress && <div><dt>Dirección</dt><dd>{detail.deliveryAddress}</dd></div>}
      </dl><h3>Productos del pedido</h3><ul className={styles.detailItems}>{detail.items.map((item, index) => <li key={`${item.productId}-${index}`}><span>{item.quantity} × {item.productName}<small>{formatMoney(item.unitPriceCents)} por unidad</small></span><strong className={styles.money}>{formatMoney(item.subtotalCents)}</strong></li>)}</ul>
      <div className={styles.detailTotal}><span>Total del pedido</span><strong>{formatMoney(detail.totalCents)}</strong></div>
      {detail.notes && <p><strong>Notas:</strong> {detail.notes}</p>}
      <h3>Historial de estados</h3><ol className={styles.history}>{detail.statusHistory.map((event, index) => <li key={index}><strong>{ORDER_STATUS_LABELS[event.status]}</strong><span>{formatDateTime(event.timestamp)}</span>{event.note && <p>{event.note}</p>}</li>)}</ol>
      <p className={styles.muted}>Consulta administrativa. El negocio gestiona los cambios de estado desde su panel.</p></div>}
    </Modal>

    <Modal isOpen={!!surveyDetail} onClose={() => setSurveyDetail(null)} title={surveyDetail ? `Respuestas de ${surveyDetail.respondentName}` : 'Detalle de la evaluación'} size="lg">
      {surveyDetail && <div>
        <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <Badge variant={surveyDetail.respondentType === 'merchant' ? 'info' : 'neutral'}>
            {surveyDetail.respondentType === 'merchant' ? 'Comerciante MYPE' : 'Cliente Comprador'}
          </Badge>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Dispositivo: <strong>{surveyDetail.device}</strong></span>
          <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Fecha: <strong>{surveyDetail.date.slice(0, 10)}</strong></span>
          <strong style={{ marginLeft: 'auto', fontSize: '15px', color: 'var(--color-primary-900)' }}>
            {surveyDetail.score} / 50 puntos ({surveyDetail.percentage}%)
          </strong>
        </div>

        <div className={styles.surveyModalList}>
          {QUESTION_DEFINITIONS.map(q => (
            <div key={q.key} className={styles.surveyModalItem}>
              <div className={styles.surveyModalItemHeader}>
                <span className={styles.surveyModalQNum}>Pregunta {q.num}</span>
                <span className={styles.surveyModalDim}>{q.dimension}</span>
              </div>
              <p className={styles.surveyModalQTitle}>{q.title}</p>
              <div className={styles.surveyModalAns}>
                ✓ Opción elegida: <strong>{surveyDetail.answers[q.key] || 'Sin respuesta'}</strong>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={() => setSurveyDetail(null)}>Cerrar</Button>
        </div>
      </div>}
    </Modal>
  </div>;
};
