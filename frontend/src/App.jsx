import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "aos/dist/aos.css";
import './App.css';
import DashboardHome from "./pages/Dashboard/DashboardHome";
import AppLayout from "./components/layout/AppLayout";
import Repositorios from "./pages/Repositorios";
import Souvenirs from "./pages/Souvenir/Souvenirs";
import Libros from "./pages/libro/Libros";
import GestionUsuarios from "./pages/Usuarios/GestionUsuarios";
import Login from "./components/Auth/Login";
import { useAuth } from "./components/context/AuthContext";
import Catalogos from "./pages/catalogo/Catalogos";
import Eventos from "./pages/actividades_culturales/Eventos";
import Autores from "./pages/libro/autor/Autores";
import Categorias from "./pages/libro/categoria/Categorias";
import MaterialGratuito from "./pages/materialGratuito/MaterialGratuito";
import Home from "./pages/Home";
import SouvenirTienda from "./pages/Home/screens/SouvenirTienda";
import LibroTienda from "./pages/Home/screens/Libreria/LibroTienda";
import LibreriaGratisTienda from "./pages/Home/screens/LibreriaGratis/LibreriaGratisTienda";
import Tickets from "./pages/Ticket/Tickets";
import TicketsTienda from "./pages/Home/screens/tickets/TicketTienda";
import Ventas from "./pages/ventas/Ventas";

// ── ErrorBoundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
    console.error("💥 ErrorBoundary atrapó:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          fontFamily: 'monospace',
          background: '#0d0d0d',
          color: '#ff4444',
          minHeight: '100vh',
          overflowY: 'auto',
        }}>
          <h2 style={{ color: '#ff6666', marginBottom: '12px' }}>
            💥 Error en la aplicación
          </h2>
          <div style={{
            background: '#1a0000',
            border: '1px solid #ff4444',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
            wordBreak: 'break-word',
          }}>
            <strong>Mensaje:</strong><br />
            {this.state.error?.message}
          </div>
          <div style={{
            background: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '11px',
            color: '#aaa',
            wordBreak: 'break-word',
            whiteSpace: 'pre-wrap',
          }}>
            <strong style={{ color: '#fff' }}>Stack:</strong><br />
            {this.state.error?.stack}
          </div>
          {this.state.info && (
            <div style={{
              background: '#111',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px',
              fontSize: '11px',
              color: '#aaa',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}>
              <strong style={{ color: '#fff' }}>Componente:</strong><br />
              {this.state.info.componentStack}
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── PrivateRoute ── CON VERIFICACIÓN DE ROL ────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
        color: '#fff',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #19ADA0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <span style={{ color: '#666', fontSize: '14px' }}>Verificando sesión...</span>
      </div>
    );
  }

  const isAuthenticated = !!user && !!localStorage.getItem('token');
  
  // ✅ Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Verificar el rol del usuario (solo admin o responsable pueden acceder)
  // id_rol: 1 = admin_general, 2 = responsable
  const isAdminOrResponsable = user.id_rol === 1 || user.id_rol === 2;
  
  // ✅ Si es cliente (rol 3) o no tiene rol válido, redirigir al Home
  if (!isAdminOrResponsable) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#000',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #333',
          borderTop: '3px solid #19ADA0',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isAuthenticated = !!user && !!localStorage.getItem('token');

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <Routes>
          {/* ============================================ */}
          {/* RUTA PÚBLICA - HOME */}
          {/* ============================================ */}
          <Route path="/" element={<Home />} />
          <Route path="/tienda/souvenirs" element={<SouvenirTienda/>} />
          <Route path="/tienda/libros" element={<LibroTienda/>} />
          <Route path="/material" element={<LibreriaGratisTienda/>} />
          <Route path="/ticketsTienda" element={<TicketsTienda/>} />
          

          {/* ============================================ */}
          {/* RUTAS DE AUTENTICACIÓN */}
          {/* ============================================ */}
          <Route path="/login" element={<Login />} />

          {/* ============================================ */}
          {/* REDIRECCIÓN PARA USUARIOS AUTENTICADOS */}
          {/* Si el usuario ya está autenticado y es cliente, */}
          {/* redirigir al Home en lugar de ir al login */}
          {/* ============================================ */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          } />

          {/* ============================================ */}
          {/* DASHBOARD - SOLO ADMIN Y RESPONSABLE */}
          {/* ============================================ */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <ErrorBoundary>
                <AppLayout />
              </ErrorBoundary>
            </PrivateRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="home" element={<DashboardHome />} />
            <Route path="repositorios" element={<Repositorios />} />
            <Route path="souvenirs" element={<Souvenirs />} />
            <Route path="tickets" element={<Tickets/>} />
            <Route path="ventas" element={<Ventas/>} />
            
            {/* ============================================ */}
            {/* RUTAS DE LIBROS, AUTORES Y CATEGORÍAS */}
            {/* ============================================ */}
            <Route path="libros" element={<Libros />} />
            <Route path="autores" element={<Autores />} />
            <Route path="categorias" element={<Categorias />} />
            
            <Route path="catalogos" element={<Catalogos />} />
            <Route path="materialGratuito" element={<MaterialGratuito />} />
            <Route path="actividades" element={<Eventos />} />
            <Route path="usuarios" element={<GestionUsuarios />} />
            <Route path="perfil" element={<div style={{ padding: 24, color: 'white' }}>Editar Perfil</div>} />
          </Route>

          {/* ============================================ */}
          {/* RUTA 404 - REDIRIGIR AL HOME */}
          {/* ============================================ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;