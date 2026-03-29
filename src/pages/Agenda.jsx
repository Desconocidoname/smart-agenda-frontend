import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { API_URL } from '../services/api';
import styles from './Agenda.module.css';

export default function Agenda() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTareas = async () => {
    const token = localStorage.getItem('syncroToken');
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTareas(data);
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

  if (loading) return <div className={styles.loader}>Cargando agenda...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mis Pendientes</h1>
        <p>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <div className={styles.list}>
        {tareas.length === 0 ? (
          <p className={styles.empty}>No tienes tareas para hoy. ¡A descansar! 🌴</p>
        ) : (
          tareas.map((tarea) => (
            <div key={tarea.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3>{tarea.title}</h3>
                <div className={styles.info}>
                  <Clock size={14} />
                  <span>{tarea.due_date}</span>
                </div>
              </div>
              <button className={styles.checkBtn} title="Completar">
                <CheckCircle size={24} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Botón Flotante para nueva tarea (Muy móvil) */}
      <button className={styles.fab} title="Nueva Tarea">+</button>
    </div>
  );
}