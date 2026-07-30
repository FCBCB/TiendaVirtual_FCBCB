import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  BoltIcon,
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
  GlobeAltIcon,
  BookOpenIcon,
  DocumentTextIcon,
  HeartIcon,
  ShareIcon,
  ClockIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '../../../../components/config/api';
import { useTheme } from '../../../../components/context/ThemeContext';
// ✅ IMPORTAR useCart
import { useCart } from '../../../../components/context/CartContext';

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

// ─── Helper para verificar descuento ─────────────────────────────────────
const verificarDescuento = (libro) => {
  const porcentaje = parseFloat(libro.descuento_porcentaje) || 0;
  const precio = parseFloat(libro.precio) || 0;
  
  const fechaInicio = libro.fecha_inicio_descuento ? new Date(libro.fecha_inicio_descuento) : null;
  const fechaFin = libro.fecha_fin_descuento ? new Date(libro.fecha_fin_descuento) : null;
  const ahora = new Date();
  
  const tieneDescuento = porcentaje > 0 && 
    (fechaInicio === null || fechaInicio <= ahora) &&
    (fechaFin === null || fechaFin >= ahora);
  
  let precioConDesc = parseFloat(libro.precio_con_descuento);
  if (isNaN(precioConDesc) || precioConDesc <= 0) {
    precioConDesc = precio - (precio * porcentaje / 100);
  }
  
  return {
    tieneDescuento: tieneDescuento,
    porcentaje: porcentaje,
    precio: precio,
    precioConDescuento: precioConDesc
  };
};

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
          className="mt-2 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
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

