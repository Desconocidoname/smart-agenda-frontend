import { useState, useEffect } from 'react'; // 1. Agregamos useEffect
import { Link, useNavigate } from 'react-router-dom';
import styles from './Login.module.css';
import { API_URL } from '../services/api'; 

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Apenas carga la página, buscamos en la memoria
    const token = localStorage.getItem('syncroToken');
    
    // Si encontramos el token, significa que ya inició sesión antes
    if (token) {
      navigate('/agenda'); // Lo mandamos directo adentro
    }
  }, [navigate]);

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

      // 1. PRIMERO revisamos si el servidor nos dio un error (401, 404, 500)
      if (!response.ok) {
        // Leemos el error como texto plano, por si Go no mandó un JSON
        const errorText = await response.text(); 
        alert(errorText || "Credenciales incorrectas");
        return; // Detenemos la función aquí mismo
      }

      // 2. Si llegamos a esta línea, la contraseña fue CORRECTA
      // Ahora sí es 100% seguro convertir a JSON porque sabemos que viene el token
      const data = await response.json();

      // GUARDAR EL TOKEN
      localStorage.setItem('syncroToken', data.token);
      
      // REDIRIGIR AL DASHBOARD
      alert("¡Bienvenido de nuevo!");
      navigate('/agenda'); 

    } catch (error) {
      // Este catch ahora SÍ atrapará solo problemas reales de red (ej. si apagas el Wi-Fi)
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor. Revisa tu internet.");
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