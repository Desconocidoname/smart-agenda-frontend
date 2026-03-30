import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, CalendarDays } from 'lucide-react'; 
import styles from './Completadas.module.css';

export default function Completadas() {
  const { tareas } = useOutletContext(); 

  // FILTRO: Solo las completadas
  const tareasCompletadas = tareas
    .filter(tarea => tarea.status === 'completed')
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
              <CheckCircle2 size={24} color="#10b981" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}