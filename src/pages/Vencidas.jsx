import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react'; 
import styles from './Vencidas.module.css'; 

export default function Vencidas() {
  const { tareas, handleCompletarTarea } = useOutletContext(); 


  const hoyDate = new Date();
  const hoyStr = hoyDate.getFullYear() + '-' + 
                 String(hoyDate.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(hoyDate.getDate()).padStart(2, '0');

  const tareasVencidas = tareas
    .filter(tarea => {
      if (tarea.status === 'completed') return false;
      
      const fechaTareaStr = tarea.due_date.substring(0, 10);
      
      return fechaTareaStr < hoyStr; 
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1>Vencidas</h1>
        </div>
        <p>Tareas que se te pasaron de fecha</p>
      </header>

      <div className={styles.list}>
        {tareasVencidas.length === 0 ? (
          <p className={styles.empty}>¡Felicidades! No tienes tareas atrasadas. 🎉</p>
        ) : (
          tareasVencidas.map((tarea) => (
            <div key={tarea.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3>{tarea.title}</h3>
                <div className={styles.info}>
                  <Clock size={14} color="#ef4444" />
                  <span className={styles.fechaRoja}>
                    {tarea.due_date.substring(0, 10)}
                  </span>
                </div>
              </div>
              <button 
                className={styles.checkBtn} 
                title="Completar"
                onClick={() => handleCompletarTarea(tarea.id)} // Llama a la función del Layout
              >
                <CheckCircle size={24} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}