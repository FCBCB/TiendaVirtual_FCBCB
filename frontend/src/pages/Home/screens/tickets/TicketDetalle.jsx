import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftIcon,
  TicketIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  GlobeAltIcon,
  HeartIcon,
  ShareIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PhotoIcon,
  EyeIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  TagIcon,
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
  crema: '#F5F0E8',
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

// ─── Mapa interactivo (iframe Google Maps) ──────────────────────────────
const MapaUbicacion = ({ ubicacionGps, direccion, nombre }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  let mapaUrl = '';
  if (ubicacionGps) {
    mapaUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${ubicacionGps}&zoom=15`;
  } else if (direccion) {
    mapaUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(direccion + ' ' + nombre)}&zoom=15`;
  }

  if (!mapaUrl) return null;

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800" style={{ height: '280px' }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cargando mapa...</p>
          </div>
        </div>
      )}
      <iframe
        src={mapaUrl}
        className="w-full h-full border-0"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`Ubicación de ${nombre}`}
        onLoad={() => setIsLoading(false)}
      />
      <div className="absolute bottom-3 left-3 right-3 flex justify-center">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion + ' ' + nombre)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl transition-shadow"
        >
          <MapPinIcon className="w-4 h-4 text-amber-500" />
          Abrir en Google Maps
        </a>
      </div>
    </div>
  );
};

// ─── Selector de cantidad ────────────────────────────────────────────────
const QuantitySelector = ({ quantity, setQuantity, maxStock, isDark }) => {
  const increment = () => {
    if (quantity < maxStock) setQuantity(quantity + 1);
  };

  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={decrement}
        disabled={quantity <= 1}
        className={`p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed
          ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
      >
        <MinusIcon className="w-5 h-5" />
      </button>
      <span className={`text-xl font-bold min-w-[40px] text-center ${isDark ? 'text-white' : 'text-gray-800'}`}>
        {quantity}
      </span>
      <button
        onClick={increment}
        disabled={quantity >= maxStock}
        className={`p-2 rounded-lg transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed
          ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
      >
        <PlusIcon className="w-5 h-5" />
      </button>
      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        (Max {maxStock})
      </span>
    </div>
  );
};

