import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PhotoIcon, 
  UserIcon, 
  BuildingLibraryIcon,
  TagIcon,
  CalendarIcon,
  PencilSquareIcon,
  MapPinIcon,
  ArchiveBoxIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { getImageUrl } from '../../components/config/api';

const CatalogoDetalle = ({ catalogo, onClose, onEdit, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(catalogo.portada_url);
  
  const canEdit = userInfo?.rol === 'admin' || 
                  (userInfo?.rol === 'responsable' && 
                   catalogo.repositorios_disponibles?.some(r => r.id_repositorio === userInfo?.id_repositorio_asignado));

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 20) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const repositorios = catalogo.repositorios_disponibles || [];

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
              <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                <PhotoIcon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {catalogo.titulo}
              </h2>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => onEdit()}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                  title="Editar catálogo"
                >
                  <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
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
              {/* Portada */}
              <div className="relative rounded-xl overflow-hidden">
                <img 
                  src={portadaUrl} 
                  alt={catalogo.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Portada';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${catalogo.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'} backdrop-blur-sm`}>
                    {catalogo.estado === 'activo' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              
              {/* Información básica */}
              <div className="space-y-4">
                {catalogo.curaduria && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Curador</span>
                    </div>
                    <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{catalogo.curaduria}</p>
                  </div>
                )}
                
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio</span>
                    <span className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Bs. {catalogo.precio}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock total</span>
                    <span className={`text-xl font-semibold ${getStockColor(catalogo.stock || 0)}`}>
                      {catalogo.stock || 0} unidades
                    </span>
                  </div>
                </div>
                
                {catalogo.formato && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <ArchiveBoxIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Formato</span>
                    </div>
                    <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{catalogo.formato}</p>
                  </div>
                )}
                
                {catalogo.anio_publicacion && (
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <CalendarIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Año de Publicación</span>
                    </div>
                    <p className={`ml-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{catalogo.anio_publicacion}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Repositorios disponibles */}
            {repositorios.length > 0 && (
              <div className={`mb-8 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  <BuildingLibraryIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Repositorios donde está disponible ({repositorios.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {repositorios.map((repo, idx) => (
                    <div key={repo.id_repositorio || idx} className={`p-3 rounded-lg ${isDark ? 'bg-black/30 border border-white/10' : 'bg-white border border-gray-200'}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({repo.sigla})</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStockColor(repo.stock)}`}>
                              Stock: {repo.stock}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPinIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {repo.direccion}
                            </span>
                            {(repo.ubicacion_gps || repo.direccion) && (
                              <button
                                onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                                className="text-xs text-teal-500 hover:text-teal-400 flex items-center gap-1"
                              >
                                <MapPinIcon className="w-3 h-3" />
                                Ver en mapa
                              </button>
                            )}
                          </div>
                          {repo.departamento && (
                            <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              📍 {repo.departamento}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Reseña */}
            {catalogo.reseña && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`font-semibold   ${isDark ? 'text-white' : 'text-gray-800'}`}>Reseña</span>
                </div>
                <p className={`ml-8 whitespace-pre-wrap text-justify ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{catalogo.reseña}</p>
              </div>
            )}
            
            {/* Fecha de creación */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-end gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Creado el {new Date(catalogo.fecha_creacion).toLocaleDateString('es-BO')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CatalogoDetalle;