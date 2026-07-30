import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  DocumentIcon, 
  UserIcon, 
  BuildingLibraryIcon,
  TagIcon,
  CalendarIcon,
  PencilSquareIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  EyeSlashIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { getImageUrl, API_URL } from '../../components/config/api';

const MaterialDetalle = ({ material, onClose, onEdit, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(material.imagen_portada);
  
  const canEdit = userInfo?.rol === 'admin' || 
                  (userInfo?.rol === 'responsable' && 
                   material.id_repositorio === userInfo?.id_repositorio_asignado);

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
  };

  const handleDescargar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/material/${material.id_material}/descargar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Crear un enlace temporal y descargar
        const link = document.createElement('a');
        link.href = `${API_URL}${data.archivo_url}`;
        link.target = '_blank';
        link.download = material.titulo;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert(data.message || 'Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error descargando:', error);
      alert('Error de conexión al descargar');
    }
  };

  const getTipoIcon = (tipo) => {
    const tipos = {
      'pdf': '📄 PDF',
      'doc': '📝 DOC',
      'docx': '📝 DOCX',
      'xls': '📊 XLS',
      'xlsx': '📊 XLSX',
      'ppt': '📊 PPT',
      'pptx': '📊 PPTX',
      'imagen': '🖼️ Imagen',
      'video': '🎬 Video',
      'audio': '🎵 Audio',
      'zip': '📦 ZIP',
      'rar': '📦 RAR',
      'otro': '📎 Otro'
    };
    return tipos[tipo] || '📄 Archivo';
  };

  const repositorios = material.repositorios_adicionales || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/10' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`sticky top-0 flex items-center justify-between p-4 border-b z-20
            ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-xl flex-shrink-0">
                <DocumentIcon className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <h2 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {material.titulo}
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && (
                <button
                  onClick={() => { onEdit(); onClose(); }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-teal-400' : 'hover:bg-gray-200 text-teal-600'
                  }`}
                  title="Editar material"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="Cerrar"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Banner superior con portada y datos clave */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="md:col-span-1">
                <div className="relative rounded-xl overflow-hidden bg-gray-900/30">
                  <div className="aspect-[3/4] w-full">
                    <img 
                      src={portadaUrl || 'https://placehold.co/400x500/1a2f3a/19ADA0?text=Sin+Portada'} 
                      alt={material.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x500/1a2f3a/19ADA0?text=Sin+Portada';
                      }}
                    />
                  </div>
                  
                  <div className="absolute top-3 left-3 z-10 flex gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm ${
                      material.activo 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {material.activo ? '● Activo' : '● Inactivo'}
                    </span>
                  </div>
                  
                  <div className="absolute top-3 right-3 z-10">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold backdrop-blur-sm border ${
                      material.visibilidad 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {material.visibilidad ? '👁️ Público' : '🔒 Oculto'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-4">
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {material.titulo}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      isDark ? 'bg-teal-500/20 text-teal-400' : 'bg-teal-100 text-teal-700'
                    }`}>
                      <DocumentIcon className="w-3 h-3" />
                      {getTipoIcon(material.tipo_material)}
                    </span>
                    {material.categoria_nombre && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                      }`}>
                        <TagIcon className="w-3 h-3" />
                        {material.categoria_nombre}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`flex items-center gap-2 p-3 rounded-xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <UserIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {material.autor_nombre_completo || 'Autor no especificado'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Descargas</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                      {material.descargas || 0}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Visitas</p>
                    <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {material.visitas || 0}
                    </p>
                  </div>
                  {material.anio_publicacion && (
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Año</p>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {material.anio_publicacion}
                      </p>
                    </div>
                  )}
                  {material.editorial && (
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Editorial</p>
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {material.editorial}
                      </p>
                    </div>
                  )}
                </div>

                {/* Botón de descarga */}
                <button
                  onClick={handleDescargar}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  Descargar {material.tipo_material?.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Descripción */}
            {material.descripcion && (
              <div className={`p-4 rounded-xl mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Descripción</span>
                </div>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {material.descripcion}
                </p>
              </div>
            )}

            {/* Repositorios */}
            {repositorios.length > 0 && (
              <div className={`p-4 rounded-xl mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Repositorios disponibles
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {repositorios.map((repo, idx) => (
                    <div key={repo.id_repositorio || idx} className={`flex items-center justify-between p-2.5 rounded-xl flex-wrap gap-2 ${
                      isDark ? 'bg-black/40 border border-white/10' : 'bg-white border border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({repo.sigla})</span>
                      </div>
                      {(repo.direccion || repo.ubicacion_gps) && (
                        <button
                          onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors bg-teal-500/10 rounded-lg hover:bg-teal-500/20"
                        >
                          <MapPinIcon className="w-3 h-3" />
                          Ver ubicación
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Palabras clave */}
            {material.palabras_clave && (
              <div className={`p-4 rounded-xl mb-6 ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Palabras clave</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {material.palabras_clave.split(',').map((tag, idx) => (
                    <span key={idx} className={`px-2.5 py-1 rounded-full text-xs ${
                      isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Publicado el {new Date(material.fecha_publicacion).toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              {material.idioma && (
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  🌐 {material.idioma.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaterialDetalle;