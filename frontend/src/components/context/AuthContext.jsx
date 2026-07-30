// src/components/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const AuthContext = createContext();

// Tiempo de inactividad en milisegundos (10 minutos)
const INACTIVITY_TIME = 10 * 60 * 1000; // 10 minutos
// Tiempo de advertencia antes de cerrar (30 segundos)
const WARNING_TIME = 30 * 1000; // 30 segundos

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  // Referencias para los timers
  const inactivityTimerRef = useRef(null);
  const warningTimerRef = useRef(null);

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    console.log('🔍 AuthProvider - Cargando desde localStorage:');
    console.log('   Token:', token ? '✅' : '❌');
    console.log('   Usuario:', usuario ? '✅' : '❌');
    
    if (token && usuario) {
      try {
        // Verificar si el token ha expirado
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expTime = tokenData.exp * 1000; // Convertir a milisegundos
        
        if (Date.now() < expTime) {
          const userData = JSON.parse(usuario);
          setUser(userData);
          updateLastActivity(); // Registrar actividad al cargar
          console.log('✅ Usuario restaurado:', userData.username || userData.email);
        } else {
          console.log('⚠️ Token expirado, limpiando sesión');
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
      } catch (error) {
        console.error('❌ Error parsing usuario:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }
    setLoading(false);
  }, []);

  // Función para actualizar la última actividad
  const updateLastActivity = () => {
    setLastActivity(Date.now());
    resetInactivityTimer();
  };

  // Función para mostrar advertencia
  const showWarning = () => {
    console.log('⚠️ Mostrando advertencia de inactividad');
    setShowInactivityWarning(true);
    
    // Timer para cerrar sesión después de la advertencia
    warningTimerRef.current = setTimeout(() => {
      handleLogout(true); // true = por inactividad
    }, WARNING_TIME);
  };

  // Función para resetear el timer de inactividad
  const resetInactivityTimer = () => {
    // Limpiar timers existentes
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // Ocultar advertencia si estaba visible
    if (showInactivityWarning) {
      setShowInactivityWarning(false);
    }
    
    // Si el usuario está logueado, iniciar nuevo timer
    if (user) {
      inactivityTimerRef.current = setTimeout(() => {
        showWarning();
      }, INACTIVITY_TIME);
    }
  };

  // Efecto para escuchar eventos de actividad del usuario
  useEffect(() => {
    if (!user) return;

    console.log('👤 Usuario logueado, activando detector de inactividad');
    
    // Lista de eventos que indican actividad del usuario
    const events = [
      'mousedown', 'mousemove', 'keydown', 'scroll',
      'touchstart', 'click', 'wheel', 'resize'
    ];
    
    const handleUserActivity = () => {
      updateLastActivity();
    };

    // Agregar event listeners con throttle para mousemove
    let throttleTimer;
    const throttledHandleActivity = () => {
      if (!throttleTimer) {
        throttleTimer = setTimeout(() => {
          handleUserActivity();
          throttleTimer = null;
        }, 1000); // Actualizar máximo cada segundo
      }
    };

    events.forEach(event => {
      if (event === 'mousemove') {
        window.addEventListener(event, throttledHandleActivity);
      } else {
        window.addEventListener(event, handleUserActivity);
      }
    });

    // Iniciar timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        if (event === 'mousemove') {
          window.removeEventListener(event, throttledHandleActivity);
        } else {
          window.removeEventListener(event, handleUserActivity);
        }
      });
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [user]);

  // ============================================
  // LOGIN TRADICIONAL
  // ============================================
  const login = (userData) => {
    console.log('🔐 Login - Guardando usuario:', userData);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('usuario', JSON.stringify(userData));
    updateLastActivity(); // Registrar actividad al hacer login
    console.log('✅ Usuario guardado en localStorage y estado');
  };

  // ============================================
  // LOGIN CON GOOGLE (NUEVO)
  // ============================================
  const loginWithGoogle = async (idToken) => {
    try {
      console.log('🌐 Login con Google - Enviando token al backend');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login con Google exitoso:', data.usuario.email);
        
        const userData = {
          id_usuario: data.usuario.id_usuario,
          email: data.usuario.email,
          nombre: data.usuario.nombre || data.usuario.email.split('@')[0],
          foto_perfil: data.usuario.foto_perfil || null,
          id_rol: data.usuario.id_rol,
          rol: data.usuario.rol || 'cliente',
          token: data.token,
          esGoogle: true
        };
        
        login(userData);
        return { success: true, user: userData };
      } else {
        console.error('❌ Error en login con Google:', data.message);
        return { success: false, message: data.message || 'Error al iniciar sesión con Google' };
      }
    } catch (error) {
      console.error('❌ Error en login con Google:', error);
      return { success: false, message: 'Error de conexión con el servidor' };
    }
  };

  // ============================================
  // LOGOUT
  // ============================================
  const logout = (inactive = false) => {
    console.log('🚪 Logout - Eliminando usuario', inactive ? '(por inactividad)' : '');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    
    // Limpiar timers
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    setShowInactivityWarning(false);
    
    // Guardar mensaje para mostrar después del logout
    if (inactive) {
      sessionStorage.setItem('logoutMessage', 'Tu sesión ha sido cerrada por inactividad de 10 minutos');
    }
  };

  const handleLogout = (inactive = false) => {
    logout(inactive);
    // La redirección se manejará en el componente que use logout
  };

  // Función para continuar sesión después de la advertencia
  const continueSession = () => {
    console.log('🔄 Continuando sesión');
    setShowInactivityWarning(false);
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    updateLastActivity();
  };

  const isAuthenticated = () => {
    const authenticated = !!user && !!localStorage.getItem('token');
    console.log('🔍 isAuthenticated:', authenticated, 'user:', !!user);
    return authenticated;
  };

  // Función para verificar si el token es válido (no expirado)
  const isTokenValid = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      return Date.now() < tokenData.exp * 1000;
    } catch {
      return false;
    }
  };

  const value = {
    user,
    login,
    loginWithGoogle, // ← NUEVO: función para login con Google
    logout: handleLogout,
    isAuthenticated,
    loading,
    showInactivityWarning,
    continueSession,
    isTokenValid,
    lastActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};