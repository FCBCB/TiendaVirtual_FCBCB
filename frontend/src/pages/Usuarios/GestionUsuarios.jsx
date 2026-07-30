import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EyeIcon,
  EyeSlashIcon,
  TableCellsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL } from '../../components/config/api';

// Componente de tarjeta de usuario
const UsuarioCard = ({ usuario, onEdit, onDelete, onToggleStatus, onView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isHovered, setIsHovered] = useState(false);

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pendiente': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'inactivo': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getEstadoIcon = (estado) => {
    switch(estado) {
      case 'activo': return <CheckCircleIcon className="w-4 h-4" />;
      case 'pendiente': return <ClockIcon className="w-4 h-4" />;
      case 'inactivo': return <XCircleIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRolNombre = (id_rol) => {
    return id_rol === 1 ? 'Administrador' : 'Responsable';
  };

  const getIniciales = () => {
    if (usuario.nombre) {
      return `${usuario.nombre.charAt(0)}${usuario.apellido_paterno?.charAt(0) || ''}`;
    }
    return usuario.username.substring(0, 2).toUpperCase();
  };

  const getNombreCompleto = () => {
    if (usuario.nombre) {
      return `${usuario.nombre} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''}`.trim();
    }
    return usuario.username;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{ 
          y: isHovered ? -4 : 0,
          boxShadow: isHovered ? '0 20px 40px -12px rgba(0,0,0,0.3)' : '0 4px 6px -2px rgba(0,0,0,0.1)'
        }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-xl overflow-hidden border transition-all duration-300
          ${isDark 
            ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-white/10' 
            : 'bg-white border-gray-200 shadow-md'
          }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} />
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg
                ${usuario.id_rol === 1 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                }`}
              >
                {getIniciales()}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${isDark ? 'border-gray-900' : 'border-white'}
                ${usuario.estado === 'activo' ? 'bg-emerald-500' : usuario.estado === 'pendiente' ? 'bg-amber-500' : 'bg-red-500'}`}
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {getNombreCompleto()}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 border ${getEstadoColor(usuario.estado)}`}>
                      {getEstadoIcon(usuario.estado)}
                      <span className="capitalize">{usuario.estado}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${usuario.id_rol === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {getRolNombre(usuario.id_rol)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <EnvelopeIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{usuario.email}</span>
                </div>
                {usuario.celular && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{usuario.celular}</span>
                  </div>
                )}
                {usuario.repositorio_nombre && (
                  <div className="flex items-center gap-2 text-sm">
                    <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{usuario.repositorio_nombre}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>@{usuario.username}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Registrado: {new Date(usuario.fecha_registro).toLocaleDateString('es-BO')}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => onView(usuario)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                    ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <EyeIcon className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover/btn:scale-110' : 'text-gray-500 group-hover/btn:scale-110'} transition-transform`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ver</span>
                </button>
                <button
                  onClick={() => onEdit(usuario)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                    ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <PencilSquareIcon className={`w-4 h-4 text-blue-400 group-hover/btn:scale-110 transition-transform`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Editar</span>
                </button>
                
                {usuario.estado === 'activo' ? (
                  <button
                    onClick={() => onToggleStatus(usuario, 'inactivo')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                      bg-amber-500/10 hover:bg-amber-500/20`}
                  >
                    <EyeSlashIcon className="w-4 h-4 text-amber-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs text-amber-400">Desactivar</span>
                  </button>
                ) : usuario.estado === 'inactivo' ? (
                  <button
                    onClick={() => onToggleStatus(usuario, 'activo')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                      bg-emerald-500/10 hover:bg-emerald-500/20`}
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs text-emerald-400">Activar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onToggleStatus(usuario, 'activo')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                      bg-emerald-500/10 hover:bg-emerald-500/20`}
                  >
                    <CheckCircleIcon className="w-4 h-4 text-emerald-400 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-xs text-emerald-400">Aprobar</span>
                  </button>
                )}
                
                <button
                  onClick={() => onDelete(usuario)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 group/btn
                    bg-red-500/10 hover:bg-red-500/20`}
                >
                  <TrashIcon className="w-4 h-4 text-red-400 group-hover/btn:scale-110 transition-transform" />
                  <span className="text-xs text-red-400">Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Componente de tabla de usuarios
const UsuarioTable = ({ usuarios, onEdit, onDelete, onToggleStatus, onView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getEstadoBadge = (estado) => {
    switch(estado) {
      case 'activo':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
          <CheckCircleIcon className="w-3 h-3" />
          Activo
        </span>;
      case 'pendiente':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
          <ClockIcon className="w-3 h-3" />
          Pendiente
        </span>;
      case 'inactivo':
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          <XCircleIcon className="w-3 h-3" />
          Inactivo
        </span>;
      default:
        return null;
    }
  };

  const getRolBadge = (id_rol) => {
    return id_rol === 1 
      ? <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400">Administrador</span>
      : <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400">Responsable</span>;
  };

  const getNombreCompleto = (usuario) => {
    if (usuario.nombre) {
      return `${usuario.nombre} ${usuario.apellido_paterno || ''}`;
    }
    return usuario.username;
  };

  return (
    <div className={`overflow-x-auto rounded-xl border ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
      <table className="w-full">
        <thead className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Usuario</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Contacto</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Rol</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Repositorio</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Estado</th>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Registro</th>
            <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
          {usuarios.map((usuario) => (
            <motion.tr
              key={usuario.id_usuario}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`hover:bg-white/5 transition-colors duration-200`}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm
                    ${usuario.id_rol === 1 
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                      : 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                    }`}
                  >
                    {usuario.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {getNombreCompleto(usuario)}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>@{usuario.username}</p>
                  </div>
                </div>
               </td>
              <td className="px-6 py-4">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{usuario.email}</p>
                {usuario.celular && (
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{usuario.celular}</p>
                )}
               </td>
              <td className="px-6 py-4">
                {getRolBadge(usuario.id_rol)}
               </td>
              <td className="px-6 py-4">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {usuario.repositorio_nombre || '-'}
                </span>
               </td>
              <td className="px-6 py-4">
                {getEstadoBadge(usuario.estado)}
               </td>
              <td className="px-6 py-4">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {new Date(usuario.fecha_registro).toLocaleDateString('es-BO')}
                </p>
               </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onView(usuario)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                      ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    title="Ver detalles"
                  >
                    <EyeIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>
                  <button
                    onClick={() => onEdit(usuario)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                      ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    title="Editar"
                  >
                    <PencilSquareIcon className="w-4 h-4 text-blue-400" />
                  </button>
                  {usuario.estado === 'activo' ? (
                    <button
                      onClick={() => onToggleStatus(usuario, 'inactivo')}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                        ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      title="Desactivar"
                    >
                      <EyeSlashIcon className="w-4 h-4 text-amber-400" />
                    </button>
                  ) : usuario.estado === 'inactivo' ? (
                    <button
                      onClick={() => onToggleStatus(usuario, 'activo')}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                        ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      title="Activar"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onToggleStatus(usuario, 'activo')}
                      className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                        ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                      title="Aprobar"
                    >
                      <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(usuario)}
                    className={`p-2 rounded-lg transition-all duration-200 hover:scale-110
                      ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                    title="Eliminar"
                  >
                    <TrashIcon className="w-4 h-4 text-red-400" />
                  </button>
                </div>
               </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Modal de edición/creación de usuario
const UsuarioModal = ({ isOpen, onClose, onSave, usuario, isEditing }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    celular: '',
    id_rol: 2,
    id_repositorio: '',
    estado: 'activo'
  });
  const [repositorios, setRepositorios] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  // Cargar lista de repositorios para el select
  useEffect(() => {
    const fetchRepositorios = async () => {
      try {
        setLoadingRepos(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/admin/repositorios`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setRepositorios(data.repositorios || []);
        }
      } catch (error) {
        console.error('Error cargando repositorios:', error);
      } finally {
        setLoadingRepos(false);
      }
    };
    fetchRepositorios();
  }, []);

  useEffect(() => {
    if (usuario && isEditing) {
      setFormData({
        username: usuario.username || '',
        email: usuario.email || '',
        password: '',
        nombre: usuario.nombre || '',
        apellido_paterno: usuario.apellido_paterno || '',
        apellido_materno: usuario.apellido_materno || '',
        celular: usuario.celular || '',
        id_rol: usuario.id_rol || 2,
        id_repositorio: usuario.id_repositorio?.toString() || '',
        estado: usuario.estado || 'activo'
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        nombre: '',
        apellido_paterno: '',
        apellido_materno: '',
        celular: '',
        id_rol: 2,
        id_repositorio: '',
        estado: 'activo'
      });
    }
  }, [usuario, isEditing, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000] ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-10`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-xl">
                  <UserGroupIcon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                {!isEditing && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required={!isEditing}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                        ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                    />
                  </div>
                )}
                {isEditing && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nueva Contraseña (opcional)</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                        ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">Dejar en blanco para mantener la contraseña actual</p>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Apellido Paterno *</label>
                  <input
                    type="text"
                    name="apellido_paterno"
                    value={formData.apellido_paterno}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Apellido Materno</label>
                  <input
                    type="text"
                    name="apellido_materno"
                    value={formData.apellido_materno}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Celular</label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Rol *</label>
                  <select
                    name="id_rol"
                    value={formData.id_rol}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  >
                    <option value={1}>Administrador</option>
                    <option value={2}>Responsable</option>
                  </select>
                </div>
                {formData.id_rol === 2 && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Repositorio</label>
                    <select
                      name="id_repositorio"
                      value={formData.id_repositorio}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                        ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                      disabled={loadingRepos}
                    >
                      <option value="">Seleccionar...</option>
                      {repositorios.map(repo => (
                        <option key={repo.id_repositorio} value={repo.id_repositorio}>{repo.nombre}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-indigo-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-indigo-500'}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
                >
                  {isEditing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Modal de detalles del usuario
const UsuarioDetalleModal = ({ usuario, onClose, onEdit }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getEstadoColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400';
      case 'pendiente': return 'bg-amber-500/20 text-amber-400';
      case 'inactivo': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getIniciales = () => {
    if (usuario.nombre) {
      return `${usuario.nombre.charAt(0)}${usuario.apellido_paterno?.charAt(0) || ''}`;
    }
    return usuario.username.substring(0, 2).toUpperCase();
  };

  const getNombreCompleto = () => {
    if (usuario.nombre) {
      return `${usuario.nombre} ${usuario.apellido_paterno || ''} ${usuario.apellido_materno || ''}`.trim();
    }
    return usuario.username;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000] ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-10`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-xl">
                <UserIcon className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detalles del Usuario
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit()}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl
                ${usuario.id_rol === 1 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' 
                  : 'bg-gradient-to-br from-cyan-500 to-cyan-600'
                }`}
              >
                {getIniciales()}
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {getNombreCompleto()}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(usuario.estado)}`}>
                    {usuario.estado === 'activo' ? 'Activo' : usuario.estado === 'pendiente' ? 'Pendiente' : 'Inactivo'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${usuario.id_rol === 1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                    {usuario.id_rol === 1 ? 'Administrador' : 'Responsable'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Username</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>@{usuario.username}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{usuario.email}</p>
              </div>
              {usuario.celular && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Celular</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{usuario.celular}</p>
                </div>
              )}
              {usuario.repositorio_nombre && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Repositorio</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{usuario.repositorio_nombre}</p>
                </div>
              )}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fecha de Registro</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {new Date(usuario.fecha_registro).toLocaleDateString('es-BO')}
                </p>
              </div>
              {usuario.ultimo_acceso && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Último Acceso</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {new Date(usuario.ultimo_acceso).toLocaleString('es-BO')}
                  </p>
                </div>
              )}
            </div>

            {usuario.id_usuario_aprobador && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Aprobado por</p>
                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  ID de aprobador: {usuario.id_usuario_aprobador}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente Hero
const HeroSection = ({ onAdd, stats, view, setView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-indigo-500/20 via-indigo-500/10 to-transparent' : 'from-indigo-400/30 via-indigo-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-indigo-500/20 to-indigo-600/20 rounded-full">
              <UserGroupIcon className={`w-12 h-12 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-indigo-400 to-white' : 'from-gray-800 via-indigo-600 to-gray-800'}`}>
            Gestión de Usuarios
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Administra los usuarios del sistema, sus permisos y estados
          </p>
          
          {/* Stats rápidos */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Usuarios</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{stats.activos}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Activos</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{stats.pendientes}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pendientes</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>{stats.inactivos}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Inactivos</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Usuario
            </motion.button>
            
            {/* Botones de cambio de vista */}
            <div className="flex gap-2">
              <button
                onClick={() => setView('cards')}
                className={`p-3 rounded-xl transition-all duration-300 ${view === 'cards' 
                  ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400' 
                  : (isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100')
                }`}
                title="Vista en tarjetas"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('table')}
                className={`p-3 rounded-xl transition-all duration-300 ${view === 'table' 
                  ? 'bg-indigo-500/20 border border-indigo-500/50 text-indigo-400' 
                  : (isDark ? 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100')
                }`}
                title="Vista en tabla"
              >
                <TableCellsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente Principal
const GestionUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterRol, setFilterRol] = useState('todos');
  const [filterRepositorio, setFilterRepositorio] = useState('todos');
  const [view, setView] = useState('cards');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Obtener lista de usuarios de la API
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/usuarios`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setUsuarios(data.usuarios || []);
      } else {
        showToast(data.message || 'Error al cargar usuarios', 'error');
      }
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const roles = ['todos', ...new Set(usuarios.map(u => u.id_rol))];
  const repositoriosFiltro = ['todos', ...new Set(usuarios.map(u => u.repositorio_nombre).filter(Boolean))];

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          usuario.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          usuario.apellido_paterno?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || usuario.estado === filterEstado;
    const matchesRol = filterRol === 'todos' || usuario.id_rol === parseInt(filterRol);
    const matchesRepositorio = filterRepositorio === 'todos' || 
                                usuario.repositorio_nombre === filterRepositorio;
    return matchesSearch && matchesEstado && matchesRol && matchesRepositorio;
  });

  const stats = {
    total: usuarios.length,
    activos: usuarios.filter(u => u.estado === 'activo').length,
    pendientes: usuarios.filter(u => u.estado === 'pendiente').length,
    inactivos: usuarios.filter(u => u.estado === 'inactivo').length
  };

  const handleAdd = () => {
    setSelectedUsuario(null);
    setIsModalOpen(true);
  };

  const handleEdit = (usuario) => {
    setSelectedUsuario(usuario);
    setIsModalOpen(true);
  };

  const handleView = (usuario) => {
    setSelectedUsuario(usuario);
    setIsDetailOpen(true);
  };

  const handleDelete = async (usuario) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuario.username}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/usuarios/${usuario.id_usuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Usuario eliminado exitosamente', 'success');
        fetchUsuarios();
      } else {
        showToast(data.message || 'Error al eliminar usuario', 'error');
      }
    } catch (error) {
      console.error('Error deleting usuario:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleToggleStatus = async (usuario, nuevoEstado) => {
    const mensaje = nuevoEstado === 'activo' 
      ? `¿Activar al usuario "${usuario.username}"?` 
      : `¿Desactivar al usuario "${usuario.username}"?`;
    
    if (!confirm(mensaje)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/admin/estado/${usuario.id_usuario}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast(`✅ ${data.message}`, 'success');
        fetchUsuarios();
      } else {
        showToast(data.message || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        username: formData.username,
        email: formData.email,
        nombre: formData.nombre,
        apellido_paterno: formData.apellido_paterno,
        apellido_materno: formData.apellido_materno || null,
        celular: formData.celular || null,
        id_rol: parseInt(formData.id_rol),
        estado: formData.estado
      };
      
      if (formData.id_rol === 2) {
        payload.id_repositorio = formData.id_repositorio ? parseInt(formData.id_repositorio) : null;
      }
      
      if (formData.password) {
        payload.password = formData.password;
      }
      
      let url = `${API_URL}/api/admin/usuarios`;
      let method = 'POST';
      
      if (selectedUsuario) {
        url = `${API_URL}/api/admin/usuarios/${selectedUsuario.id_usuario}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(selectedUsuario ? '✅ Usuario actualizado exitosamente' : '✅ Usuario creado exitosamente', 'success');
        setIsModalOpen(false);
        setSelectedUsuario(null);
        fetchUsuarios();
      } else {
        showToast(data.message || 'Error al guardar usuario', 'error');
      }
    } catch (error) {
      console.error('Error saving usuario:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 backdrop-blur-sm text-white border-green-400' 
            : 'bg-red-500/90 backdrop-blur-sm text-white border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <HeroSection onAdd={handleAdd} stats={stats} view={view} setView={setView} />

          {/* Filtros y búsqueda */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, usuario o email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los roles</option>
                  <option value="1">Administradores</option>
                  <option value="2">Responsables</option>
                </select>
                <select
                  value={filterRepositorio}
                  onChange={(e) => setFilterRepositorio(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  {repositoriosFiltro.map(repo => (
                    <option key={repo} value={repo}>{repo === 'todos' ? 'Todos los repositorios' : repo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredUsuarios.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{usuarios.length}</span> usuarios
            </p>
          </div>

          {/* Vista de usuarios (Cards o Tabla) */}
          {view === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredUsuarios.map((usuario) => (
                  <UsuarioCard
                    key={usuario.id_usuario}
                    usuario={usuario}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <UsuarioTable
              usuarios={filteredUsuarios}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onView={handleView}
            />
          )}
        </div>

        {/* Modal de creación/edición */}
        <UsuarioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          usuario={selectedUsuario}
          isEditing={!!selectedUsuario}
        />
      </div>

      {/* Modal de detalles */}
      {isDetailOpen && selectedUsuario && (
        <UsuarioDetalleModal
          usuario={selectedUsuario}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEdit(selectedUsuario);
          }}
        />
      )}
    </>
  );
};

export default GestionUsuarios;