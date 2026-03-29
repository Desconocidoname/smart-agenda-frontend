import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { API_URL } from '../services/api'; // Importamos tu config central

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. GUARDAR EL TOKEN (La tarjeta magnética)
        // Lo guardamos en localStorage para que no se borre al refrescar la página
        localStorage.setItem('syncroToken', data.token);
        
        // 2. REDIRIGIR AL DASHBOARD
        alert("¡Bienvenido de nuevo!");
        navigate('/agenda'); 
      } else {
        alert(data.mensaje || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Syncro</h1>
        <h2 className={styles.subtitle}>Iniciar Sesión</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input 
              type="email" 
              id="email" 
              required 
              autoFocus 
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
          
          <button type="submit" className={styles.button}>
            ENTRAR
          </button>
          
          <div className={styles.linkContainer}>
            <Link to="/registro" className={styles.link}>
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}