import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, X } from 'lucide-react'; // Agregamos la 'X' para cerrar
import { API_URL } from '../services/api';
import styles from './Agenda.module.css';

export default function Agenda() {
  const [tareas, setTareas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para el Modal (Ventanita de nueva tarea)
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
        setTareas(data || []); // El || [] evita errores si data es null
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

  // Función para guardar la nueva tarea
  const handleCrearTarea = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('syncroToken');

    // Generamos la tarea con su ID desde el frontend (Estrategia Offline)
    const tareaNueva = {
      id: crypto.randomUUID(), // Genera un UUID perfecto: 8-4-4-4-12
      title: nuevoTitulo,
      description: "", // Lo mandamos vacío para que Go no se enoje
      status: "pending",
      // Convertimos la fecha del input al formato ISO que usa tu base de datos
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
        // Agregamos la tarea a la lista sin recargar la página
        setTareas([...tareas, tareaNueva]);
        // Limpiamos y cerramos el modal
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
                  <span>{tarea.due_date.substring(0, 10)}</span> {/* Recortamos para que se vea solo YYYY-MM-DD */}
                </div>
              </div>
              <button className={styles.checkBtn} title="Completar">
                <CheckCircle size={24} />
              </button>
            </div>
          ))
        )}
      </div>
      
      {/* Botón Flotante para nueva tarea */}
      <button 
        className={styles.fab} 
        title="Nueva Tarea"
        onClick={() => setShowModal(true)} // Abre el modal
      >
        +
      </button>

      {/* MODAL (Formulario Emergente) */}
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