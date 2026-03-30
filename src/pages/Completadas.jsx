import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, CalendarDays, Trash2 } from 'lucide-react';
import styles from './Completadas.module.css';

export default function Completadas() {
const { tareas, handleBorrarTarea } = useOutletContext();
  // FILTRO: Solo las completadas y que NO estén borradas lógicamente
  // Usamos (tareas || []) como salvavidas
  const tareasCompletadas = (tareas || [])
    .filter(tarea => tarea.status === 'completed' && !tarea.is_deleted)
    // Las ordenamos para ver las más recientes arriba
    .sort((a, b) => b.due_date.localeCompare(a.due_date)); 

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <CheckCircle2 color="#10b981" size={28} />
          <h1>Completadas</h1>
        </div>
        <p>Tu historial de victorias</p>
      </header>

      <div className={styles.list}>
        {tareasCompletadas.length === 0 ? (
          <p className={styles.empty}>Aún no has completado tareas. ¡Tú puedes!</p>
        ) : (
          tareasCompletadas.map((tarea) => (
            <div key={tarea.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3 className={styles.tachado}>{tarea.title}</h3>
                <div className={styles.info}>
                  <CalendarDays size={14} />
                  <span>{tarea.due_date.substring(0, 10)}</span>
                </div>
              </div>
              {/* Contenedor para poner los iconos juntos */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <CheckCircle2 size={24} color="#10b981" />
                
                {/* BOTÓN DE BORRAR */}
                <button 
                  onClick={() => handleBorrarTarea(tarea.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  title="Eliminar tarea"
                >
                  <Trash2 size={22} color="#ef4444" />
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
}