import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  TicketIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import ActividadCulturalDetalle from './ActividadCulturalDetalle';

// Datos de ejemplo de actividades culturales
const actividadesData = [
  {
    id_evento: 1,
    titulo: "Noche de Museos 2025",
    descripcion: "Recorrido nocturno por los principales museos de La Paz, con actividades especiales y música en vivo.",
    tipo_evento: "Visita Guiada",
    costo: 0.00,
    imagen_portada: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300",
    requiere_inscripcion: true,
    cupo_maximo: 200,
    estado: "activo",
    fecha_creacion: "2024-01-15",
    realizaciones: [
      { 
        id_repositorio: 1, 
        nombre: "FCBCB", 
        fecha: "2025-05-15", 
        hora_inicio: "19:00", 
        hora_fin: "23:00",
        direccion: "Calle Potosí N° 1392, La Paz",
        ubicacion_gps: "-16.4967,-68.1351",
        cupos_disponibles: 50
      },
      { 
        id_repositorio: 2, 
        nombre: "MNA", 
        fecha: "2025-05-22", 
        hora_inicio: "19:00", 
        hora_fin: "23:00",
        direccion: "Calle Comercio N° 485, La Paz",
        ubicacion_gps: "-16.4965,-68.1348",
        cupos_disponibles: 45
      }
    ]
  },
  {
    id_evento: 2,
    titulo: "Taller de Textilería Andina",
    descripcion: "Aprende técnicas ancestrales de tejido con maestros artesanos de la región.",
    tipo_evento: "Taller",
    costo: 50.00,
    imagen_portada: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300",
    requiere_inscripcion: true,
    cupo_maximo: 30,
    estado: "activo",
    fecha_creacion: "2024-02-01",
    realizaciones: [
      { 
        id_repositorio: 3, 
        nombre: "MUSEF", 
        fecha: "2025-03-10", 
        hora_inicio: "10:00", 
        hora_fin: "13:00",
        direccion: "Calle Ingavi N° 916, La Paz",
        ubicacion_gps: "-16.4972,-68.1355",
        cupos_disponibles: 15
      },
      { 
        id_repositorio: 5, 
        nombre: "CDL", 
        fecha: "2025-03-17", 
        hora_inicio: "10:00", 
        hora_fin: "13:00",
        direccion: "Plaza 25 de Mayo, Sucre",
        ubicacion_gps: "-19.0481,-65.2594",
        cupos_disponibles: 20
      }
    ]
  },
  {
    id_evento: 3,
    titulo: "Concierto Barroco Misionero",
    descripcion: "Concierto de música barroca con el Conjunto de Cámara de la FCBCB.",
    tipo_evento: "Concierto",
    costo: 30.00,
    imagen_portada: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300",
    requiere_inscripcion: false,
    cupo_maximo: 150,
    estado: "activo",
    fecha_creacion: "2024-02-15",
    realizaciones: [
      { 
        id_repositorio: 1, 
        nombre: "FCBCB", 
        fecha: "2025-04-20", 
        hora_inicio: "19:30", 
        hora_fin: "21:30",
        direccion: "Calle Potosí N° 1392, La Paz",
        ubicacion_gps: "-16.4967,-68.1351",
        cupos_disponibles: 80
      },
      { 
        id_repositorio: 4, 
        nombre: "CNM", 
        fecha: "2025-04-27", 
        hora_inicio: "19:30", 
        hora_fin: "21:30",
        direccion: "Calle Ayacucho esquina Junín, Potosí",
        ubicacion_gps: "-19.5896,-65.7535",
        cupos_disponibles: 60
      }
    ]
  },
  {
    id_evento: 4,
    titulo: "Exposición de Arte Contemporáneo",
    descripcion: "Muestra de artistas emergentes bolivianos en el Museo Nacional de Arte.",
    tipo_evento: "Exposición",
    costo: 15.00,
    imagen_portada: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=300",
    requiere_inscripcion: false,
    cupo_maximo: 0,
    estado: "activo",
    fecha_creacion: "2024-03-01",
    realizaciones: [
      { 
        id_repositorio: 2, 
        nombre: "MNA", 
        fecha: "2025-06-01", 
        hora_inicio: "10:00", 
        hora_fin: "18:00",
        direccion: "Calle Comercio N° 485, La Paz",
        ubicacion_gps: "-16.4965,-68.1348",
        cupos_disponibles: 0
      }
    ]
  },
  {
    id_evento: 5,
    titulo: "Feria del Libro y la Cultura",
    descripcion: "Encuentro de editoriales, talleres y presentaciones de libros.",
    tipo_evento: "Feria",
    costo: 10.00,
    imagen_portada: "https://images.unsplash.com/photo-1544716278-e513176f20b5?w=300",
    requiere_inscripcion: false,
    cupo_maximo: 500,
    estado: "activo",
    fecha_creacion: "2024-03-15",
    realizaciones: [
      { 
        id_repositorio: 1, 
        nombre: "FCBCB", 
        fecha: "2025-08-10", 
        hora_inicio: "10:00", 
        hora_fin: "20:00",
        direccion: "Calle Potosí N° 1392, La Paz",
        ubicacion_gps: "-16.4967,-68.1351",
        cupos_disponibles: 200
      }
    ]
  }
];

