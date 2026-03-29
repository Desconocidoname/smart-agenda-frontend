import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, LogOut } from 'lucide-react'; // Importamos los iconos
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
      <header className={styles.topHeader}>
        <h2 className={styles.logo}>Syncro</h2>
        <button onClick={handleLogout} className={styles.logoutIcon} title="Cerrar Sesión">
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>

      <nav className={styles.bottomNav}>
        <Link to="/agenda" className={location.pathname === '/agenda' ? styles.active : ''}>
          <Calendar className={styles.icon} />
          <small>Agenda</small>
        </Link>
        <Link to="/vencidas" className={location.pathname === '/vencidas' ? styles.active : ''}>
          <AlertCircle className={styles.icon} />
          <small>Vencidas</small>
        </Link>
        <Link to="/completadas" className={location.pathname === '/completadas' ? styles.active : ''}>
          <CheckCircle2 className={styles.icon} />
          <small>Hechas</small>
        </Link>
      </nav>
    </div>
  );
}