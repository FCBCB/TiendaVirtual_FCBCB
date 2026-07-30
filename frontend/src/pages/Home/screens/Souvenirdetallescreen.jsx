import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
  BoltIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  ShareIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ScaleIcon,
  PhotoIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { getImageUrl } from '../../../components/config/api';
import { useTheme } from '../../../components/context/ThemeContext';
// ✅ IMPORTAR useCart
import { useCart } from '../../../components/context/CartContext';

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
const verificarDescuento = (producto) => {
  const porcentaje = parseFloat(producto.descuento_porcentaje) || 0;
  const precio = parseFloat(producto.precio) || 0;
  
  const fechaInicio = producto.fecha_inicio_descuento ? new Date(producto.fecha_inicio_descuento) : null;
  const fechaFin = producto.fecha_fin_descuento ? new Date(producto.fecha_fin_descuento) : null;
  const ahora = new Date();
  
  const tieneDescuento = porcentaje > 0 && 
    (fechaInicio === null || fechaInicio <= ahora) &&
    (fechaFin === null || fechaFin >= ahora);
  
  let precioConDesc = parseFloat(producto.precio_con_descuento);
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

const SouvenirDetalleScreen = ({ souvenir, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showShare, setShowShare] = useState(false);
  // ✅ Estado para repositorio seleccionado
  const [selectedRepositorio, setSelectedRepositorio] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // ✅ OBTENER FUNCIÓN PARA AGREGAR AL CARRITO
  const { addToCart } = useCart();

  // ─── Imágenes ──────────────────────────────────────────────────────────
  const allImages = [];
  
  if (souvenir.imagen_principal) {
    allImages.push({ 
      url: souvenir.imagen_principal, 
      isPrincipal: true,
      label: 'Principal'
    });
  }
  
  const imagenesAdicionales = souvenir.imagenes_adicionales || [];
  
  if (imagenesAdicionales.length > 0) {
    imagenesAdicionales.forEach((img) => {
      const imageUrl = img.imagen_url || img.url || img.url_imagen;
      if (imageUrl) {
        allImages.push({ 
          url: imageUrl, 
          isPrincipal: false,
          label: img.descripcion || img.label || `Imagen ${allImages.length + 1}`
        });
      }
    });
  }
  
  if (allImages.length === 0) {
    allImages.push({ 
      url: null, 
      isPrincipal: false, 
      label: 'Sin imagen' 
    });
  }

  const descuento = verificarDescuento(souvenir);
  const mostrarDescuento = descuento.tieneDescuento;
  const precioConDescuento = descuento.precioConDescuento;
  const descuentoPorcentaje = descuento.porcentaje;

  const stock = souvenir.stock_total || 0;
  const repositorios = souvenir.repositorios_disponibles || [];
  const totalImages = allImages.length;

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % allImages.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + allImages.length) % allImages.length);

  useEffect(() => {
    if (allImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [allImages.length]);

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
      alert('No hay repositorios disponibles para este producto');
      return;
    }

    if (selectedRepositorio.stock === 0) {
      alert('Este repositorio no tiene stock disponible');
      return;
    }

    // Preparar el producto para el carrito
    const producto = {
      id_producto: souvenir.id_producto,
      nombre: souvenir.nombre,
      tipo_producto: souvenir.tipo_producto || 'souvenir',
      imagen_principal: souvenir.imagen_principal,
      precio: souvenir.precio,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precioConDescuento,
      stock_total: souvenir.stock_total || 0,
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
      alert('No hay repositorios disponibles para este producto');
      return;
    }

    if (selectedRepositorio.stock === 0) {
      alert('Este repositorio no tiene stock disponible');
      return;
    }

    const producto = {
      id_producto: souvenir.id_producto,
      nombre: souvenir.nombre,
      tipo_producto: souvenir.tipo_producto || 'souvenir',
      imagen_principal: souvenir.imagen_principal,
      precio: souvenir.precio,
      descuento_porcentaje: descuentoPorcentaje,
      precio_con_descuento: precioConDescuento,
      stock_total: souvenir.stock_total || 0,
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
        title: souvenir.nombre,
        text: `Mira este souvenir: ${souvenir.nombre} - Bs. ${souvenir.precio}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
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

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 10) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return { text: 'Agotado', color: 'bg-red-500 text-white', icon: XCircleIcon };
    if (stock < 10) return { text: 'Ultimas unidades', color: 'bg-amber-500 text-white', icon: SparklesIcon };
    return { text: 'Disponible', color: 'bg-emerald-500 text-white', icon: CheckCircleIcon };
  };

  const stockBadge = getStockBadge(stock);
  const StockIcon = stockBadge.icon;

  const hasMultipleImages = totalImages > 1;
  const hasAdditionalImages = imagenesAdicionales.length > 0;
  
  // ✅ Verificar si el repositorio seleccionado tiene stock
  const repositorioConStock = selectedRepositorio && selectedRepositorio.stock > 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-white dark:bg-gray-950"
    >
      <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})` }} />

      <div className="sticky top-0 z-20 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── Galería ─────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-lg group cursor-zoom-in"
                 onClick={() => setIsZoomed(!isZoomed)}>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(allImages[currentImageIndex]?.url) || 'https://placehold.co/600x600/1a2f3a/19ADA0?text=Sin+Imagen'}
                  alt={souvenir.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x600/1a2f3a/19ADA0?text=Sin+Imagen';
                  }}
                />
              </AnimatePresence>

              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5 ${stockBadge.color}`}>
                  <StockIcon className="w-4 h-4" />
                  {stockBadge.text}
                </div>
                {mostrarDescuento && (
                  <div className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-white shadow-lg flex items-center gap-1">
                    <TagIcon className="w-3 h-3" />
                    -{descuentoPorcentaje}%
                  </div>
                )}
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
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-500/30">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex 
                        ? 'border-amber-500 shadow-lg shadow-amber-500/30 scale-105' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                  >
                    <img 
                      src={getImageUrl(img.url) || 'https://placehold.co/80x80/1a2f3a/19ADA0?text=No'} 
                      alt={img.label || `Imagen ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a2f3a/19ADA0?text=No'; }}
                    />
                    {img.isPrincipal && (
                      <span className="absolute top-0 right-0 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-bl-lg font-bold">
                        Principal
                      </span>
                    )}
                    {idx === currentImageIndex && (
                      <div className="absolute inset-0 border-2 border-amber-500 rounded-xl pointer-events-none" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {hasAdditionalImages && (
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <PhotoIcon className="w-4 h-4" />
                <span>{imagenesAdicionales.length} imagen(es) adicional(es)</span>
              </div>
            )}
          </div>

          {/* ── Información ──────────────────────────────────────────── */}
          <div className="space-y-5">
            {souvenir.tipo_souvenir && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${P.turquesa}18`, color: P.turquesa }}
              >
                {souvenir.tipo_souvenir}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
              {souvenir.nombre}
            </h1>

            <div className="flex items-center gap-3">
              {mostrarDescuento ? (
                <>
                  <p className="text-3xl font-bold" style={{ color: P.bosque }}>
                    Bs. {parseFloat(precioConDescuento).toFixed(2)}
                  </p>
                  <span className="text-sm line-through text-gray-400">
                    Bs. {parseFloat(souvenir.precio).toFixed(2)}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ background: `${P.oro}20`, color: P.oro }}
                  >
                    -{descuentoPorcentaje}%
                  </span>
                </>
              ) : (
                <p className="text-3xl font-bold" style={{ color: P.bosque }}>
                  Bs. {parseFloat(souvenir.precio).toFixed(2)}
                </p>
              )}
            </div>

            <div
              className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                stock > 0 
                  ? isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  : isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200'
              }`}
            >
              <div className={`p-2.5 rounded-full ${
                stock > 0 
                  ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                  : isDark ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                {stock > 0 ? (
                  <CheckCircleIcon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                ) : (
                  <XCircleIcon className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                )}
              </div>
              <div>
                <p className={`text-base font-bold ${
                  stock > 0 
                    ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                    : isDark ? 'text-red-400' : 'text-red-700'
                }`}>
                  {stock > 0 ? 'Producto disponible' : 'Producto agotado'}
                </p>
                {stock > 0 && stock < 10 && (
                  <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Solo quedan {stock} unidades
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {souvenir.material && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <CubeIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Material</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {souvenir.material}
                  </p>
                </div>
              )}
              {souvenir.dimensiones && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <ArrowsPointingOutIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dimensiones</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {souvenir.dimensiones}
                  </p>
                </div>
              )}
              {souvenir.peso && (
                <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center gap-1.5">
                    <ScaleIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Peso</span>
                  </div>
                  <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {souvenir.peso}g
                  </p>
                </div>
              )}
            </div>

            {/* ✅ SELECCIONAR REPOSITORIO */}
            {repositorios.length > 0 && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
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
              <div className="flex items-center gap-4">
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
                  Stock disponible: {selectedRepositorio?.stock || 0} unidades
                </span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
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

            {/* Descripciones */}
            {souvenir.descripcion_general && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Descripción</h3>
                <ExpandableText 
                  text={souvenir.descripcion_general}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}

            {souvenir.descripcion_especifica && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Detalles técnicos</h3>
                <ExpandableText 
                  text={souvenir.descripcion_especifica}
                  className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                />
              </div>
            )}

            {/* Repositorios */}
            {repositorios.length > 0 && (
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">
                  Disponible en {repositorios.length} {repositorios.length === 1 ? 'tienda' : 'tiendas'}
                </h3>
                <div className="space-y-2">
                  {repositorios.map((repo, idx) => (
                    <div 
                      key={repo.id_repositorio || idx} 
                      className={`p-3 rounded-lg border transition-all ${
                        isDark 
                          ? 'bg-black/40 border-white/10 hover:border-amber-500/30' 
                          : 'bg-white border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <BuildingStorefrontIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {repo.nombre}
                            </span>
                            {repo.sigla && (
                              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                ({repo.sigla})
                              </span>
                            )}
                          </div>
                          {repo.direccion && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPinIcon className={`w-3 h-3 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <span className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {repo.direccion}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1.5">
                            <ShoppingCartIcon className={`w-4 h-4 ${getStockColor(repo.stock)}`} />
                            <span className={`text-sm font-bold ${getStockColor(repo.stock)}`}>
                              {repo.stock} uds.
                            </span>
                          </div>
                          {(repo.ubicacion_gps || repo.direccion) && (
                            <button
                              onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion, repo.nombre)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 ${
                                isDark 
                                  ? 'bg-teal-500/20 hover:bg-teal-500/30 text-teal-400' 
                                  : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                              }`}
                            >
                              <MapPinIcon className="w-3.5 h-3.5" />
                              Mapa
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SouvenirDetalleScreen;