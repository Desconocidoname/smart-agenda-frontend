import { useState, useEffect } from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react'; 
import { API_URL } from '../services/api';
import styles from './Vencidas.module.css'; // Usaremos un CSS nuevo para darle toque rojo

export default function Vencidas() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error al cargar tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);

  // =========================================================
  // FILTRO: Solo tareas incompletas y del pasado
  // =========================================================
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const tareasVencidas = tareas
    .filter(tarea => {
      if (tarea.status === 'completed') return false;

      const fechaTarea = new Date(tarea.due_date);
      fechaTarea.setHours(0, 0, 0, 0); 
      
      // La magia aquí: Buscamos las que son estrictamente menores a hoy
      return fechaTarea < hoy; 
    })
    .sort((a, b) => {
      // Las ordenamos para que la más vieja (la más atrasada) salga primero
      return new Date(a.due_date) - new Date(b.due_date);
    });

  if (loading) return <div className={styles.loader}>Buscando tareas atrasadas...</div>;

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
              <button className={styles.checkBtn} title="Completar">
                <CheckCircle size={24} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}