import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  TagIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  CalendarIcon,
  DocumentIcon,
  DocumentTextIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getImageUrl, API_URL } from '../../../../components/config/api';
import { useTheme } from '../../../../components/context/ThemeContext';

const P = {
  pizarra: '#3D4560',
  bosque: '#3A5240',
  turquesa: '#4A9A8E',
  beige: '#D4C5A0',
  marron: '#2A1F14',
  malva: '#9E6B85',
  oro: '#C9A84C',
};

const AGUAYO_STRIPES = [P.turquesa, P.malva, P.beige, P.bosque, P.turquesa];

// ─── Componente de texto expandible ──────────────────────────────────────
const ExpandableText = ({ text, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setNeedsExpansion(textRef.current.scrollHeight > 150);
    }
  }, [text]);

  if (!text) return null;

  return (
    <div className="relative">
      <div 
        ref={textRef}
        className={`${className} ${!isExpanded && needsExpansion ? 'max-h-[150px] overflow-hidden' : ''}`}
        style={{ 
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: '1.8'
        }}
      >
        {text}
      </div>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-xs font-medium text-teal-500 hover:text-teal-400 transition-colors flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUpIcon className="w-4 h-4" />
              Ver menos
            </>
          ) : (
            <>
              <ChevronDownIcon className="w-4 h-4" />
              Ver más
            </>
          )}
        </button>
      )}
    </div>
  );
};

