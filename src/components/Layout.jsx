import { useEffect } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, LogOut } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks'; // Sensor de BD local
import { db } from '../db'; // Importamos tu base de datos de Fase 1
import { API_URL } from '../services/api';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1. LEER DE LA BASE DE DATOS LOCAL (Instantáneo)
  // 'tareas' siempre estará sincronizado con lo que haya en el celular
  const tareas = useLiveQuery(() => db.tasks.toArray()) || [];

  // 2. SINCRONIZACIÓN EN SEGUNDO PLANO
  useEffect(() => {
    const sincronizarConServidor = async () => {
      const token = localStorage.getItem('syncroToken');
      if (!token) return;

      // Buscamos cuándo fue la última vez que bajamos datos
      const lastSync = localStorage.getItem('lastSync') || '1970-01-01T00:00:00Z';

      try {
        const response = await fetch(`${API_URL}/tasks?since=${lastSync}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const cambios = await response.json();
          
          if (cambios && cambios.length > 0) {
            // Guardamos los cambios en la DB local (bulkPut actualiza si ya existe el ID)
            await db.tasks.bulkPut(cambios);
            // Actualizamos nuestra fecha de marcador
            localStorage.setItem('lastSync', new Date().toISOString());
          }
        }
      } catch (error) {
        console.log("Trabajando en modo offline.");
      }
    };

    sincronizarConServidor();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('syncroToken');
    localStorage.removeItem('lastSync'); // Limpiamos para el siguiente usuario
    db.tasks.clear(); // Limpiamos la base de datos local por seguridad
    navigate('/');
  };

  // 3. COMPLETAR TAREA (Ahora es 100% Offline-Safe)
  const handleCompletarTarea = async (tareaId) => {
    try {
      // Paso A: Actualizamos en el celular inmediatamente (Se ve al instante)
      // Marcamos sincronizado: 0 para que sepamos que hay que avisarle a Go luego
      await db.tasks.update(tareaId, { 
        status: 'completed', 
        updated_at: new Date().toISOString(),
        sincronizado: 0 
      });

      // Paso B: Intentamos avisar al servidor
      const token = localStorage.getItem('syncroToken');
      const response = await fetch(`${API_URL}/tasks?id=${tareaId}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        // Si el servidor aceptó, marcamos como sincronizado
        await db.tasks.update(tareaId, { sincronizado: 1 });
      }
    } catch (error) {
      console.error("No se pudo sincronizar el cambio, se enviará después.");
    }
  };

  // 4. BORRAR TAREA (Borrado Lógico Offline-Safe)
  const handleBorrarTarea = async (tareaId) => {
    // Confirmación de seguridad
    const confirmado = window.confirm("¿Seguro que deseas eliminar esta tarea de forma permanente?");
    if (!confirmado) return;

    try {
      // Paso A: Borrado Lógico en el celular (Desaparece al instante de la pantalla)
      await db.tasks.update(tareaId, { 
        is_deleted: true, 
        updated_at: new Date().toISOString(),
        sincronizado: 0 
      });

      // Paso B: Intentamos avisar al servidor (Go)
      const token = localStorage.getItem('syncroToken');
      // Usaremos el método DELETE, y en Go lo programaremos como un "Soft Delete"
      const response = await fetch(`${API_URL}/tasks?id=${tareaId}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Si Go la recibió bien, marcamos como sincronizada
        await db.tasks.update(tareaId, { sincronizado: 1 });
      }
    } catch (error) {
      console.log("Modo offline: La tarea se borrará del servidor cuando regrese el internet.");
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
        {/* Ya no necesitamos el spinner de 'Loading' porque siempre hay datos locales */}
        <Outlet context={{ tareas, handleCompletarTarea, handleBorrarTarea }} />
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