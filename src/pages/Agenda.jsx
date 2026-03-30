import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, X, Trash2 } from 'lucide-react'; // Agregamos Trash2
import { API_URL } from '../services/api';
import styles from './Agenda.module.css';
import { db } from '../db';

export default function Agenda() {
  // Extraemos también handleBorrarTarea
  const { tareas, handleCompletarTarea, handleBorrarTarea } = useOutletContext();
  
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
      updated_at: new Date().toISOString(), 
      sincronizado: 0 
    };

    try {
      await db.tasks.add(tareaNueva);
      
      setShowModal(false);
      setNuevoTitulo('');
      setNuevaFecha('');

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tareaNueva)
      });

      if (response.ok) {
        await db.tasks.update(tareaNueva.id, { sincronizado: 1 });
      }

    } catch (error) {
      console.log("Tarea guardada localmente (Offline)");
    }
  };

  const hoyDate = new Date();
  const hoyStr = hoyDate.getFullYear() + '-' + 
                 String(hoyDate.getMonth() + 1).padStart(2, '0') + '-' + 
                 String(hoyDate.getDate()).padStart(2, '0');

  const tareasParaHoy = (tareas || [])
    .filter(tarea => {
      if (tarea.status === 'completed' || tarea.is_deleted) return false;
      const fechaTareaStr = tarea.due_date.substring(0, 10);
      return fechaTareaStr >= hoyStr; 
    })
    .sort((a, b) => a.due_date.localeCompare(b.due_date)); 
    
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
              
              {/* Contenedor para agrupar los botones de Completar y Borrar */}
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <button 
                  className={styles.checkBtn} 
                  title="Completar"
                  onClick={() => {
                    const confirmado = window.confirm("¿Seguro que deseas marcar esta tarea como completada?");
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