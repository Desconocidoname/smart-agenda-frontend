import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('syncroToken');
    navigate('/');
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Header Superior Compacto */}
      <header className={styles.topHeader}>
        <h2 className={styles.logo}>Syncro</h2>
        <button onClick={handleLogout} className={styles.logoutIcon} title="Cerrar Sesión">
          🚪
        </button>
      </header>

      {/* Contenido Principal con padding inferior para no taparse con la barra */}
      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Barra de Navegación Inferior (Tab Bar) */}
      <nav className={styles.bottomNav}>
        <Link to="/agenda" className={location.pathname === '/agenda' ? styles.active : ''}>
          <span>📅</span>
          <small>Hoy</small>
        </Link>
        <Link to="/vencidas" className={location.pathname === '/vencidas' ? styles.active : ''}>
          <span>⚠️</span>
          <small>Vencidas</small>
        </Link>
        <Link to="/completadas" className={location.pathname === '/completadas' ? styles.active : ''}>
          <span>✅</span>
          <small>Hechas</small>
        </Link>
      </nav>
    </div>
  );
}