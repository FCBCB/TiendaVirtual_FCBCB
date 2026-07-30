import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpenIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';
import LibroDetalle from './LibroDetalles';
import LibroModal from './LibroModal';
import DescuentoModal from './DescuentoModal';

// ✅ HELPER PARA VERIFICAR DESCUENTO (CORREGIDO - calcula en tiempo real)
const verificarDescuento = (libro) => {
  // Si aplica_descuento es true O si hay porcentaje y las fechas son válidas
  const porcentaje = parseFloat(libro.descuento_porcentaje) || 0;
  const precio = parseFloat(libro.precio) || 0;
  
  // Verificar fechas en el frontend también
  const fechaInicio = libro.fecha_inicio_descuento ? new Date(libro.fecha_inicio_descuento) : null;
  const fechaFin = libro.fecha_fin_descuento ? new Date(libro.fecha_fin_descuento) : null;
  const ahora = new Date();
  
  // Calcular si tiene descuento activo (independientemente de lo que diga aplica_descuento)
  const tieneDescuento = porcentaje > 0 && 
    (fechaInicio === null || fechaInicio <= ahora) &&
    (fechaFin === null || fechaFin >= ahora);
  
  // Usar precio_con_descuento del backend o calcularlo
  let precioConDesc = parseFloat(libro.precio_con_descuento);
  if (isNaN(precioConDesc) || precioConDesc <= 0) {
    precioConDesc = precio - (precio * porcentaje / 100);
  }
  
  return {
    tieneDescuento: tieneDescuento, // ✅ CALCULADO EN EL FRONTEND
    porcentaje: porcentaje,
    precio: precio,
    precioConDescuento: precioConDesc
  };
};

// Componente de Card (Grid)
const LibroCard = ({ libro, onEdit, onDelete, onView, onToggleDescuento }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const portadaUrl = getImageUrl(libro.portada_libro || libro.imagen_principal);

  // ✅ USAR HELPER
  const descuento = verificarDescuento(libro);
  const mostrarDescuento = descuento.tieneDescuento;
  const precioConDescuento = descuento.precioConDescuento;
  const descuentoPorcentaje = descuento.porcentaje;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const target = e.target;
    if (target.closest('.action-button')) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    setIsHovered(false);
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    onView(libro);
  };

  const getStatusColor = (activo) => {
    return activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 20) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      className="relative group h-full cursor-pointer"
      style={{ transition: 'transform 0.1s ease-out' }}
    >
      <div className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 flex flex-col h-full
        ${isDark 
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-white/10' 
          : 'bg-gradient-to-br from-white/90 to-gray-100/90 border-gray-200'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'} pointer-events-none`} />
        
        <div className="relative w-full bg-gray-100 dark:bg-gray-800">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img 
              src={portadaUrl} 
              alt={libro.titulo_libro || libro.nombre}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Portada';
              }}
            />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/30 to-transparent' : 'from-white via-white/30 to-transparent'} pointer-events-none`} />
          
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(libro.activo)} backdrop-blur-sm`}>
              {libro.activo ? '● Activo' : '● Inactivo'}
            </span>
          </div>
          
          <div className="absolute bottom-4 right-4 z-10">
            {mostrarDescuento ? (
              <div className="flex flex-col items-end gap-0.5">
                <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                  Bs. {parseFloat(precioConDescuento).toFixed(2)}
                </span>
                <span className="text-xs line-through text-white/60 bg-black/40 px-2 py-0.5 rounded-full">
                  Bs. {parseFloat(libro.precio).toFixed(2)}
                </span>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                  -{descuentoPorcentaje}%
                </span>
              </div>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                Bs. {parseFloat(libro.precio).toFixed(2)}
              </span>
            )}
          </div>
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-colors line-clamp-2 ${isDark ? 'text-white group-hover:text-blue-400' : 'text-gray-800 group-hover:text-blue-600'}`}>
                {libro.titulo_libro || libro.nombre}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <UserIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {libro.autor_nombre_completo || libro.autor_nombre || 'Autor desconocido'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm ${getStockColor(libro.stock_total || 0)}`}>
              <TagIcon className="w-4 h-4" />
              <span className="font-semibold">Stock: {libro.stock_total || 0} unidades</span>
            </div>
            {libro.anio_publicacion && (
              <div className="flex items-center gap-1">
                <CalendarIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {libro.anio_publicacion}
                </span>
              </div>
            )}
          </div>
          
          {libro.editorial && (
            <div className="mt-2">
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Editorial: {libro.editorial}
              </p>
            </div>
          )}
          
          <div className={`flex gap-2 mt-auto pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(libro);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <EyeIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(libro);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <PencilSquareIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDescuento(libro);
              }}
              className={`action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${mostrarDescuento 
                  ? 'bg-amber-500/20 hover:bg-amber-500/30' 
                  : 'bg-amber-500/10 hover:bg-amber-500/20'}`}
              title={mostrarDescuento ? `Descuento ${descuentoPorcentaje}%` : 'Aplicar descuento'}
            >
              <TagIcon className={`w-4 h-4 ${mostrarDescuento ? 'text-amber-400' : 'text-amber-400/70'}`} />
              <span className={`text-sm ${mostrarDescuento ? 'text-amber-400' : 'text-amber-400/70'}`}>
                {mostrarDescuento ? `-${descuentoPorcentaje}%` : 'Dcto'}
              </span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(libro);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <TrashIcon className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Lista
