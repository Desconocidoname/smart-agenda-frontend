import { useEffect, useState } from 'react';
import { useNavigate, Link, Outlet, useLocation } from 'react-router-dom';
import { Calendar, AlertCircle, CheckCircle2, LogOut, RefreshCw } from 'lucide-react'; // Agregamos RefreshCw para la animación
import { useLiveQuery } from 'dexie-react-hooks'; 
import { db } from '../db'; 
import { API_URL } from '../services/api';
import styles from './Layout.module.css';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ESTADO PARA LA ANIMACIÓN
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. LEER DE LA BASE DE DATOS LOCAL
  const tareas = useLiveQuery(() => db.tasks.toArray()) || [];

  // 2. SINCRONIZACIÓN MAESTRA (Push & Pull)
  useEffect(() => {
    const sincronizarConServidor = async () => {
      // Si no hay internet, ni lo intentamos
      if (!navigator.onLine) return; 

      const token = localStorage.getItem('syncroToken');
      if (!token) return;

      setIsSyncing(true); // 🟢 INICIA ANIMACIÓN

      try {
        // --- PARTE A: EMPUJAR (PUSH) LO PENDIENTE ---
        // Buscamos todas las tareas que el usuario modificó offline
        const tareasPendientes = await db.tasks.where('sincronizado').equals(0).toArray();

        for (const tarea of tareasPendientes) {
          if (tarea.is_deleted) {
            // Si la borró offline, mandamos un DELETE a Go
            const res = await fetch(`${API_URL}/tasks?id=${tarea.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) await db.tasks.update(tarea.id, { sincronizado: 1 });
          } else {
            // Si la creó o actualizó offline, Go usa el Upsert (ON CONFLICT DO UPDATE)
            const res = await fetch(`${API_URL}/tasks`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(tarea)
            });
            if (res.ok) await db.tasks.update(tarea.id, { sincronizado: 1 });
          }
        }

        // --- PARTE B: JALAR (PULL) LO NUEVO ---
        const lastSync = localStorage.getItem('lastSync') || '1970-01-01T00:00:00Z';
        const response = await fetch(`${API_URL}/tasks?since=${lastSync}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const cambios = await response.json();
          if (cambios && cambios.length > 0) {
            await db.tasks.bulkPut(cambios);
            localStorage.setItem('lastSync', new Date().toISOString());
          }
        }
      } catch (error) {
        console.log("Error de red durante la sincronización.");
      } finally {
        setIsSyncing(false); // 🔴 TERMINA ANIMACIÓN
      }
    };

    sincronizarConServidor(); // Ejecutamos al abrir la app

    // MAGIA PWA: Escuchamos cuando el celular recupera el internet
    window.addEventListener('online', sincronizarConServidor);

    return () => {
      // Limpiamos el evento si el componente se desmonta
      window.removeEventListener('online', sincronizarConServidor);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('syncroToken');
    localStorage.removeItem('lastSync'); 
    db.tasks.clear(); 
    navigate('/');
  };

  const handleCompletarTarea = async (tareaId) => {
    try {
      await db.tasks.update(tareaId, { 
        status: 'completed', 
        updated_at: new Date().toISOString(),
        sincronizado: 0 
      });

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
        await db.tasks.update(tareaId, { sincronizado: 1 });
      }
    } catch (error) {
      console.log("Guardado offline. Se sincronizará luego.");
    }
  };

  const handleBorrarTarea = async (tareaId) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar esta tarea de forma permanente?");
    if (!confirmado) return;

    try {
      await db.tasks.update(tareaId, { 
        is_deleted: true, 
        updated_at: new Date().toISOString(),
        sincronizado: 0 
      });

      const token = localStorage.getItem('syncroToken');
      const response = await fetch(`${API_URL}/tasks?id=${tareaId}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await db.tasks.update(tareaId, { sincronizado: 1 });
      }
    } catch (error) {
      console.log("Guardado offline. Se sincronizará luego.");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.topHeader}>
        {/* Contenedor del Logo y la Animación */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 className={styles.logo}>Syncro</h2>
          
          {/* ANIMACIÓN DE SINCRONIZANDO */}
          {isSyncing && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#6366f1' }}>
              <RefreshCw size={14} className={styles.spin} />
              Sincronizando...
            </span>
          )}
        </div>

        <button onClick={handleLogout} className={styles.logoutIcon} title="Cerrar Sesión">
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </header>

      <main className={styles.content}>
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