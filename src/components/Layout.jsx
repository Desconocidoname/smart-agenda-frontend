import { useNavigate, Link, Outlet } from 'react-router-dom';
import styles from './Layout.module.css'; // Crea un CSS para tu barra lateral/superior

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('syncroToken'); // Borramos la tarjeta
    navigate('/'); // Al login
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <h2>Syncro</h2>
        <nav>
          <Link title="Hoy" to="/agenda">Mi Agenda</Link>
          <Link title="Vencidas" to="/vencidas">Vencidas</Link>
          <Link title="Completadas" to="/completadas">Completadas</Link>
        </nav>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Cerrar Sesión
        </button>
      </aside>

      <main className={styles.content}>
        {/* Aquí es donde React Router meterá el contenido de cada ruta */}
        <Outlet />
      </main>
    </div>
  );
}