// ─── Badge de estado ─────────────────────────────────────────────────────
const EstadoBadge = ({ estado, isDark }) => {
  const getEstadoConfig = () => {
    const estados = {
      'disponible': { 
        icon: CheckCircleIcon, 
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        label: 'Disponible'
      },
      'proximamente': { 
        icon: ClockIcon, 
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        label: 'Próximamente'
      },
      'pasado': { 
        icon: XCircleIcon, 
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        label: 'Finalizado'
      },
      'cerrado_domingo': { 
        icon: ExclamationTriangleIcon, 
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: 'Cerrado (Domingo)'
      },
      'deshabilitado': {
        icon: XCircleIcon,
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: 'Venta Deshabilitada'
      }
    };
    return estados[estado] || estados['disponible'];
  };

  const config = getEstadoConfig();
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border backdrop-blur-sm ${config.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

// ─── Componente principal ────────────────────────────────────────────────
const TicketDetalleScreen = ({ ticket, repositorio, onBack, onAddToCart }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showFullMap, setShowFullMap] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // ─── Imágenes ──────────────────────────────────────────────────────────
  const allImages = [];
  
  // ✅ USAR SIEMPRE LA IMAGEN DEL REPOSITORIO (MUSEO)
  const imagenPrincipal = repositorio?.portada_representativa || ticket?.imagen_principal;
  
  if (imagenPrincipal) {
    allImages.push({ 
      url: imagenPrincipal, 
      isPrincipal: true,
      label: 'Portada'
    });
  }
  
  // Si hay imágenes adicionales del repositorio
  if (repositorio?.imagenes_adicionales?.length) {
    repositorio.imagenes_adicionales.forEach((img) => {
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
    }, 5000);
    return () => clearInterval(interval);
  }, [allImages.length]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${repositorio?.nombre || 'Museo'}`,
        text: `Visita el museo ${repositorio?.nombre}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShare(true);
      setTimeout(() => setShowShare(false), 2000);
    }
  };

  // ─── Datos del ticket ─────────────────────────────────────────────
  const tieneTicket = ticket !== null && ticket !== undefined;
  const disponible = tieneTicket ? ticket.venta_habilitada === true : false;
  const disponibilidadHoy = ticket?.disponibilidad_hoy || 'no_disponible';
  const precio = tieneTicket ? parseFloat(ticket.precio || 0).toFixed(2) : '0.00';
  const descuento = tieneTicket ? parseFloat(ticket.descuento || 0) : 0;
  const precioConDescuento = tieneTicket ? parseFloat(ticket.precio_con_descuento || ticket.precio || 0).toFixed(2) : '0.00';
  const stock = 100;
  const estadoEvento = tieneTicket ? 
    (disponibilidadHoy === 'cerrado_domingo' ? 'cerrado_domingo' : 
     disponible ? 'disponible' : 'deshabilitado') 
    : 'sin_ticket';
  
  const fechaEvento = ticket?.fecha_evento || new Date().toISOString().split('T')[0];
  const horaInicio = ticket?.hora_inicio || '08:30';
  const horaFin = ticket?.hora_fin || '16:30';
  const ubicacion = ticket?.ticket_ubicacion || repositorio?.direccion || '';

  // ─── Información del repositorio (museo) - SIEMPRE DEL REPOSITORIO ──
  const nombreMuseo = repositorio?.nombre || ticket?.nombre_repositorio || 'Museo';
  const siglaMuseo = repositorio?.sigla || ticket?.sigla || '';
  const direccionMuseo = repositorio?.direccion || ticket?.direccion || '';
  const telefonoMuseo = repositorio?.telefono || ticket?.telefono || '';
  const departamentoMuseo = repositorio?.departamento || ticket?.departamento || '';
  const ubicacionGps = repositorio?.ubicacion_gps || ticket?.ubicacion_gps || '';
  const logoMuseo = getImageUrl(repositorio?.logo_repositorio || ticket?.logo_repositorio);

  // ─── Verificar si el ticket está disponible para compra ──────────────
  const canBuy = tieneTicket && disponible && disponibilidadHoy !== 'cerrado_domingo';

  const handleAddToCart = () => {
    if (!canBuy) return;
    const precioFinal = descuento > 0 ? precioConDescuento : precio;
    onAddToCart({
      ticket,
      repositorio,
      quantity,
      total: (parseFloat(precioFinal) * quantity).toFixed(2),
      precioFinal: parseFloat(precioFinal)
    });
  };

  if (!tieneTicket) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <TicketIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Ticket no disponible</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Este museo no tiene tickets configurados actualmente</p>
          <button onClick={onBack} className="mt-4 px-6 py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-colors">
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen bg-white dark:bg-gray-950"
    >
      <div className="h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${AGUAYO_STRIPES.join(', ')})` }} />

      {/* ─── Header fijo ───────────────────────────────────────────────── */}
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
          {/* ── Galería ────────────────────────────────────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div 
              className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-lg group cursor-zoom-in"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: isZoomed ? 1.5 : 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  src={getImageUrl(allImages[currentImageIndex]?.url) || 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Imagen'}
                  alt={nombreMuseo}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Imagen';
                  }}
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                <EstadoBadge estado={estadoEvento} isDark={isDark} />
                {descuento > 0 && (
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/90 text-white backdrop-blur-sm border border-red-500/30">
                    -{descuento}% OFF
                  </span>
                )}
              </div>

              {/* Logo del museo */}
              {logoMuseo && (
                <div className="absolute top-4 right-4 z-10">
                  <div className={`w-14 h-14 rounded-xl backdrop-blur-md border-2 flex items-center justify-center shadow-xl
                    ${isDark ? 'bg-black/60 border-white/30' : 'bg-white/90 border-gray-300'}`}>
                    <img
                      src={logoMuseo}
                      alt={siglaMuseo}
                      className="w-10 h-10 object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                </div>
              )}

              {/* Precio flotante */}
              <div className="absolute bottom-4 right-4 z-10">
                <div className="flex flex-col items-end gap-1">
                  {descuento > 0 && (
                    <span className="text-sm line-through text-white/60 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                      Bs. {precio}
                    </span>
                  )}
                  <span className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                    Bs. {descuento > 0 ? precioConDescuento : precio}
                  </span>
                  {descuento > 0 && (
                    <span className="text-xs font-bold text-red-400 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                      -{descuento}% OFF
                    </span>
                  )}
                </div>
              </div>

              {hasMultipleImages && (
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
              )}

              <div className="absolute bottom-4 left-4 z-10 text-[10px] text-white/60 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">
                {isZoomed ? 'Alejar' : 'Acercar'}
              </div>
            </div>

            {/* Miniaturas */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {allImages.map((img, idx) => (
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

            {/* Estado de disponibilidad */}
            <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Estado: <strong className={isDark ? 'text-white' : 'text-gray-800'}>
                      {disponible && disponibilidadHoy !== 'cerrado_domingo' ? 'Disponible' : 'No disponible'}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {horaInicio} - {horaFin} hrs
                  </span>
                </div>
              </div>
              {disponibilidadHoy === 'cerrado_domingo' && (
                <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                  <ExclamationTriangleIcon className="w-3.5 h-3.5" />
                  Los museos están cerrados los domingos
                </div>
              )}
            </div>
          </div>

          {/* ── Información ───────────────────────────────────────────── */}
          <div>
            {/* Título y subtítulo */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white leading-tight">
                  {nombreMuseo}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <BuildingStorefrontIcon className="w-4 h-4 text-amber-500" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {siglaMuseo && `(${siglaMuseo})`} • Ticket de entrada
                  </p>
                </div>
              </div>
            </div>

            {/* Información del evento */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-amber-500" />
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fecha</span>
                </div>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {new Date(fechaEvento).toLocaleDateString('es-BO', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-amber-500" />
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Horario</span>
                </div>
                <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {horaInicio} - {horaFin} hrs
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lunes a Sábado</p>
              </div>
            </div>

            {/* Ubicación del museo */}
            {direccionMuseo && (
              <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <MapPinIcon className="w-5 h-5 text-amber-500" />
                  <span className={`text-xs uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación del Museo</span>
                </div>
                <div className="space-y-2">
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {direccionMuseo}
                  </p>
                  {departamentoMuseo && (
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {departamentoMuseo}
                    </p>
                  )}
                  {telefonoMuseo && (
                    <div className="flex items-center gap-2 mt-1">
                      <PhoneIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {telefonoMuseo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botón de mapa */}
                <button
                  onClick={() => setShowFullMap(!showFullMap)}
                  className={`mt-3 w-full py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] flex items-center justify-center gap-2
                    ${isDark ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400' : 'bg-amber-100 hover:bg-amber-200 text-amber-700'}`}
                >
                  <MapPinIcon className="w-4 h-4" />
                  {showFullMap ? 'Ocultar mapa' : 'Ver mapa de ubicación'}
                </button>

                {/* Mapa */}
                <AnimatePresence>
                  {showFullMap && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 overflow-hidden"
                    >
                      <MapaUbicacion 
                        ubicacionGps={ubicacionGps}
                        direccion={direccionMuseo}
                        nombre={nombreMuseo}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* ── Sección de compra ──────────────────────────────────── */}
            <div className={`mt-6 p-5 rounded-xl border-2 ${canBuy ? 'border-amber-500/30' : 'border-gray-300 dark:border-gray-700'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio unitario</span>
                  <div className="flex items-center gap-3">
                    {descuento > 0 ? (
                      <>
                        <span className="text-sm line-through text-gray-400 dark:text-gray-500">
                          Bs. {precio}
                        </span>
                        <p className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                          Bs. {precioConDescuento}
                        </p>
                        <span className="text-xs font-bold text-red-400">
                          -{descuento}% OFF
                        </span>
                      </>
                    ) : (
                      <p className={`text-2xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                        Bs. {precio}
                      </p>
                    )}
                  </div>
                </div>
                {canBuy && (
                  <div className="flex items-center gap-4">
                    <QuantitySelector 
                      quantity={quantity}
                      setQuantity={setQuantity}
                      maxStock={100}
                      isDark={isDark}
                    />
                  </div>
                )}
              </div>

              {canBuy && (
                <>
                  <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-white/10">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
                    <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Bs. {(parseFloat(descuento > 0 ? precioConDescuento : precio) * quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    Agregar al carrito
                  </button>

                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-3.5 h-3.5 text-green-500" />
                      Compra segura
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCardIcon className="w-3.5 h-3.5 text-amber-500" />
                      Pago online
                    </span>
                  </div>
                </>
              )}

              {!canBuy && (
                <div className="text-center py-3">
                  <ExclamationTriangleIcon className="w-8 h-8 mx-auto text-red-400 mb-2" />
                  <p className="text-sm font-medium text-red-400">
                    {estadoEvento === 'cerrado_domingo' && 'Los museos están cerrados los domingos'}
                    {estadoEvento === 'deshabilitado' && 'La venta de tickets no está habilitada'}
                    {estadoEvento === 'sin_ticket' && 'No hay tickets configurados'}
                    {!disponible && 'El ticket no está disponible actualmente'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketDetalleScreen;