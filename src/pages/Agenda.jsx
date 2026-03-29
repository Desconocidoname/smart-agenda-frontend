import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X } from 'lucide-react'; 
import { API_URL } from '../services/api';
import styles from './Agenda.module.css';

export default function Agenda() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

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

  const handleCrearTarea = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('syncroToken');

    const tareaNueva = {
      id: crypto.randomUUID(), 
      title: nuevoTitulo,
      description: "", 
      status: "pending",
      due_date: new Date(`${nuevaFecha}T12:00:00Z`).toISOString(), 
    };

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tareaNueva)
      });

      if (response.ok) {
        setTareas([...tareas, tareaNueva]);
        setShowModal(false);
        setNuevoTitulo('');
        setNuevaFecha('');
      } else {
        alert("Hubo un problema al guardar la tarea");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error de conexión al guardar la tarea");
    }
  };

  // =========================================================
  // 🔥 LA MAGIA DEL FILTRO Y ORDENAMIENTO ESTÁ AQUÍ
  // =========================================================
  
  // 1. Obtenemos la fecha de hoy a la medianoche para comparar
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // 2. Procesamos el arreglo original antes de enviarlo al HTML
  const tareasParaHoy = tareas
    .filter(tarea => {
      // Ignoramos las que ya están completadas
      if (tarea.status === 'completed') return false;

      // Convertimos la fecha de la base de datos a un objeto Date
      const fechaTarea = new Date(tarea.due_date);
      fechaTarea.setHours(0, 0, 0, 0); 

      // Si la fecha es de hoy o del futuro, se queda en la Agenda.
      // Si es del pasado, la descartamos (se vuelve "Vencida" automáticamente)
      return fechaTarea >= hoy; 
    })
    .sort((a, b) => {
      // Ordenamos de la fecha más cercana a la más lejana
      return new Date(a.due_date) - new Date(b.due_date);
    });

  // =========================================================

  if (loading) return <div className={styles.loader}>Cargando agenda...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mis Pendientes</h1>
        <p>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <div className={styles.list}>
        {/* Cambiamos 'tareas' por 'tareasParaHoy' */}
        {tareasParaHoy.length === 0 ? (
          <p className={styles.empty}>No tienes tareas para hoy. ¡A descansar! 🌴</p>
        ) : (
          tareasParaHoy.map((tarea) => (
            <div key={tarea.id} className={styles.card}>
              <div className={styles.cardContent}>
                <h3>{tarea.title}</h3>
                <div className={styles.info}>
                  <Clock size={14} />
                  <span>{tarea.due_date.substring(0, 10)}</span>
                </div>
              </div>
              <button className={styles.checkBtn} title="Completar">
                <CheckCircle size={24} />
              </button>
            </div>
          ))
        )}
      </div>
      
      <button 
        className={styles.fab} 
        title="Nueva Tarea"
        onClick={() => setShowModal(true)} 
      >
        +
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>Nueva Tarea</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCrearTarea} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>¿Qué tienes que hacer?</label>
                <input 
                  type="text" 
                  required 
                  autoFocus
                  placeholder="Ej. Comprar despensa"
                  value={nuevoTitulo}
                  onChange={(e) => setNuevoTitulo(e.target.value)}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label>¿Para cuándo?</label>
                <input 
                  type="date" 
                  required 
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                />
              </div>

              <button type="submit" className={styles.saveBtn}>Guardar Tarea</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}