const LibroDetalleScreen = ({ libro, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  // ✅ Estado para repositorio seleccionado
  const [selectedRepositorio, setSelectedRepositorio] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // ✅ OBTENER FUNCIÓN PARA AGREGAR AL CARRITO
  const { addToCart } = useCart();

  // ─── Imágenes ──────────────────────────────────────────────────────────
  const allImages = [];
  if (libro.portada_libro) {
    allImages.push({ 
      url: libro.portada_libro, 
      isPrincipal: true,
      label: 'Portada'
    });
  }
  if (libro.imagen_principal) {
    allImages.push({ 
      url: libro.imagen_principal, 
      isPrincipal: false,
      label: 'Imagen principal'
    });
  }
  if (libro.imagenes_adicionales?.length) {
    libro.imagenes_adicionales.forEach((img) => {
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

  // ─── Eliminar duplicados ──────────────────────────────────────────────
  const uniqueImages = [];
  const seenUrls = new Set();
  allImages.forEach(img => {
    if (img.url && !seenUrls.has(img.url)) {
      seenUrls.add(img.url);
      uniqueImages.push(img);
    }
  });

  const stock = libro.stock_total || 0;
  const repositorios = libro.repositorios_disponibles || [];
  const descuento = verificarDescuento(libro);
  const mostrarDescuento = descuento.tieneDescuento;
  const precioConDescuento = descuento.precioConDescuento;
  const descuentoPorcentaje = descuento.porcentaje;
  const totalImages = uniqueImages.length;
  const hasMultipleImages = totalImages > 1;

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % uniqueImages.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + uniqueImages.length) % uniqueImages.length);

  useEffect(() => {
    if (uniqueImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % uniqueImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [uniqueImages.length]);

  // ✅ Seleccionar repositorio por defecto (el primero con stock > 0)
  useEffect(() => {
    if (repositorios.length > 0 && !selectedRepositorio) {
      const repoConStock = repositorios.find(r => r.stock > 0);
      setSelectedRepositorio(repoConStock || repositorios[0]);
    }
  }, [repositorios]);

  // ✅ FUNCIÓN PARA AGREGAR AL CARRITO
  const handleAgregar = async () => {
    if (!selectedRepositorio) {
      alert('No hay repositorios disponibles para este libro');
      return;
    }

    if (selectedRepositorio.stock === 0) {
      alert('Este repositorio no tiene stock disponible');
      return;
    }

    // Preparar el producto para el carrito
    const producto = {
      id_producto: libro.id_producto,
      nombre: libro.titulo_libro || libro.nombre,
      tipo_producto: libro.tipo_producto || 'libro',
      imagen_principal: libro.portada_libro || libro.imagen_principal,
      precio: libro.precio,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precioConDescuento,
      stock_total: libro.stock_total || 0,
      aplica_descuento: mostrarDescuento
    };

    // Agregar al carrito usando el context
    const result = await addToCart(producto, selectedRepositorio.id_repositorio, cantidad);
    
    if (result.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } else {
      alert(result.message || 'Error al agregar al carrito');
    }
  };

  // ✅ FUNCIÓN PARA COMPRAR AHORA
  const handleBuyNow = async () => {
    if (!selectedRepositorio) {
      alert('No hay repositorios disponibles para este libro');
      return;
    }

    if (selectedRepositorio.stock === 0) {
      alert('Este repositorio no tiene stock disponible');
      return;
    }

    const producto = {
      id_producto: libro.id_producto,
      nombre: libro.titulo_libro || libro.nombre,
      tipo_producto: libro.tipo_producto || 'libro',
      imagen_principal: libro.portada_libro || libro.imagen_principal,
      precio: libro.precio,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precioConDescuento,
      stock_total: libro.stock_total || 0,
      aplica_descuento: mostrarDescuento
    };

    // Agregar al carrito y redirigir al checkout
    const result = await addToCart(producto, selectedRepositorio.id_repositorio, cantidad);
    
    if (result.success) {
      window.location.href = '/checkout';
    } else {
      alert(result.message || 'Error al procesar la compra');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: libro.titulo_libro || libro.nombre,
        text: `Mira este libro: ${libro.titulo_libro || libro.nombre} - Bs. ${libro.precio}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  const openGoogleMapsUrl = (ubicacion_gps, direccion, nombre) => {
    if (ubicacion_gps) {
      return `https://www.google.com/maps?q=${ubicacion_gps}`;
    } else if (direccion) {
      return `https://www.google.com/maps/search/${encodeURIComponent(direccion + ' ' + nombre)}`;
    }
    return '#';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-500';
    if (stock < 10) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-500/20 text-red-500 border-red-500/30', icon: XCircleIcon };
    if (stock < 10) return { text: 'Ultimas unidades', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30', icon: SparklesIcon };
    return { text: 'Disponible', color: 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30', icon: CheckCircleIcon };
  };

  const stockBadge = getStockBadge(stock);
  const StockIcon = stockBadge.icon;
  
  // ✅ Verificar si el repositorio seleccionado tiene stock
  const repositorioConStock = selectedRepositorio && selectedRepositorio.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-white dark:bg-gray-950 font-body"
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
                  src={getImageUrl(uniqueImages[currentImageIndex]?.url) || 'https://placehold.co/600x800/1a2f3a/19ADA0?text=Sin+Portada'}
                  alt={libro.titulo_libro || libro.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x800/1a2f3a/19ADA0?text=Sin+Portada';
                  }}
                />
              </AnimatePresence>

              <div className="absolute top-4 left-4 z-10">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm flex items-center gap-1.5 ${stockBadge.color}`}>
                  <StockIcon className="w-3.5 h-3.5" />
                  {stockBadge.text}
                </span>
              </div>

              {mostrarDescuento && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    -{descuentoPorcentaje}%
                  </span>
                </div>
              )}

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
                  {uniqueImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentImageIndex ? 'bg-amber-400 w-6' : 'bg-white/40 hover:bg-white/60'
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
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-amber-500 shadow-lg shadow-amber-500/30 scale-105' 
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
                      <span className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                        Portada
                      </span>
                    )}
                    {idx === currentImageIndex && (
                      <div className="absolute inset-0 border-2 border-amber-500 rounded-lg pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Información y acciones ──────────────────────────── */}
          <div>
            {/* Categoría */}
            {libro.categoria_nombre && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{ background: `${P.turquesa}18`, color: P.turquesa }}
              >
                {libro.categoria_nombre}
              </span>
            )}

            {/* Título */}
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {libro.titulo_libro || libro.nombre}
            </h1>

            {/* Autor */}
            <div className="flex items-center gap-2 mt-2">
              <UserIcon className="w-4 h-4 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {libro.autor_nombre_completo || libro.autor_nombre || 'Autor desconocido'}
              </p>
            </div>

            {/* Precio con descuento */}
            <div className="mt-4">
              {mostrarDescuento ? (
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-bold" style={{ color: P.bosque }}>
                    Bs. {parseFloat(precioConDescuento).toFixed(2)}
                  </p>
                  <span className="text-sm line-through text-gray-400">
                    Bs. {parseFloat(libro.precio).toFixed(2)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: `${P.oro}20`, color: P.oro }}
                  >
                    -{descuentoPorcentaje}%
                  </span>
                </div>
              ) : (
                <p className="text-3xl font-bold" style={{ color: P.bosque }}>
                  Bs. {parseFloat(libro.precio).toFixed(2)}
                </p>
              )}
            </div>

            {/* Estado de stock general */}
            <div
              className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${
                stock > 0 
                  ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  : isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
              }`}
            >
              {stock > 0 ? (
                <CheckCircleIcon className="w-6 h-6 flex-shrink-0" style={{ color: P.bosque }} />
              ) : (
                <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-semibold ${stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stock > 0 ? 'Producto disponible' : 'Producto agotado'}
                </p>
                {stock > 0 && stock < 10 && (
                  <p className="text-xs mt-0.5 text-amber-500">
                    Solo quedan {stock} unidades
                  </p>
                )}
              </div>
            </div>

            {/* Metadatos del libro */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {libro.editorial && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <GlobeAltIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                    <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Editorial</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {libro.editorial}
                  </p>
                </div>
              )}
              {libro.anio_publicacion && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                    <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Año</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {libro.anio_publicacion}
                  </p>
                </div>
              )}
            </div>

            {(libro.isbn || libro.tema) && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {libro.isbn && (
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <TagIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                      <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ISBN</span>
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {libro.isbn}
                    </p>
                  </div>
                )}
                {libro.tema && (
                  <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                      <BookOpenIcon className="w-4 h-4" style={{ color: P.turquesa }} />
                      <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tema</span>
                    </div>
                    <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {libro.tema}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ✅ SELECCIONAR REPOSITORIO */}
            {repositorios.length > 0 && (
              <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-amber-500" />
                  {repositorios.length > 1 ? 'Selecciona tu tienda' : 'Tienda disponible'}
                </h3>
                
                {repositorios.length > 1 ? (
                  <div className="space-y-2">
                    {repositorios.map((repo) => {
                      const isSelected = selectedRepositorio?.id_repositorio === repo.id_repositorio;
                      const isAvailable = repo.stock > 0;
                      
                      return (
                        <button
                          key={repo.id_repositorio}
                          onClick={() => setSelectedRepositorio(repo)}
                          disabled={!isAvailable}
                          className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between
                            ${isSelected && isAvailable
                              ? isDark ? 'bg-amber-500/20 border-2 border-amber-500/50' : 'bg-amber-100 border-2 border-amber-500'
                              : isAvailable
                                ? isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'
                                : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <BuildingStorefrontIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                            <div>
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {repo.nombre}
                              </span>
                              {repo.sigla && (
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} ml-1`}>
                                  ({repo.sigla})
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isAvailable ? `${repo.stock} uds.` : 'Agotado'}
                            </span>
                            {isSelected && isAvailable && (
                              <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2">
                      <BuildingStorefrontIcon className="w-4 h-4 text-amber-500" />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {repositorios[0].nombre}
                      </span>
                    </div>
                    <span className={`text-xs font-bold ${repositorios[0].stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {repositorios[0].stock > 0 ? `${repositorios[0].stock} uds.` : 'Agotado'}
                    </span>
                  </div>
                )}
                
                {selectedRepositorio && selectedRepositorio.stock === 0 && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    <XCircleIcon className="w-3.5 h-3.5" />
                    La tienda seleccionada no tiene stock disponible
                  </p>
                )}
              </div>
            )}

            {/* Cantidad + acciones */}
            {stock > 0 && repositorioConStock && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl">
                  <button
                    onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-gray-800 dark:text-white">{cantidad}</span>
                  <button
                    onClick={() => setCantidad((c) => Math.min(selectedRepositorio?.stock || stock, c + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white"
                  >
                    +
                  </button>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Stock: {selectedRepositorio?.stock || 0} unidades
                </span>
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <button
                disabled={stock === 0 || !repositorioConStock}
                onClick={handleAgregar}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: added ? P.bosque : P.pizarra }}
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {added ? 'Agregado' : 'Agregar al carrito'}
              </button>
              <button
                disabled={stock === 0 || !repositorioConStock}
                onClick={handleBuyNow}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(135deg, ${P.turquesa}, ${P.bosque})` }}
              >
                <BoltIcon className="w-5 h-5" />
                Comprar ahora
              </button>
            </div>

            {/* Reseña */}
            {libro.reseña && (
              <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Reseña</h3>
                <ExpandableText 
                  text={libro.reseña}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}

            {/* Descripciones */}
            {libro.descripcion_general && (
              <div className={`mt-3 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Descripción</h3>
                <ExpandableText 
                  text={libro.descripcion_general}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}
            
            {libro.descripcion_especifica && (
              <div className={`mt-3 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Especificaciones</h3>
                <ExpandableText 
                  text={libro.descripcion_especifica}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}

            {/* Repositorios donde recoger - con mapa */}
            {repositorios.length > 0 && (
              <div className={`mt-3 p-5 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <BuildingStorefrontIcon className="w-5 h-5" style={{ color: P.turquesa }} />
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    Disponible en {repositorios.length} {repositorios.length === 1 ? 'tienda' : 'tiendas'}
                  </h3>
                </div>
                <div className="space-y-3">
                  {repositorios.map((repo, idx) => {
                    const stockColor = getStockColor(repo.stock);
                    const isAvailable = repo.stock > 0;
                    
                    return (
                      <div 
                        key={repo.id_repositorio || idx} 
                        className={`p-4 rounded-xl border transition-all ${
                          isDark 
                            ? 'bg-black/40 border-white/10 hover:border-amber-500/30' 
                            : 'bg-white border-gray-200 hover:border-amber-300'
                        } ${!isAvailable ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <BuildingStorefrontIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
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
                          <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
                            <div className="flex items-center gap-2">
                              {isAvailable ? (
                                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <XCircleIcon className="w-4 h-4 text-red-500" />
                              )}
                              <span className={`text-sm font-bold ${stockColor}`}>
                                {isAvailable ? `${repo.stock} uds.` : 'Agotado'}
                              </span>
                            </div>
                            {(repo.ubicacion_gps || repo.direccion) && (
                              <a
                                href={openGoogleMapsUrl(repo.ubicacion_gps, repo.direccion, repo.nombre)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                                  isDark 
                                    ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' 
                                    : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                                }`}
                              >
                                <MapPinIcon className="w-3.5 h-3.5" />
                                Ver mapa
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LibroDetalleScreen;