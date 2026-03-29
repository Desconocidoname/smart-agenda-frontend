import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro.jsx'; 
import Layout from './components/Layout'; 
import Agenda from './pages/Agenda';

// --- GUARDIA DE SEGURIDAD (ProtectedRoute) ---
// Este componente revisa si el usuario tiene permiso de estar aquí
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('syncroToken');

  // Si no hay token en la memoria del navegador...
  if (!token) {
    // ...lo mandamos al Login de una patada y borramos el historial
    return <Navigate to="/" replace />;
  }

  // Si hay token, lo dejamos ver el contenido (el Layout y las rutas)
  return children;
};

function App() {
  return (
    <Routes>
      {/* 1. RUTAS PÚBLICAS: Cualquiera las puede ver */}
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* 2. RUTAS PRIVADAS: Envolvemos todo el grupo con el Guardia y el Layout */}
      <Route 
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/agenda" element={<Agenda />} />
        <Route path="/vencidas" element={<h1>Tareas Vencidas</h1>} />
        <Route path="/completadas" element={<h1>Tareas Completadas</h1>} />
      </Route>
      
      {/* 3. ERROR 404 */}
      <Route path="*" element={<h1>Error 404: Página no encontrada</h1>} />
    </Routes>
  );
}

export default App;