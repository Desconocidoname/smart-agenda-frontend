import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Importamos useNavigate
import styles from './Login.module.css'; 

// 2. Importamos la URL centralizada desde tu nuevo archivo
import { API_URL } from '../services/api';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate(); // Iniciamos el navegador de React

  // 3. Convertimos handleSubmit en una función async (asíncrona)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden ");
      return; 
    }

    try {
      // 4. Disparamos la petición a tu servidor de Go
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre,    // Asegúrate que coincida con el "name" de tu struct en Go
          email: email,
          password: password
        })
      });

      // 5. Revisamos la respuesta
      if (response.ok) {
        alert("¡Cuenta creada con éxito! Ahora inicia sesión.");
        navigate('/'); // Lo mandamos al Login automáticamente
      } else {
        const errorMsg = await response.text();
        alert("Error al registrarse: " + errorMsg);
      }

    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Revisa tu internet o el estado de Render.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        
        <div className={styles.logoAnimation}>
          <div className={styles.orbit}></div>
          <div className={styles.dot}></div>
        </div>

        <h1 className={styles.title}>Syncro</h1>
        <h2 className={styles.subtitle}>Crear Cuenta</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="nombre">Nombre Completo</label>
            <input 
              type="text" 
              id="nombre" 
              required 
              autoFocus 
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              required 
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              required 
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="confirmPassword" 
              required 
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className={styles.button}>
            REGISTRARSE
          </button>
          
          <div className={styles.linkContainer}>
            <Link to="/" className={styles.link}>
              ¿Ya tienes cuenta? Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}