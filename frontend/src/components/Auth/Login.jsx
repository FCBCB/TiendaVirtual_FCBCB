import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { API_URL } from "../../components/config/api";

// Imágenes
const LogoEscudoBolivia = "/LogoHome/logo_escudo_bolivia_0_0.png";
const LogoFCBCB = "/LogoHome/logo-white.png";

// Iconos SVG
const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
  </svg>
);

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeCloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const Loader = () => {
  return (
    <div className="flex justify-center items-center gap-2">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="w-1 h-5 bg-gradient-to-t from-stone-400 to-stone-200 rounded-full animate-pulse"
          style={{
            animationDelay: `${index * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl backdrop-blur-md border transition-all duration-500 animate-in slide-in-from-top-2 ${
      type === 'success' 
        ? 'bg-emerald-900/90 border-emerald-600/50 text-emerald-100' 
        : 'bg-rose-900/90 border-rose-600/50 text-rose-100'
    }`}>
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
        <span className="text-sm font-medium tracking-wide">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-current/60 hover:text-current transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [loginData, setLoginData] = useState({ 
    username: '',
    password: '' 
  });
  
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  // ✅ Redirigir según el rol del usuario
  const redirectUser = (userData) => {
    const userRole = userData.id_rol;
    
    // ✅ Si es cliente (rol 3) o usuario sin rol definido, redirigir al Home
    if (userRole === 3 || !userRole) {
      navigate('/', { replace: true });
    } else {
      // ✅ Si es admin (rol 1) o responsable (rol 2), redirigir al Dashboard
      navigate('/dashboard', { replace: true });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        redirectUser(userData);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleForgotPassword = () => {
    alert("Función de recuperación de contraseña en desarrollo");
  };

  const handleSignUp = () => {
    alert("Solicitud de registro - Solo administradores pueden crear cuentas");
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      showToast('Por favor, completa todos los campos', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          id_usuario: data.usuario.id_usuario,
          username: data.usuario.username,
          email: data.usuario.email,
          id_rol: data.usuario.id_rol,
          nombre: data.usuario.nombre,
          apellido_paterno: data.usuario.apellido_paterno,
          token: data.token,
          repositorio: data.usuario.repositorio,
          id_repositorio: data.usuario.id_repositorio
        };
        
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        login(userData);
        
        showToast(`Bienvenido, ${userData.nombre || userData.username}`, 'success');
        
        // ✅ Redirigir según el rol
        setTimeout(() => {
          redirectUser(userData);
        }, 1000);
      } else {
        showToast(data.message || 'Error en el inicio de sesión', 'error');
      }
    } catch (error) {
      console.error('Error en login:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Manejador para login con Google
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const result = await loginWithGoogle(credentialResponse.credential);
      if (result.success) {
        showToast(`Bienvenido, ${result.user.nombre || 'Cliente'}`, 'success');
        
        // ✅ Redirigir según el rol del usuario de Google
        setTimeout(() => {
          // ✅ Los clientes (rol 3) van al Home, admin/responsable al Dashboard
          if (result.user.id_rol === 3 || !result.user.id_rol) {
            navigate('/', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1000);
      } else {
        showToast(result.message || 'Error en login con Google', 'error');
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      showToast('Error al conectar con Google', 'error');
    }
  };

  const handleGoogleError = () => {
    showToast('Error al iniciar sesión con Google', 'error');
  };

  // Obtener el Client ID de Google desde las variables de entorno
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '1871955861-b1n06ptkl6ti7pcpkep2jvdbi6aqu9v2.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div className="flex min-h-screen bg-stone-50">
        
        {/* Toast Notification */}
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={hideToast} 
          />
        )}

        {/* Lado izquierdo - Formulario de Login */}
        <div className="flex flex-col flex-1 w-full lg:w-1/2 bg-white">
          
          {/* Header con logos */}
          <div className="w-full max-w-md pt-8 mx-auto px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1 text-stone-400 hover:text-stone-600 transition-colors group"
              >
                <ChevronLeftIcon className="size-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm">Volver</span>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <img 
                    src={LogoEscudoBolivia} 
                    alt="Escudo Nacional de Bolivia" 
                    className="h-5 w-5 object-contain"
                  />
                </div>
                <div className="w-px h-5 bg-stone-200"></div>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                  <img 
                    src={LogoFCBCB} 
                    alt="Logo FCBCB" 
                    className="h-5 w-5 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Formulario */}
          <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-6 py-12">
            <div className="space-y-8">
              
              {/* Título */}
              <div className="space-y-2">
                <h1 className="text-3xl font-light text-stone-800 tracking-tight">
                  Iniciar sesión
                </h1>
                <p className="text-sm text-stone-400">
                  Ingresa tus credenciales para continuar
                </p>
              </div>
              
              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {/* Username */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-500 tracking-wide uppercase">
                    Usuario
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-300 group-focus-within:text-stone-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      type="text" 
                      name="username"
                      value={loginData.username}
                      onChange={handleChange}
                      placeholder="usuario@ejemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                    />
                  </div>
                </div>
                
                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-stone-500 tracking-wide uppercase">
                    Contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <svg className="w-4 h-4 text-stone-300 group-focus-within:text-stone-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={loginData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-transparent border-b border-stone-200 text-stone-800 placeholder-stone-300 focus:outline-none focus:border-stone-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
                    >
                      {showPassword ? (
                        <EyeCloseIcon className="size-4" />
                      ) : (
                        <EyeIcon className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Opciones */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => setIsChecked(e.target.checked)}
                      className="w-3.5 h-3.5 text-stone-600 bg-stone-50 border-stone-300 rounded focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-stone-400 group-hover:text-stone-500 transition-colors">
                      Recordarme
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                
                {/* Botón de submit */}
                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {loading ? <Loader /> : 'Ingresar'}
                  </button>
                </div>

                {/* SEPARADOR - "O continúa con" */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-stone-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-stone-400">O continúa con</span>
                  </div>
                </div>

                {/* BOTÓN DE GOOGLE */}
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    theme="outline"
                    size="large"
                    text="continue_with"
                    shape="pill"
                    logo_alignment="left"
                    width="100%"
                  />
                </div>
              </form>

              {/* Registro */}
              <div className="text-center">
                <p className="text-xs text-stone-400">
                  ¿No tienes una cuenta?{' '}
                  <button
                    onClick={handleSignUp}
                    className="text-stone-600 hover:text-stone-800 font-medium transition-colors"
                  >
                    Solicitar registro
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="w-full max-w-md mx-auto pb-6 px-6">
            <p className="text-[11px] text-center text-stone-300 tracking-wide">
              Fundación Cultural del Banco Central de Bolivia
            </p>
          </div>
        </div>

        {/* Lado derecho - Imagen institucional */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-stone-900 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1600&q=80" 
              alt="Cultural background"
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900/90 via-stone-900/80 to-stone-800/90"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-center">
            <div className="max-w-sm space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <img 
                    src={LogoFCBCB} 
                    alt="Logo FCBCB" 
                    className="h-10 w-10 object-contain brightness-0 invert"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-light tracking-wide text-white/90">
                  Fundación Cultural BCB
                </h2>
                <h3 className="text-3xl font-light tracking-wider text-stone-300">
                  WAYRURU
                </h3>
              </div>
              
              <div className="w-12 h-px mx-auto bg-stone-600"></div>
              
              <p className="text-sm text-stone-400 leading-relaxed">
                Museos • Espacios Culturales • Archivos • Patrimonio
              </p>
              
              <p className="text-xs text-stone-500 italic">
                "Preservando la identidad cultural de Bolivia"
              </p>
            </div>
            
            <div className="absolute bottom-8 left-8 right-8 text-center">
              <p className="text-[10px] text-stone-600 tracking-wider uppercase">
                Sistema de Gestión Cultural
              </p>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}