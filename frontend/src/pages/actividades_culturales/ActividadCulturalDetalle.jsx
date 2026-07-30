import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  TicketIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';

const ActividadCulturalDetalle = ({ actividad, onClose, onEdit }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-BO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

  const openGoogleMaps = (lat, lng) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    }
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
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000] ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
        onClick={(e) => e.stopPropagation()}
      >
          {/* Header */}
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-10`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-xl">
                <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {actividad.titulo}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit()}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
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
            {/* Imagen y datos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={actividad.imagen_portada} 
                  alt={actividad.titulo}
                  className="w-full h-80 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${actividad.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : actividad.estado === 'finalizado' ? 'bg-gray-500/20 text-gray-400' : 'bg-red-500/20 text-red-400'} backdrop-blur-sm`}>
                    {actividad.estado === 'activo' ? 'Activo' : actividad.estado === 'finalizado' ? 'Finalizado' : 'Inactivo'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${getTipoColor(actividad.tipo_evento)} text-white shadow-lg`}>
                    {actividad.tipo_evento}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Costo</span>
                    <span className={`text-2xl font-bold ${actividad.costo === 0 ? 'text-emerald-400' : isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {actividad.costo === 0 ? 'GRATIS' : `Bs. ${actividad.costo}`}
                    </span>
                  </div>
                </div>
                
                {actividad.requiere_inscripcion && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserGroupIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Inscripción</span>
                    </div>
                    <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Cupo máximo: {actividad.cupo_maximo} personas
                    </p>
                    <p className={`ml-8 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Se requiere inscripción previa
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Descripción */}
            <div className={`p-4 rounded-xl mb-8 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Descripción</span>
              </div>
              <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{actividad.descripcion}</p>
            </div>
            
            {/* Sedes y fechas */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-4">
                <BuildingLibraryIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Sedes y Fechas</span>
              </div>
              <div className="space-y-4">
                {actividad.realizaciones.map((real, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-gray-200'}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BuildingLibraryIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{real.nombre}</h4>
                      </div>
                      {real.cupos_disponibles > 0 && real.cupos_disponibles < 20 && (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
                          Últimos {real.cupos_disponibles} cupos
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {formatDate(real.fecha)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {real.hora_inicio} - {real.hora_fin}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 mt-2">
                      <MapPinIcon className={`w-4 h-4 mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{real.direccion}</p>
                        {real.ubicacion_gps && (
                          <button
                            onClick={() => {
                              const [lat, lng] = real.ubicacion_gps.split(',');
                              openGoogleMaps(lat, lng);
                            }}
                            className="inline-flex items-center gap-1 mt-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            <GlobeAltIcon className="w-3 h-3" />
                            Ver en mapa
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {actividad.requiere_inscripcion && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              Cupos disponibles: {real.cupos_disponibles}
                            </span>
                          </div>
                          {real.cupos_disponibles > 0 && (
                            <button className="px-3 py-1 text-sm bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg text-white hover:shadow-lg transition-all duration-300">
                              Inscribirse
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Fecha de creación */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-end gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Publicado el {new Date(actividad.fecha_creacion).toLocaleDateString('es-BO')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActividadCulturalDetalle;