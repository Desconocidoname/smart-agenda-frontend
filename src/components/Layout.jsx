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
      {/* Header Superior Blanco con Logo Verde */}
      <header className={styles.topHeader}>
        <h2 className={styles.logo}>Syncro</h2>
        <button onClick={handleLogout} className={styles.logoutIcon} title="Cerrar Sesión">
          Logout
        </button>
      </header>

      {/* Contenido Principal sobre fondo blanco/gris muy claro */}
      <main className={styles.content}>
        <Outlet />
      </main>

      {/* Tab Bar Inferior Verde y Blanco */}
      <nav className={styles.bottomNav}>
        <Link to="/agenda" className={location.pathname === '/agenda' ? styles.active : ''}>
          <span className={styles.icon}>📅</span>
          <small>Agenda</small>
        </Link>
        <Link to="/vencidas" className={location.pathname === '/vencidas' ? styles.active : ''}>
          <span className={styles.icon}>⚠️</span>
          <small>Vencidas</small>
        </Link>
        <Link to="/completadas" className={location.pathname === '/completadas' ? styles.active : ''}>
          <span className={styles.icon}>✅</span>
          <small>Hechas</small>
        </Link>
      </nav>
    </div>
  );
}