import { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { API_URL } from '../services/api';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ESTADO GLOBAL
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH INICIAL (Se ejecuta solo al abrir la app)
  useEffect(() => {
    const fetchTareas = async () => {
      const token = localStorage.getItem('syncroToken');
      try {
        const response = await fetch(`${API_URL}/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setTareas(data || []);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTareas();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('syncroToken');
    navigate('/');
  };

  // FUNCIÓN PARA COMPLETAR TAREAS (Optimistic UI)
  const handleCompletarTarea = async (tareaId) => {
    const token = localStorage.getItem('syncroToken');
    
    // 1. Guardamos una copia de seguridad por si el internet falla
    const tareasAnteriores = [...tareas];

    // 2. Actualizamos la pantalla AL INSTANTE para que se sienta rapidísimo
    const tareasActualizadas = tareas.map(tarea => 
      tarea.id === tareaId ? { ...tarea, status: 'completed' } : tarea
    );
    setTareas(tareasActualizadas);

    // 3. Le avisamos a tu servidor en Go (en segundo plano)
    try {
      const response = await fetch(`${API_URL}/tasks?id=${tareaId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        alert("Error al sincronizar con el servidor.");
        setTareas(tareasAnteriores); // Revertimos si el servidor falló
      }
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      setTareas(tareasAnteriores); // Revertimos si se cayó el internet
    }
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
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#999' }}>
            Sincronizando tareas...
          </div>
        ) : (
          /* Compartimos los datos y funciones con las páginas hijas */
          <Outlet context={{ tareas, setTareas, handleCompletarTarea }} />
        )}
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