// ─── Visor de PDF ───────────────────────────────────────────────────────
const PDFViewer = ({ fileUrl, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header del visor */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <DocumentIcon className="w-5 h-5 text-teal-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Visor de PDF</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido del PDF */}
          <div className="w-full h-full pt-16">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto" />
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Cargando PDF...</p>
                </div>
              </div>
            )}
            <iframe
              src={fileUrl}
              className="w-full h-full"
              title="Visor de PDF"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const LibreriaGratisDetalleScreen = ({ material, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ─── Imágenes ──────────────────────────────────────────────────────────
  const allImages = [];
  if (material.imagen_portada) {
    allImages.push({ 
      url: material.imagen_portada, 
      isPrincipal: true,
      label: 'Portada'
    });
  }
  // Si hay imágenes adicionales (se pueden agregar luego)
  if (material.imagenes_adicionales?.length) {
    material.imagenes_adicionales.forEach((img) => {
      allImages.push({ 
        url: img.imagen_url, 
        isPrincipal: false,
        label: img.descripcion || `Imagen ${allImages.length + 1}`
      });
    });
  }
  if (allImages.length === 0) {
    allImages.push({ 
      url: null, 
      isPrincipal: false, 
      label: 'Sin imagen' 
    });
  }

  const totalImages = allImages.length;
  const hasMultipleImages = totalImages > 1;

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + allImages.length) % allImages.length);

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
        title: material.titulo,
        text: `Mira este material: ${material.titulo}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  const handleDescargar = async () => {
    try {
      setDescargando(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/material/${material.id_material}/descargar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Verificar si el archivo es PDF para mostrar visor
        if (material.tipo_material === 'pdf' && data.archivo_url) {
          setShowPDFViewer(true);
        } else {
          // Descarga normal
          const link = document.createElement('a');
          link.href = `${API_URL}${data.archivo_url}`;
          link.target = '_blank';
          link.download = material.titulo;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert(data.message || 'Error al descargar el archivo');
      }
    } catch (error) {
      console.error('Error descargando:', error);
      alert('Error de conexión al descargar');
    } finally {
      setDescargando(false);
    }
  };

  const openGoogleMaps = (ubicacion_gps, direccion, nombre) => {
    let url = '';
    if (ubicacion_gps) {
      url = `https://www.google.com/maps?q=${ubicacion_gps}`;
    } else if (direccion) {
      url = `https://www.google.com/maps/search/${encodeURIComponent(direccion + ' ' + nombre)}`;
    }
    if (url) {
      window.open(url, '_blank');
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

  const getTipoColor = (tipo) => {
    const colores = {
      'pdf': 'bg-red-500/20 text-red-400 border-red-500/30',
      'doc': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'docx': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'xls': 'bg-green-500/20 text-green-400 border-green-500/30',
      'xlsx': 'bg-green-500/20 text-green-400 border-green-500/30',
      'ppt': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'pptx': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'imagen': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'video': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'audio': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      'zip': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      'rar': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colores[tipo] || 'bg-teal-500/20 text-teal-400 border-teal-500/30';
  };

  const repositorios = material.repositorios_adicionales || [];

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-white dark:bg-gray-950"
    >
      <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})` }} />

      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`p-2 rounded-lg transition-colors ${
                isFavorite 
                  ? 'text-red-500 bg-red-500/10' 
                  : isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              {isFavorite ? <HeartSolidIcon className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleShare}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showShare && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-xl shadow-lg text-sm">
          Enlace copiado al portapapeles
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ── Galería ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div 
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-lg group cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(allImages[currentImageIndex]?.url) || 'https://placehold.co/600x800/1a2f3a/19ADA0?text=Sin+Portada'}
                  alt={material.titulo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x800/1a2f3a/19ADA0?text=Sin+Portada';
                  }}
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border-emerald-500/30`}>
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  {material.visibilidad ? 'Público' : 'Privado'}
                </span>
                {material.activo && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    Activo
                  </span>
                )}
              </div>

              {/* Tipo de archivo */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${getTipoColor(material.tipo_material)}`}>
                  {getTipoIcon(material.tipo_material)}
                </span>
              </div>

              {hasMultipleImages && (
                <div className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full text-xs font-medium bg-black/60 text-white backdrop-blur-sm shadow-lg flex items-center gap-1.5">
                  <PhotoIcon className="w-3.5 h-3.5" />
                  {currentImageIndex + 1} / {totalImages}
                </div>
              )}

              {hasMultipleImages && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                  {allImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-teal-400 w-6' : 'bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10 text-[10px] text-white/60 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                {isZoomed ? 'Alejar' : 'Acercar'}
              </div>
            </div>

            {hasMultipleImages && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-teal-500 shadow-lg shadow-teal-500/30 scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img.url) || 'https://placehold.co/100x140/1a2f3a/19ADA0?text=No'} 
                      alt={img.label || `Imagen ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/100x140/1a2f3a/19ADA0?text=No'; }}
                    />
                    {img.isPrincipal && (
                      <span className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                        Portada
                      </span>
                    )}
                    {idx === currentImageIndex && (
                      <div className="absolute inset-0 border-2 border-teal-500 rounded-lg pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Información ──────────────────────────────────────────── */}
          <div>
            {/* Categoría */}
            {material.categoria_nombre && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: `${P.turquesa}18`, color: P.turquesa }}
              >
                {material.categoria_nombre}
              </span>
            )}

            {/* Título */}
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {material.titulo}
            </h1>

            {/* Autor */}
            <div className="flex items-center gap-2 mt-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {material.autor_nombre_completo || 'Autor desconocido'}
              </p>
            </div>

            {/* Estadísticas y metadatos */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <ArrowDownTrayIcon className="w-4 h-4 text-teal-500" />
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Descargas</span>
                </div>
                <p className={`text-xl font-bold mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {material.descargas || 0}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-teal-500" />
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Visitas</span>
                </div>
                <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {material.visitas || 0}
                </p>
              </div>
            </div>

            {/* Detalles adicionales */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {material.anio_publicacion && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                    <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Año</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {material.anio_publicacion}
                  </p>
                </div>
              )}
              {material.editorial && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                    <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Editorial</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {material.editorial}
                  </p>
                </div>
              )}
            </div>

            {/* Tipo de archivo */}
            <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <DocumentIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de archivo</span>
              </div>
              <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {getTipoIcon(material.tipo_material)}
              </p>
            </div>

            {/* Botón de descarga */}
            <button
              onClick={handleDescargar}
              disabled={descargando}
              className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {descargando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Descargando...
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-5 h-5" />
                  {material.tipo_material === 'pdf' ? 'Ver PDF' : `Descargar ${material.tipo_material?.toUpperCase()}`}
                </>
              )}
            </button>

            {/* Descripción */}
            {material.descripcion && (
              <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Descripción</h3>
                <ExpandableText 
                  text={material.descripcion}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}

            {/* Repositorios */}
            {repositorios.length > 0 && (
              <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <BuildingStorefrontIcon className="w-5 h-5" style={{ color: P.turquesa }} />
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Disponible en {repositorios.length} {repositorios.length === 1 ? 'tienda' : 'tiendas'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {repositorios.map((repo, idx) => {
                    return (
                      <div 
                        key={repo.id_repositorio || idx} 
                        className={`p-4 rounded-xl border transition-all ${
                          isDark 
                            ? 'bg-black/40 border-white/10 hover:border-teal-500/30' 
                            : 'bg-white border-gray-200 hover:border-teal-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <BuildingStorefrontIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {repo.nombre}
                              </span>
                              {repo.sigla && (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  ({repo.sigla})
                                </span>
                              )}
                            </div>
                            {repo.direccion && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPinIcon className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {repo.direccion}
                                </span>
                              </div>
                            )}
                            {repo.departamento && (
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {repo.departamento}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {(repo.ubicacion_gps || repo.direccion) && (
                              <button
                                onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion, repo.nombre)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                                  isDark 
                                    ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' 
                                    : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                                }`}
                              >
                                <MapPinIcon className="w-3.5 h-3.5" />
                                Ver mapa
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Palabras clave */}
            {material.palabras_clave && (
              <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Palabras clave</h3>
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

            {/* Fecha de publicación */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <ClockIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Publicado el {new Date(material.fecha_publicacion).toLocaleDateString('es-BO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Visor de PDF */}
      {showPDFViewer && (
        <PDFViewer 
          fileUrl={`${API_URL}${material.archivo_url}`}
          onClose={() => setShowPDFViewer(false)}
        />
      )}
    </motion.div>
  );
};

export default LibreriaGratisDetalleScreen;