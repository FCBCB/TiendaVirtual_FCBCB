import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { getImageUrl } from '../../components/config/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EventoDetalle = ({ evento, onClose, onEdit, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const imagenUrl = getImageUrl(evento.imagen_portada);
  
  const canEdit = userInfo?.rol === 'admin' || 
                  (userInfo?.rol === 'responsable' && 
                   evento.realizaciones?.some(r => r.id_repositorio === userInfo?.id_repositorio_asignado));

  const openGoogleMaps = (ubicacion_gps) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    }
  };

  const openOpenStreetMap = (lat, lng) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, '_blank');
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactivo': return 'bg-red-500/20 text-red-400';
      case 'finalizado': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getRealizacionStatusColor = (estado) => {
    switch(estado) {
      case 'programado': return 'bg-blue-500/20 text-blue-400';
      case 'en_curso': return 'bg-amber-500/20 text-amber-400';
      case 'finalizado': return 'bg-gray-500/20 text-gray-400';
      case 'cancelado': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const realizaciones = evento.realizaciones || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-20`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-xl">
                <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {evento.titulo}
              </h2>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit()}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                  title="Editar evento"
                >
                  <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                title="Cerrar"
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={imagenUrl} 
                  alt={evento.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Imagen';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(evento.estado)} backdrop-blur-sm`}>
                    {evento.estado === 'activo' ? 'Activo' : evento.estado === 'finalizado' ? 'Finalizado' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</span>
                    <span className={`text-lg font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                      {evento.tipo_evento}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Costo</span>
                    <span className={`text-xl font-bold ${evento.costo === 0 || evento.costo === '0' ? 'text-emerald-400' : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`}>
                      {evento.costo === 0 || evento.costo === '0' ? 'GRATIS' : `Bs. ${evento.costo}`}
                    </span>
                  </div>
                  {evento.requiere_inscripcion && (
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cupo Máximo</span>
                      <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {evento.cupo_maximo === 0 || evento.cupo_maximo === '0' ? 'Evento Libre' : `${evento.cupo_maximo} personas`}
                      </span>
                    </div>
                  )}
                </div>
                
                {evento.requiere_inscripcion && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserGroupIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Inscripciones</span>
                    </div>
                    <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {evento.requiere_inscripcion ? 'Requiere inscripción previa' : 'Acceso libre'}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Descripción */}
            <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-3 mb-3">
                <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Descripción</span>
              </div>
              <p className={`ml-8 whitespace-pre-wrap text-justify ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{evento.descripcion}</p>
            </div>
            
            {/* Realizaciones - Con mapa interactivo */}
            {realizaciones.length > 0 && (
              <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Fechas y Ubicaciones ({realizaciones.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {realizaciones.map((real, idx) => {
                    const [lat, lng] = real.ubicacion_gps ? real.ubicacion_gps.split(',').map(Number) : [null, null];
                    const hasValidCoords = lat && lng && !isNaN(lat) && !isNaN(lng);
                    
                    return (
                      <div key={idx} className={`p-4 rounded-lg ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-gray-200'}`}>
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <BuildingLibraryIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {real.repositorio_nombre || 'Repositorio organizador'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getRealizacionStatusColor(real.estado_realizacion)}`}>
                              {real.estado_realizacion || 'Programado'}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {formatDate(real.fecha)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <ClockIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {real.hora_inicio} - {real.hora_fin}
                            </span>
                          </div>
                          
                          {/* Ubicación con mapa interactivo */}
                          <div className="md:col-span-2">
                            {hasValidCoords ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                                  <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    Ubicación del evento:
                                  </span>
                                  <code className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800 text-cyan-400' : 'bg-gray-100 text-cyan-600'}`}>
                                    {real.ubicacion_gps}
                                  </code>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => openGoogleMaps(real.ubicacion_gps)}
                                      className="text-xs bg-teal-500 hover:bg-teal-600 text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      <MapPinIcon className="w-3 h-3" />
                                      Google Maps
                                    </button>
                                    <button
                                      onClick={() => openOpenStreetMap(lat, lng)}
                                      className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                      🌍 OpenStreetMap
                                    </button>
                                  </div>
                                </div>
                                {/* Mapa interactivo pequeño */}
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700" style={{ height: '200px' }}>
                                  <MapContainer
                                    center={[lat, lng]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                    scrollWheelZoom={false}
                                  >
                                    <TileLayer
                                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[lat, lng]}>
                                      <Popup>
                                        <div className="text-xs">
                                          <strong>{evento.titulo}</strong><br />
                                          {formatDate(real.fecha)}<br />
                                          {real.hora_inicio} - {real.hora_fin}
                                        </div>
                                      </Popup>
                                    </Marker>
                                  </MapContainer>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPinIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  Ubicación no especificada
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {evento.requiere_inscripcion && (
                            <div className="flex items-center gap-2">
                              <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                Cupos disponibles: {real.cupos_disponibles === 0 || real.cupos_disponibles === '0' ? 'Evento Libre' : `${real.cupos_disponibles || 0} cupos`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Fecha de creación */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-end gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Creado el {new Date(evento.fecha_creacion).toLocaleDateString('es-BO')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EventoDetalle;