// Lista de repositorios disponibles
const repositoriosList = [
  { id: 1, nombre: "FCBCB", sigla: "FCBCB" },
  { id: 2, nombre: "Museo Nacional de Arte", sigla: "MNA" },
  { id: 3, nombre: "Museo de Etnografía", sigla: "MUSEF" },
  { id: 4, nombre: "Casa de la Moneda", sigla: "CNM" },
  { id: 5, nombre: "Casa de la Libertad", sigla: "CDL" }
];

// Componente de Card con animación de zoom y fade
const ActividadCard = ({ actividad, onEdit, onDelete, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactivo': return 'bg-red-500/20 text-red-400';
      case 'finalizado': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'Visita Guiada': return 'from-blue-500 to-blue-600';
      case 'Taller': return 'from-purple-500 to-purple-600';
      case 'Concierto': return 'from-rose-500 to-rose-600';
      case 'Exposición': return 'from-amber-500 to-amber-600';
      case 'Feria': return 'from-emerald-500 to-emerald-600';
      default: return 'from-cyan-500 to-cyan-600';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleViewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onView(actividad);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(actividad);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(actividad);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group"
    >
      <motion.div
        animate={{ 
          y: isHovered ? -8 : 0,
          boxShadow: isHovered ? '0 20px 40px -12px rgba(0,0,0,0.4)' : '0 10px 20px -8px rgba(0,0,0,0.2)'
        }}
        transition={{ duration: 0.3 }}
        className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300
          ${isDark 
            ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-white/10' 
            : 'bg-gradient-to-br from-white/90 to-gray-100/90 border-gray-200'
          }`}
      >
        {/* Efecto de brillo al hover */}
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} />
        
        {/* Imagen de portada */}
        <div className="relative h-48 overflow-hidden">
          <motion.img 
            src={actividad.imagen_portada} 
            alt={actividad.titulo}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.5 }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/50 to-transparent' : 'from-white via-white/50 to-transparent'}`} />
          
          {/* Badges superiores */}
          <div className="absolute top-4 left-4 flex gap-2 z-20">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(actividad.estado)} backdrop-blur-sm`}>
              {actividad.estado === 'activo' ? '● Activo' : actividad.estado === 'finalizado' ? '● Finalizado' : '● Inactivo'}
            </span>
          </div>
          
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTipoColor(actividad.tipo_evento)} text-white backdrop-blur-sm shadow-lg`}>
              {actividad.tipo_evento}
            </span>
          </div>
          
          {/* Precio */}
          <div className="absolute bottom-4 right-4 z-20">
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${actividad.costo === 0 ? 'from-emerald-500 to-emerald-600' : 'from-cyan-500 to-cyan-600'} text-white shadow-lg`}>
              {actividad.costo === 0 ? 'GRATIS' : `Bs. ${actividad.costo}`}
            </span>
          </div>
          
          {/* Indicador de hover */}
          <div className={`absolute bottom-4 left-4 opacity-0 transition-opacity duration-300 z-20 ${isHovered ? 'opacity-100' : ''}`}>
            <div className="flex items-center gap-1 text-xs text-white/80 backdrop-blur-sm px-2 py-1 rounded-full bg-black/30">
              <SparklesIcon className="w-3 h-3" />
              <span>Ver detalles</span>
            </div>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-lg font-bold transition-colors line-clamp-2 ${isDark ? 'text-white group-hover:text-cyan-400' : 'text-gray-800 group-hover:text-cyan-600'}`}>
                {actividad.titulo}
              </h3>
            </div>
          </div>
          
          {/* Información principal */}
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {actividad.realizaciones.map(r => formatDate(r.fecha)).join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {actividad.realizaciones.length} sede{actividad.realizaciones.length !== 1 ? 's' : ''}
              </span>
            </div>
            {actividad.requiere_inscripcion && (
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Cupo máximo: {actividad.cupo_maximo} personas
                </span>
              </div>
            )}
          </div>
          
          {/* Reseña corta */}
          <p className={`text-sm line-clamp-2 mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {actividad.descripcion}
          </p>
          
          {/* Acciones */}
          <div className={`flex gap-2 mt-5 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={handleViewClick}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group/btn
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <EyeIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400 group-hover/btn:scale-110' : 'text-cyan-600 group-hover/btn:scale-110'} transition-transform`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver</span>
            </button>
            <button
              onClick={handleEditClick}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 group/btn
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              <PencilSquareIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400 group-hover/btn:scale-110' : 'text-cyan-600 group-hover/btn:scale-110'} transition-transform`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Editar</span>
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 group/btn"
            >
              <TrashIcon className="w-4 h-4 text-red-400 group-hover/btn:scale-110 transition-transform" />
              <span className="text-sm text-red-400">Eliminar</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Modal de creación/edición
const ActividadModal = ({ isOpen, onClose, onSave, actividad, isEditing }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_evento: '',
    costo: '',
    imagen_portada: '',
    requiere_inscripcion: false,
    cupo_maximo: '',
    estado: 'activo',
    realizaciones: []
  });

  const tiposEvento = ['Visita Guiada', 'Taller', 'Concierto', 'Exposición', 'Feria'];

  useEffect(() => {
    if (actividad && isEditing) {
      setFormData({
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        tipo_evento: actividad.tipo_evento,
        costo: actividad.costo,
        imagen_portada: actividad.imagen_portada || '',
        requiere_inscripcion: actividad.requiere_inscripcion,
        cupo_maximo: actividad.cupo_maximo,
        estado: actividad.estado,
        realizaciones: actividad.realizaciones || []
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo_evento: '',
        costo: '',
        imagen_portada: '',
        requiere_inscripcion: false,
        cupo_maximo: '',
        estado: 'activo',
        realizaciones: []
      });
    }
  }, [actividad, isEditing, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const addRealizacion = () => {
    setFormData({
      ...formData,
      realizaciones: [...formData.realizaciones, {
        id_repositorio: '',
        nombre: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        direccion: '',
        ubicacion_gps: '',
        cupos_disponibles: 0
      }]
    });
  };

  const removeRealizacion = (index) => {
    setFormData({
      ...formData,
      realizaciones: formData.realizaciones.filter((_, i) => i !== index)
    });
  };

  const updateRealizacion = (index, field, value) => {
    const newRealizaciones = [...formData.realizaciones];
    newRealizaciones[index] = { ...newRealizaciones[index], [field]: value };
    if (field === 'id_repositorio') {
      const repo = repositoriosList.find(r => r.id === parseInt(value));
      if (repo) {
        newRealizaciones[index].nombre = repo.nombre;
      }
    }
    setFormData({ ...formData, realizaciones: newRealizaciones });
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
          className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000] ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-10`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-xl">
                  <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
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
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipo de Evento</label>
                  <select
                    name="tipo_evento"
                    value={formData.tipo_evento}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposEvento.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Costo (Bs.)</label>
                  <input
                    type="number"
                    name="costo"
                    value={formData.costo}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>URL de Imagen</label>
                  <input
                    type="text"
                    name="imagen_portada"
                    value={formData.imagen_portada}
                    onChange={handleChange}
                    placeholder="https://..."
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cupo Máximo</label>
                  <input
                    type="number"
                    name="cupo_maximo"
                    value={formData.cupo_maximo}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiere_inscripcion"
                      checked={formData.requiere_inscripcion}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Requiere inscripción previa</span>
                  </label>
                </div>
              </div>

              {/* Realizaciones por repositorio */}
              <div className={`mt-6 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    <BuildingLibraryIcon className="w-5 h-5" />
                    Sedes y Fechas
                  </h3>
                  <button
                    type="button"
                    onClick={addRealizacion}
                    className="px-3 py-1.5 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-all duration-300"
                  >
                    + Agregar sede
                  </button>
                </div>
                
                {formData.realizaciones.map((real, index) => (
                  <div key={index} className={`mb-4 p-4 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sede #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeRealizacion(index)}
                        className="text-red-400 hover:text-red-500 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Repositorio</label>
                        <select
                          value={real.id_repositorio}
                          onChange={(e) => updateRealizacion(index, 'id_repositorio', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        >
                          <option value="">Seleccionar...</option>
                          {repositoriosList.map(repo => (
                            <option key={repo.id} value={repo.id}>{repo.nombre}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</label>
                        <input
                          type="date"
                          value={real.fecha}
                          onChange={(e) => updateRealizacion(index, 'fecha', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hora Inicio</label>
                        <input
                          type="time"
                          value={real.hora_inicio}
                          onChange={(e) => updateRealizacion(index, 'hora_inicio', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hora Fin</label>
                        <input
                          type="time"
                          value={real.hora_fin}
                          onChange={(e) => updateRealizacion(index, 'hora_fin', e.target.value)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dirección</label>
                        <input
                          type="text"
                          value={real.direccion}
                          onChange={(e) => updateRealizacion(index, 'direccion', e.target.value)}
                          placeholder="Calle, número, ciudad"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Coordenadas GPS</label>
                        <input
                          type="text"
                          value={real.ubicacion_gps}
                          onChange={(e) => updateRealizacion(index, 'ubicacion_gps', e.target.value)}
                          placeholder="latitud,longitud"
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cupos Disponibles</label>
                        <input
                          type="number"
                          value={real.cupos_disponibles}
                          onChange={(e) => updateRealizacion(index, 'cupos_disponibles', parseInt(e.target.value) || 0)}
                          className={`w-full px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                            ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-cyan-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-cyan-500'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:shadow-lg transition-all duration-300"
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

// Componente Hero
const HeroSection = ({ onAdd, stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-cyan-500/20 via-cyan-500/10 to-transparent' : 'from-cyan-400/30 via-cyan-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full">
              <CalendarIcon className={`w-12 h-12 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-cyan-400 to-white' : 'from-gray-800 via-cyan-600 to-gray-800'}`}>
            Actividades Culturales
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Descubre talleres, conciertos, exposiciones y eventos culturales en toda Bolivia
          </p>
          
          {/* Stats rápidos */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Actividades</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.tipos}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipos</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.repositorios}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sedes</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5" />
            Nueva Actividad
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// Componente Principal
const ActividadesCulturales = () => {
  const [actividades, setActividades] = useState(actividadesData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedActividad, setSelectedActividad] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [filterRepositorio, setFilterRepositorio] = useState('todos');
  const [view, setView] = useState('grid');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const tipos = ['todos', ...new Set(actividades.map(a => a.tipo_evento))];
  const repositoriosFiltro = ['todos', ...repositoriosList.map(r => r.nombre)];

  const filteredActividades = actividades.filter(actividad => {
    const matchesSearch = actividad.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          actividad.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || actividad.estado === filterEstado;
    const matchesTipo = filterTipo === 'todos' || actividad.tipo_evento === filterTipo;
    const matchesRepositorio = filterRepositorio === 'todos' || 
                                actividad.realizaciones.some(r => r.nombre === filterRepositorio);
    return matchesSearch && matchesEstado && matchesTipo && matchesRepositorio;
  });

  const stats = {
    total: actividades.length,
    tipos: new Set(actividades.map(a => a.tipo_evento)).size,
    repositorios: repositoriosList.length
  };

  const handleAdd = () => {
    setSelectedActividad(null);
    setIsModalOpen(true);
  };

  const handleEdit = (actividad) => {
    setSelectedActividad(actividad);
    setIsModalOpen(true);
  };

  const handleView = (actividad) => {
    setSelectedActividad(actividad);
    setIsDetailOpen(true);
  };

  const handleDelete = (actividad) => {
    if (confirm(`¿Estás seguro de eliminar "${actividad.titulo}"?`)) {
      setActividades(actividades.filter(a => a.id_evento !== actividad.id_evento));
    }
  };

  const handleSave = (formData) => {
    if (selectedActividad) {
      setActividades(actividades.map(a => 
        a.id_evento === selectedActividad.id_evento 
          ? { ...a, ...formData }
          : a
      ));
    } else {
      const newId = Math.max(...actividades.map(a => a.id_evento)) + 1;
      setActividades([...actividades, {
        id_evento: newId,
        ...formData,
        fecha_creacion: new Date().toISOString().split('T')[0]
      }]);
    }
    setIsModalOpen(false);
    setSelectedActividad(null);
  };

  return (
    <>
      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <HeroSection onAdd={handleAdd} stats={stats} />

          {/* Filtros y búsqueda */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar por título o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  {tipos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo === 'todos' ? 'Todos los tipos' : tipo}</option>
                  ))}
                </select>
                <select
                  value={filterRepositorio}
                  onChange={(e) => setFilterRepositorio(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  {repositoriosFiltro.map(repo => (
                    <option key={repo} value={repo}>{repo === 'todos' ? 'Todas las sedes' : repo}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-3 rounded-xl transition-all duration-300 ${view === 'grid' ? 'bg-cyan-500/20 border border-cyan-500/50' : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-3 rounded-xl transition-all duration-300 ${view === 'list' ? 'bg-cyan-500/20 border border-cyan-500/50' : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={isDark ? 'text-white font-semibold' : 'text-gray-800 font-semibold'}>{filteredActividades.length}</span> de{' '}
              <span className={isDark ? 'text-white font-semibold' : 'text-gray-800 font-semibold'}>{actividades.length}</span> actividades
            </p>
          </div>

          {/* Grid de actividades */}
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredActividades.map((actividad) => (
                  <ActividadCard
                    key={actividad.id_evento}
                    actividad={actividad}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActividades.map((actividad) => (
                <motion.div
                  key={actividad.id_evento}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden ${isDark ? 'bg-black/50 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}>
                      <img src={actividad.imagen_portada} alt={actividad.titulo} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{actividad.titulo}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${actividad.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : actividad.estado === 'finalizado' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'}`}>
                          {actividad.estado}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{actividad.tipo_evento}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <span className={`text-sm font-semibold ${actividad.costo === 0 ? 'text-emerald-400' : isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                          {actividad.costo === 0 ? 'GRATIS' : `Bs. ${actividad.costo}`}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {actividad.realizaciones.length} sede{actividad.realizaciones.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleView(actividad)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <EyeIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button onClick={() => handleEdit(actividad)} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
                        <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      </button>
                      <button onClick={() => handleDelete(actividad)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                        <TrashIcon className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de creación/edición */}
        <ActividadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          actividad={selectedActividad}
          isEditing={!!selectedActividad}
        />
      </div>

      {/* Modal de detalles */}
      {isDetailOpen && selectedActividad && (
        <ActividadCulturalDetalle
          actividad={selectedActividad}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEdit(selectedActividad);
          }}
        />
      )}
    </>
  );
};

export default ActividadesCulturales;