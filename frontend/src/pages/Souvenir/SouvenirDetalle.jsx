import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ShoppingBagIcon, 
  CubeIcon, 
  BuildingLibraryIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon,
  PencilSquareIcon,
  MapPinIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  ClockIcon,
  HeartIcon,
  ShareIcon,
  SparklesIcon,
  ArrowsPointingOutIcon,   // ← RulerIcon → ArrowsPointingOutIcon
  ScaleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { getImageUrl } from '../../components/config/api';

const SouvenirDetalle = ({ souvenir, onClose, onEdit, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Combinar todas las imágenes (principal + adicionales)
  const allImages = [];
  
  if (souvenir.imagen_principal) {
    allImages.push({ 
      url: souvenir.imagen_principal, 
      isPrincipal: true,
      type: 'principal'
    });
  }
  
  if (souvenir.imagenes_adicionales && souvenir.imagenes_adicionales.length > 0) {
    souvenir.imagenes_adicionales.forEach(img => {
      allImages.push({ 
        url: img.imagen_url, 
        isPrincipal: false,
        id: img.id_imagen,
        descripcion: img.descripcion,
        type: 'adicional'
      });
    });
  }

  const canEdit = userInfo?.rol === 'admin' || 
                  (userInfo?.rol === 'responsable' && 
                   souvenir.repositorios_disponibles?.some(r => r.id_repositorio === userInfo?.id_repositorio_asignado));

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

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-500 text-white', icon: XCircleIcon };
    if (stock < 20) return { text: '¡Últimas unidades!', color: 'bg-amber-500 text-white', icon: SparklesIcon };
    return { text: 'Disponible', color: 'bg-emerald-500 text-white', icon: CheckCircleIcon };
  };

  const repositorios = souvenir.repositorios_disponibles || [];
  const stockTotal = souvenir.stock_total || 0;
  const stockBadge = getStockBadge(stockTotal);
  const StockIcon = stockBadge.icon;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: souvenir.nombre,
        text: `¡Mira este souvenir! ${souvenir.nombre} - Bs. ${souvenir.precio}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  if (allImages.length === 0) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        >
          <div className="text-center text-white">
            <p>Cargando imágenes...</p>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
          className={`relative w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl border ${
            isDark 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/10' 
              : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ============================================ */}
          {/* HEADER CON ACCIONES */}
          {/* ============================================ */}
          <div className={`sticky top-0 flex items-center justify-between p-4 border-b z-20
            ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl flex-shrink-0">
                <ShoppingBagIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <h2 className={`text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {souvenir.nombre}
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-lg transition-colors ${
                  isFavorite 
                    ? 'text-red-500 bg-red-500/10' 
                    : isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <HeartIcon className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-600'
                }`}
                title="Compartir"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              
              {canEdit && (
                <button
                  onClick={() => { onEdit(); onClose(); }}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-white/10 text-amber-400' : 'hover:bg-gray-200 text-amber-600'
                  }`}
                  title="Editar souvenir"
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
            {/* GALERÍA DE IMÁGENES CON CARRUSEL */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Carrusel */}
              <div className="relative group">
                <div 
                  className="relative rounded-xl overflow-hidden bg-gray-900/50 aspect-square cursor-zoom-in shadow-2xl"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  <img 
                    src={getImageUrl(allImages[currentImageIndex].url)} 
                    alt={souvenir.nombre}
                    className={`w-full h-full object-cover transition-transform duration-500 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/600x600/1a2f3a/19ADA0?text=Sin+Imagen';
                    }}
                  />
                  
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2 ${stockBadge.color}`}>
                      <StockIcon className="w-4 h-4" />
                      {stockBadge.text}
                    </span>
                  </div>

                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-md shadow-lg border ${
                      isDark ? 'bg-black/60 border-white/20 text-white' : 'bg-white/90 border-gray-300 text-gray-800'
                    }`}>
                      📦 {stockTotal} uds.
                    </span>
                  </div>

                  {allImages.length > 1 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                        {allImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`w-2.5 h-2.5 rounded-full transition-all ${
                              idx === currentImageIndex 
                                ? 'bg-amber-400 w-8' 
                                : isDark ? 'bg-white/40 hover:bg-white/60' : 'bg-gray-400/50 hover:bg-gray-600/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {allImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); prevImage(); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                      >
                        <ChevronLeftIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); nextImage(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                      >
                        <ChevronRightIcon className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  <div className="absolute bottom-6 right-4 z-10 text-xs text-white/80 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
                    {isZoomed ? '🔍 Alejar' : '🔍 Acercar'}
                  </div>
                </div>

                {allImages.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/30">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          idx === currentImageIndex 
                            ? 'border-amber-500 shadow-lg shadow-amber-500/30 scale-105' 
                            : isDark ? 'border-white/10 hover:border-white/30' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img 
                          src={getImageUrl(img.url)} 
                          alt={`Miniatura ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a2f3a/19ADA0?text=No'; }}
                        />
                        {img.isPrincipal && (
                          <span className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] px-2 py-0.5 rounded-bl-lg font-semibold">
                            ★ Principal
                          </span>
                        )}
                        {allImages.length > 1 && idx === currentImageIndex && (
                          <div className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ============================================ */}
              {/* INFORMACIÓN DEL PRODUCTO */}
              {/* ============================================ */}
              <div className="space-y-5">
                <div>
                  <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {souvenir.nombre}
                  </h3>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <span className={`text-4xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Bs. {souvenir.precio}
                    </span>
                    {stockTotal > 0 && (
                      <span className={`text-sm px-4 py-1.5 rounded-full font-medium ${
                        stockTotal > 20 
                          ? isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {stockTotal > 20 ? '✅ En stock' : '⚠️ Stock limitado'}
                      </span>
                    )}
                  </div>
                </div>

                <div className={`p-5 rounded-xl border-2 ${
                  stockTotal > 0 
                    ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                    : isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      stockTotal > 0 
                        ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                        : isDark ? 'bg-red-500/20' : 'bg-red-100'
                    }`}>
                      {stockTotal > 0 ? (
                        <CheckCircleIcon className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      ) : (
                        <XCircleIcon className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                      )}
                    </div>
                    <div>
                      <p className={`text-lg font-bold ${
                        stockTotal > 0 
                          ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                          : isDark ? 'text-red-400' : 'text-red-700'
                      }`}>
                        {stockTotal > 0 ? '✅ Producto disponible' : '❌ Producto agotado'}
                      </p>
                      {stockTotal > 0 && stockTotal < 20 && (
                        <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          ⚡ ¡Solo quedan {stockTotal} unidades! ¡Aprovecha!
                        </p>
                      )}
                      {stockTotal > 20 && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          🛒 Envío inmediato
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <TagIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipo</span>
                    </div>
                    <p className={`text-sm font-semibold mt-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {souvenir.tipo_souvenir || 'No especificado'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <CubeIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</span>
                    </div>
                    <p className={`text-sm font-semibold mt-1.5 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {souvenir.material || 'No especificado'}
                    </p>
                  </div>
                </div>

                {(souvenir.dimensiones || souvenir.peso) && (
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-4 flex-wrap">
                      {souvenir.dimensiones && (
                        <div className="flex items-center gap-2">
                          <ArrowsPointingOutIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dimensiones</span>
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {souvenir.dimensiones}
                          </span>
                        </div>
                      )}
                      {souvenir.dimensiones && souvenir.peso && (
                        <span className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>|</span>
                      )}
                      {souvenir.peso && (
                        <div className="flex items-center gap-2">
                          <ScaleIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Peso</span>
                          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {souvenir.peso}g
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {repositorios.length > 0 && (
                  <div className={`p-4 rounded-xl ${
                    isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-3">
                      <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Disponible en {repositorios.length} {repositorios.length === 1 ? 'tienda' : 'tiendas'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {repositorios.map((repo, idx) => (
                        <div key={repo.id_repositorio || idx} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
                          isDark ? 'bg-black/40 border border-white/10' : 'bg-white border border-gray-200 shadow-sm'
                        }`}>
                          <BuildingStorefrontIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                          <span className={`font-bold ${getStockColor(repo.stock)}`}>({repo.stock})</span>
                          {(repo.ubicacion_gps || repo.direccion) && (
                            <button
                              onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                              className="text-teal-500 hover:text-teal-400 transition-colors"
                              title="Ver en mapa"
                            >
                              <MapPinIcon className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ============================================ */}
            {/* DESCRIPCIONES */}
            {/* ============================================ */}
            <div className="mt-8 grid grid-cols-1 gap-4">
              {souvenir.descripcion_general && (
                <div className={`p-5 rounded-xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>📖 Descripción</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {souvenir.descripcion_general}
                  </p>
                </div>
              )}

              {souvenir.descripcion_especifica && (
                <div className={`p-5 rounded-xl ${
                  isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <DocumentTextIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>🔍 Detalles técnicos</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {souvenir.descripcion_especifica}
                  </p>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClockIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Publicado el {new Date(souvenir.fecha_creacion).toLocaleDateString('es-BO', {
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
                    className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isDark 
                        ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400' 
                        : 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                    }`}
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                    Editar producto
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
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

export default SouvenirDetalle;