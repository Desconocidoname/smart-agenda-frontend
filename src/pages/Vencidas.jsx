import { useOutletContext } from 'react-router-dom';
import { Clock, CheckCircle, Trash2 } from 'lucide-react'; // Agregamos Trash2
import styles from './Vencidas.module.css'; 

export default function Vencidas() {
  // Extraemos también handleBorrarTarea
  const { tareas, handleCompletarTarea, handleBorrarTarea } = useOutletContext(); 

  const hoyDate = new Date();
  const hoyStr = hoyDate.getFullYear() + '-' + 
                 String(hoyDate.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(hoyDate.getDate()).padStart(2, '0');

  const tareasVencidas = (tareas || [])
    .filter(tarea => {
      if (tarea.status === 'completed' || tarea.is_deleted) return false;
      
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
              
              {/* Contenedor para agrupar los botones de Completar y Borrar */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                  className={styles.checkBtn} 
                  title="Completar"
                  onClick={() => {
                    const confirmado = window.confirm("¿Deseas marcar esta tarea vencida como completada?");
                    if (confirmado) {
                      handleCompletarTarea(tarea.id);
                    }
                  }} 
                >
                  <CheckCircle size={24} />
                </button>

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