const LibroListItem = ({ libro, onEdit, onDelete, onView, onToggleDescuento }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(libro.portada_libro || libro.imagen_principal);
  const repositorios = libro.repositorios_disponibles || [];

  const getStatusColor = (activo) => {
    return activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 20) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button')) {
      return;
    }
    onView(libro);
  };

  // ✅ USAR HELPER
  const descuento = verificarDescuento(libro);
  const mostrarDescuento = descuento.tieneDescuento;
  const precioConDescuento = descuento.precioConDescuento;
  const descuentoPorcentaje = descuento.porcentaje;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        <div className={`w-24 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-black/50 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}>
          <img 
            src={portadaUrl} 
            alt={libro.titulo_libro || libro.nombre} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/100x140/1a2f3a/19ADA0?text=No';
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {libro.titulo_libro || libro.nombre}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(libro.activo)}`}>
              {libro.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <UserIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {libro.autor_nombre_completo || libro.autor_nombre || 'Autor desconocido'}
            </p>
          </div>
          <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {libro.reseña}
          </p>
          
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {libro.editorial && (
              <div className="flex items-center gap-1">
                <GlobeAltIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {libro.editorial}
                </span>
              </div>
            )}
            {libro.anio_publicacion && (
              <div className="flex items-center gap-1">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {libro.anio_publicacion}
                </span>
              </div>
            )}
            {libro.isbn && (
              <div className="flex items-center gap-1">
                <TagIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  ISBN: {libro.isbn}
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              {mostrarDescuento ? (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Bs. {parseFloat(precioConDescuento).toFixed(2)}
                  </span>
                  <span className={`text-xs line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Bs. {parseFloat(libro.precio).toFixed(2)}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500`}>
                    -{descuentoPorcentaje}%
                  </span>
                </div>
              ) : (
                <span className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  Bs. {parseFloat(libro.precio).toFixed(2)}
                </span>
              )}
            </div>
            
            <div className={`flex items-center gap-1 ${getStockColor(libro.stock_total || 0)}`}>
              <TagIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Stock: {libro.stock_total || 0}</span>
            </div>
          </div>
          
          {repositorios.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 Disponible en:
              </p>
              <div className="flex flex-wrap gap-2">
                {repositorios.map((repo) => (
                  <div key={repo.id_repositorio} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                    ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <BuildingLibraryIcon className="w-3 h-3" />
                    <span>{repo.nombre}</span>
                    <span className={getStockColor(repo.stock)}>({repo.stock})</span>
                    {(repo.ubicacion_gps || repo.direccion) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMaps(repo.ubicacion_gps, repo.direccion);
                        }}
                        className="ml-1 text-teal-500 hover:text-teal-400"
                        title="Ver en mapa"
                      >
                        <MapPinIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 flex-shrink-0 self-start">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onView(libro);
            }}
            className="action-button p-2 rounded-lg transition-colors hover:scale-110 active:scale-95"
          >
            <EyeIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(libro);
            }}
            className="action-button p-2 rounded-lg transition-colors hover:scale-110 active:scale-95"
          >
            <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleDescuento(libro);
            }}
            className={`action-button p-2 rounded-lg transition-colors hover:scale-110 active:scale-95 ${
              mostrarDescuento ? 'bg-amber-500/20 hover:bg-amber-500/30' : 'hover:bg-amber-500/10'
            }`}
            title={mostrarDescuento ? `Descuento ${descuentoPorcentaje}%` : 'Aplicar descuento'}
          >
            <TagIcon className={`w-5 h-5 ${mostrarDescuento ? 'text-amber-400' : 'text-gray-400'}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(libro);
            }}
            className="action-button p-2 rounded-lg hover:bg-red-500/10 transition-colors hover:scale-110 active:scale-95"
          >
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// HeroSection
const HeroSection = ({ onAdd, stats, userRol, viewMode, onViewModeChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-blue-500/20 via-blue-500/10 to-transparent' : 'from-blue-400/30 via-blue-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full">
              <BookOpenIcon className={`w-12 h-12 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-blue-400 to-white' : 'from-gray-800 via-blue-600 to-gray-800'}`}>
            Biblioteca Digital
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {userRol === 'responsable' 
              ? 'Gestiona los libros de tu repositorio'
              : 'Gestiona todos los libros de la Fundación Cultural BCB'}
          </p>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Libros</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Libro
            </motion.button>
            
            <div className="flex gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-blue-500/20 border border-blue-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en cuadrícula"
              >
                <Squares2X2Icon className={`w-5 h-5 ${viewMode === 'grid' ? 'text-blue-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-blue-500/20 border border-blue-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en lista"
              >
                <ListBulletIcon className={`w-5 h-5 ${viewMode === 'list' ? 'text-blue-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente Principal
const Libros = () => {
  const [libros, setLibros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDescuentoModalOpen, setIsDescuentoModalOpen] = useState(false);
  const [selectedLibro, setSelectedLibro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [userInfo, setUserInfo] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const getUserInfo = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserInfo({
            id: payload.id,
            rol: payload.rol,
            id_repositorio_asignado: payload.id_repositorio_asignado
          });
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    };
    getUserInfo();
  }, []);

  const fetchLibros = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/libros`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        const librosData = data.libros || [];
        setLibros(librosData);
        
        // ✅ ACTUALIZAR selectedLibro SI ESTÁ ABIERTO
        if (selectedLibro) {
          const libroActualizado = librosData.find(l => l.id_producto === selectedLibro.id_producto);
          if (libroActualizado) {
            setSelectedLibro(libroActualizado);
          }
        }
      } else {
        showToast(data.message || 'Error al cargar libros', 'error');
      }
    } catch (error) {
      console.error('Error fetching libros:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibros();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const filteredLibros = libros.filter(libro => {
    const search = searchTerm.toLowerCase();
    return (
      (libro.titulo_libro?.toLowerCase().includes(search) ||
       libro.nombre?.toLowerCase().includes(search) ||
       libro.autor_nombre_completo?.toLowerCase().includes(search) ||
       libro.autor_nombre?.toLowerCase().includes(search) ||
       libro.reseña?.toLowerCase().includes(search))
    );
  });

  const stats = {
    total: libros.length,
  };

  const handleToggleDescuento = (libro) => {
    setSelectedLibro(libro);
    setIsDescuentoModalOpen(true);
  };

  const handleAplicarDescuento = async (id, data) => {
    try {
      const token = localStorage.getItem('token');
      
      const payload = {
        descuento_porcentaje: parseFloat(data.descuento_porcentaje) || 0,
        fecha_inicio: data.fecha_inicio || null,
        fecha_fin: data.fecha_fin || null,
        tipo_descuento: data.tipo_descuento || 'normal',
        motivo: data.motivo || 'Aplicación de descuento'
      };
      
      const response = await fetch(`${API_URL}/api/libros/${id}/descuento`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('✅ Descuento aplicado exitosamente', 'success');
        setIsDescuentoModalOpen(false);
        
        // ✅ RECARGAR Y ACTUALIZAR selectedLibro
        await fetchLibros();
        
        // ✅ CERRAR EL MODAL DE DESCUENTO
        setSelectedLibro(null);
        
        return result;
      } else {
        showToast(result.message || 'Error al aplicar descuento', 'error');
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error aplicar descuento:', error);
      showToast(error.message || 'Error de conexión', 'error');
      throw error;
    }
  };

  const handleEliminarDescuento = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/libros/${id}/descuento`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        showToast('✅ Descuento eliminado', 'success');
        setIsDescuentoModalOpen(false);
        
        // ✅ RECARGAR Y ACTUALIZAR selectedLibro
        await fetchLibros();
        
        // ✅ CERRAR EL MODAL DE DESCUENTO
        setSelectedLibro(null);
      } else {
        const data = await response.json();
        showToast(data.message || 'Error al eliminar descuento', 'error');
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error eliminar descuento:', error);
      showToast('Error de conexión', 'error');
      throw error;
    }
  };

  const handleAdd = () => {
    setSelectedLibro(null);
    setIsModalOpen(true);
  };

  const handleEdit = (libro) => {
    setSelectedLibro(libro);
    setIsModalOpen(true);
  };

  const handleView = (libro) => {
    setSelectedLibro(libro);
    setIsDetailOpen(true);
  };

  const handleDelete = async (libro) => {
    if (!confirm(`¿Estás seguro de eliminar "${libro.titulo_libro || libro.nombre}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/libros/${libro.id_producto}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Libro eliminado exitosamente', 'success');
        await fetchLibros();
      } else {
        showToast(data.message || 'Error al eliminar libro', 'error');
      }
    } catch (error) {
      console.error('Error deleting libro:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/libros`;
      let method = 'POST';
      
      if (selectedLibro) {
        url = `${API_URL}/api/libros/${selectedLibro.id_producto}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(
          selectedLibro ? '✅ Libro actualizado exitosamente' : '✅ Libro creado exitosamente',
          'success'
        );
        setIsModalOpen(false);
        setSelectedLibro(null);
        await fetchLibros();
      } else {
        showToast(data.message || 'Error al guardar libro', 'error');
      }
    } catch (error) {
      console.error('Error saving libro:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando libros...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 backdrop-blur-sm text-white border-green-400' 
            : 'bg-red-500/90 backdrop-blur-sm text-white border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <HeroSection 
            onAdd={handleAdd} 
            stats={stats} 
            userRol={userInfo?.rol}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Buscar por título, autor o reseña..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredLibros.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{libros.length}</span> libros
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredLibros.map((libro) => (
                  <LibroCard
                    key={libro.id_producto}
                    libro={libro}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onToggleDescuento={handleToggleDescuento}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredLibros.map((libro) => (
                  <LibroListItem
                    key={libro.id_producto}
                    libro={libro}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    onToggleDescuento={handleToggleDescuento}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {isDescuentoModalOpen && selectedLibro && (
          <DescuentoModal
            isOpen={isDescuentoModalOpen}
            onClose={() => setIsDescuentoModalOpen(false)}
            libro={selectedLibro}
            onApply={handleAplicarDescuento}
            onRemove={handleEliminarDescuento}
          />
        )}

        <LibroModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          libro={selectedLibro}
          isEditing={!!selectedLibro}
          userInfo={userInfo}
        />
      </div>

      {isDetailOpen && selectedLibro && (
        <LibroDetalle
          libro={selectedLibro}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEdit(selectedLibro);
          }}
          userInfo={userInfo}
        />
      )}
    </>
  );
};

export default Libros;