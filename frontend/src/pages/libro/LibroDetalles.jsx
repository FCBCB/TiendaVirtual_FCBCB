import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BookOpenIcon, 
  UserIcon, 
  BuildingLibraryIcon,
  TagIcon,
  CalendarIcon,
  PencilSquareIcon,
  MapPinIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { getImageUrl } from '../../components/config/api';

const LibroDetalle = ({ libro, onClose, onEdit, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const portadaUrl = getImageUrl(libro.portada_libro || libro.imagen_principal);
  
  const autorCompleto = libro.autor_nombre_completo || 
                        (libro.autor_nombre && libro.autor_apellido ? 
                          `${libro.autor_nombre} ${libro.autor_apellido}` : 
                          libro.autor || 'Autor desconocido');
  
  const canEdit = userInfo?.rol === 'admin' || 
                  (userInfo?.rol === 'responsable' && 
                   libro.repositorios_disponibles?.some(r => r.id_repositorio === userInfo?.id_repositorio_asignado));

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-500';
    if (stock < 20) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircleIcon };
    if (stock < 20) return { text: '¡Últimas unidades!', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: CheckCircleIcon };
    return { text: 'Disponible', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: CheckCircleIcon };
  };

  const repositorios = libro.repositorios_disponibles || [];
  const stockTotal = libro.stock_total || 0;
  const stockBadge = getStockBadge(stockTotal);
  const StockIcon = stockBadge.icon;

  const hasIsbn = libro.isbn && libro.isbn.trim() !== '';
  const hasEditorial = libro.editorial && libro.editorial.trim() !== '';
  const hasAnio = libro.anio_publicacion && libro.anio_publicacion.toString().trim() !== '';
  const hasTema = libro.tema && libro.tema.trim() !== '';
  const hasCategoria = libro.categoria_nombre && libro.categoria_nombre.trim() !== '';
  const hasReseña = libro.reseña && libro.reseña.trim() !== '';
  const hasDescripcionGeneral = libro.descripcion_general && libro.descripcion_general.trim() !== '';
  const hasDescripcionEspecifica = libro.descripcion_especifica && libro.descripcion_especifica.trim() !== '';

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
          className={`relative w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/10' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ============================================ */}
          {/* HEADER */}
          {/* ============================================ */}
          <div className={`sticky top-0 flex items-center justify-between p-4 border-b z-20
            ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex-shrink-0">
                <BookOpenIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h2 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {libro.titulo_libro || libro.nombre}
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && (
                <button
                  onClick={() => { onEdit(); onClose(); }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-blue-400' : 'hover:bg-gray-200 text-blue-600'
                  }`}
                  title="Editar libro"
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

          <div className="p-4 md:p-6">
            {/* ============================================ */}
            {/* PORTADA Y INFORMACIÓN PRINCIPAL */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Portada */}
              <div className="relative rounded-xl overflow-hidden bg-gray-900/30">
                <div className="aspect-[3/4] w-full">
                  <img 
                    src={portadaUrl} 
                    alt={libro.titulo_libro || libro.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x800/1a2f3a/19ADA0?text=Sin+Portada';
                    }}
                  />
                </div>
                
                {/* Badge de disponibilidad */}
                <div className="absolute top-4 left-4 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center gap-1.5 ${stockBadge.color}`}>
                    <StockIcon className="w-3.5 h-3.5" />
                    {stockBadge.text}
                  </span>
                </div>
                
                {/* Badge de estado */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm border ${
                    libro.activo 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {libro.activo ? '● Activo' : '● Inactivo'}
                  </span>
                </div>
                
                {/* ✅ PRECIO FLOTANTE CON DESCUENTO */}
                <div className="absolute bottom-4 right-4 z-10">
                  {libro.aplica_descuento && libro.descuento_porcentaje > 0 ? (
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                        Bs. {parseFloat(libro.precio_con_descuento).toFixed(2)}
                      </span>
                      <span className="text-xs line-through text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                        Bs. {parseFloat(libro.precio).toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                        -{libro.descuento_porcentaje}%
                      </span>
                    </div>
                  ) : (
                    <span className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                      Bs. {parseFloat(libro.precio).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* ============================================ */}
              {/* INFORMACIÓN DEL LIBRO */}
              {/* ============================================ */}
              <div className="space-y-4">
                {/* Título */}
                <div>
                  <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {libro.titulo_libro || libro.nombre}
                  </h3>
                  {libro.categoria_nombre && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full text-xs font-medium ${
                      isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                    }`}>
                      <TagIcon className="w-3 h-3" />
                      {libro.categoria_nombre}
                    </span>
                  )}
                </div>

                {/* Autor */}
                <div className={`p-3 rounded-xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <UserIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Autor</span>
                  </div>
                  <p className={`text-base font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {autorCompleto}
                  </p>
                </div>

                {/* Stock y Precio */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <ShoppingBagIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock</span>
                    </div>
                    <p className={`text-lg font-bold mt-1 ${getStockColor(stockTotal)}`}>
                      {stockTotal} unidades
                    </p>
                  </div>
                  
                  {/* ✅ PRECIO CON DESCUENTO EN INFO */}
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio</span>
                    </div>
                    {libro.aplica_descuento && libro.descuento_porcentaje > 0 ? (
                      <div className="mt-1">
                        <p className={`text-lg font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          Bs. {parseFloat(libro.precio_con_descuento).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Bs. {parseFloat(libro.precio).toFixed(2)}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500`}>
                            -{libro.descuento_porcentaje}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-lg font-bold mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        Bs. {parseFloat(libro.precio).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Datos adicionales */}
                {(hasIsbn || hasEditorial || hasAnio || hasTema) && (
                  <div className={`p-3 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="grid grid-cols-2 gap-2">
                      {hasIsbn && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ISBN</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{libro.isbn}</p>
                        </div>
                      )}
                      {hasEditorial && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Editorial</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{libro.editorial}</p>
                        </div>
                      )}
                      {hasAnio && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Año</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{libro.anio_publicacion}</p>
                        </div>
                      )}
                      {hasTema && (
                        <div>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tema</p>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{libro.tema}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* REPOSITORIOS DISPONIBLES */}
            {/* ============================================ */}
            {repositorios.length > 0 && (
              <div className={`mt-6 p-4 rounded-xl ${
                isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <BuildingLibraryIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Disponible en {repositorios.length} {repositorios.length === 1 ? 'tienda' : 'tiendas'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {repositorios.map((repo, idx) => (
                    <div key={repo.id_repositorio || idx} className={`flex items-center justify-between p-3 rounded-xl flex-wrap gap-2 ${
                      isDark ? 'bg-black/40 border border-white/10' : 'bg-white border border-gray-200'
                    }`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({repo.sigla})</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStockColor(repo.stock)} bg-current/10`}>
                            Stock: {repo.stock}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPinIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {repo.direccion}
                          </span>
                          {(repo.ubicacion_gps || repo.direccion) && (
                            <button
                              onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors bg-blue-500/10 rounded-lg hover:bg-blue-500/20"
                            >
                              <MapPinIcon className="w-3 h-3" />
                              Ver ubicación
                            </button>
                          )}
                        </div>
                        {repo.departamento && (
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            📍 {repo.departamento}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* DESCRIPCIONES */}
            {/* ============================================ */}
            {(hasDescripcionGeneral || hasDescripcionEspecifica || hasReseña) && (
              <div className="mt-6 space-y-4">
                {hasDescripcionGeneral && (
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Descripción</span>
                    </div>
                    <p className={`text-sm leading-relaxed text-justify ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {libro.descripcion_general}
                    </p>
                  </div>
                )}

                {hasDescripcionEspecifica && (
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Especificaciones</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {libro.descripcion_especifica}
                    </p>
                  </div>
                )}

                {hasReseña && (
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentTextIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>Reseña</span>
                    </div>
                    <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {libro.reseña}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Publicado el {new Date(libro.fecha_creacion).toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    onClick={() => { onEdit(); onClose(); }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isDark 
                        ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' 
                        : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                    }`}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Editar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LibroDetalle;