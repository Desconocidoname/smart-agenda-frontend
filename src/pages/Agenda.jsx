import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, X } from 'lucide-react'; 
import { API_URL } from '../services/api';
import styles from './Agenda.module.css';

export default function Agenda() {
  const { tareas, setTareas, handleCompletarTarea } = useOutletContext();
  
  const [showModal, setShowModal] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

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
        alert("Hubo un problema al guardar");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    }
  };

  // FILTRO: Solo tareas de HOY hacia el futuro (y pendientes)
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const tareasParaHoy = tareas
    .filter(tarea => {
      if (tarea.status === 'completed') return false;
      const fechaTarea = new Date(tarea.due_date);
      fechaTarea.setHours(0, 0, 0, 0); 
      return fechaTarea >= hoy; 
    })
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mis Pendientes</h1>
        <p>{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      <div className={styles.list}>
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
      
      <button className={styles.fab} title="Nueva Tarea" onClick={() => setShowModal(true)}>
        +
      </button>

      {/* MODAL */}
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
                <input type="text" required autoFocus value={nuevoTitulo} onChange={(e) => setNuevoTitulo(e.target.value)} />
              </div>
              <div className={styles.inputGroup}>
                <label>¿Para cuándo?</label>
                <input type="date" required value={nuevaFecha} onChange={(e) => setNuevaFecha(e.target.value)} />
              </div>
              <button type="submit" className={styles.saveBtn}>Guardar Tarea</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}