import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarIcon, 
  MapPinIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  TicketIcon,
  GlobeAltIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';
import EventoDetalle from './EventoDetalle';
import EventoModal from './EventoModal';

// Componente de Card (Grid) - Con clic en todo el card y botones fijos
const EventoCard = ({ evento, onEdit, onDelete, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const imagenUrl = getImageUrl(evento.imagen_portada);

  const handleMouseMove = (e) => {
    // Solo aplicar efecto si el mouse está sobre el contenedor principal
    // y no sobre los botones
    if (!cardRef.current) return;
    const target = e.target;
    // Evitar el efecto 3D si el mouse está sobre los botones o sus hijos
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
    // Evitar que el clic se propague si es sobre los botones
    if (e.target.closest('.action-button')) {
      return;
    }
    onView(evento);
  };

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactivo': return 'bg-red-500/20 text-red-400';
      case 'finalizado': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTipoColor = (tipo) => {
    switch(tipo) {
      case 'Visita Guiada': return 'from-blue-500 to-blue-600';
      case 'Taller': return 'from-purple-500 to-purple-600';
      case 'Concierto': return 'from-rose-500 to-rose-600';
      case 'Exposición': return 'from-amber-500 to-amber-600';
      case 'Feria': return 'from-emerald-500 to-emerald-600';
      default: return 'from-cyan-500 to-cyan-600';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  };

  const realizaciones = evento.realizaciones || [];
  
  // Calcular total de cupos disponibles (convertir a número)
  const totalCupos = realizaciones.reduce((total, r) => {
    const cupos = parseInt(r.cupos_disponibles);
    return total + (isNaN(cupos) ? 0 : cupos);
  }, 0);

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
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'} pointer-events-none`} />
        
        {/* Imagen */}
        <div className="relative w-full bg-gray-100 dark:bg-gray-800">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img 
              src={imagenUrl} 
              alt={evento.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Imagen';
              }}
            />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/30 to-transparent' : 'from-white via-white/30 to-transparent'} pointer-events-none`} />
          
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(evento.estado)} backdrop-blur-sm`}>
              {evento.estado === 'activo' ? '● Activo' : evento.estado === 'finalizado' ? '● Finalizado' : '● Inactivo'}
            </span>
          </div>
          
          <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getTipoColor(evento.tipo_evento)} text-white backdrop-blur-sm shadow-lg`}>
              {evento.tipo_evento}
            </span>
            {(evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0) && (
              <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg animate-pulse">
                🎉 GRATIS
              </span>
            )}
          </div>
          
          <div className="absolute bottom-4 right-4 z-10">
            {evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0 ? (
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg">
                🎉 GRATIS
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg">
                Bs. {evento.costo}
              </span>
            )}
          </div>
        </div>

        {/* Contenido del card */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-lg font-bold transition-colors line-clamp-2 ${isDark ? 'text-white group-hover:text-cyan-400' : 'text-gray-800 group-hover:text-cyan-600'}`}>
                {evento.titulo}
              </h3>
            </div>
          </div>
          
          <div className="space-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {realizaciones.map(r => formatDate(r.fecha)).join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {realizaciones.length} sede{realizaciones.length !== 1 ? 's' : ''}
              </span>
            </div>
            {evento.requiere_inscripcion && (
              <div className="flex items-center gap-2 text-sm">
                <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {totalCupos === 0
                    ? <span className="flex items-center gap-1"><SparklesIcon className="w-3 h-3 text-amber-400" /> EVENTO LIBRE</span>
                    : `Cupos: ${totalCupos} disponibles`}
                </span>
              </div>
            )}
          </div>
          
          <p className={`text-sm line-clamp-2 mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {evento.descripcion}
          </p>
          
          {/* Botones - con clase action-button */}
          <div className={`flex gap-2 mt-auto pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(evento);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <EyeIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(evento);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <PencilSquareIcon className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(evento);
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

// Componente de Lista - Con clic en todo el card y botones fijos
const EventoListItem = ({ evento, onEdit, onDelete, onView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const imagenUrl = getImageUrl(evento.imagen_portada);
  const realizaciones = evento.realizaciones || [];

  // Calcular total de cupos disponibles (convertir a número)
  const totalCupos = realizaciones.reduce((total, r) => {
    const cupos = parseInt(r.cupos_disponibles);
    return total + (isNaN(cupos) ? 0 : cupos);
  }, 0);

  const getStatusColor = (estado) => {
    switch(estado) {
      case 'activo': return 'bg-emerald-500/20 text-emerald-400';
      case 'inactivo': return 'bg-red-500/20 text-red-400';
      case 'finalizado': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });
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
    onView(evento);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Imagen */}
        <div className={`w-24 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 relative ${isDark ? 'bg-black/50 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}>
          <img 
            src={imagenUrl} 
            alt={evento.titulo} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/100x140/1a2f3a/19ADA0?text=No';
            }}
          />
          {(evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0) && (
            <div className="absolute top-1 right-1">
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-lg">
                GRATIS
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {evento.titulo}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(evento.estado)}`}>
              {evento.estado === 'activo' ? 'Activo' : evento.estado === 'finalizado' ? 'Finalizado' : 'Inactivo'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-400">
              {evento.tipo_evento}
            </span>
            {(evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0) && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">
                🎉 GRATIS
              </span>
            )}
          </div>
          <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {evento.descripcion}
          </p>
          
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {realizaciones.map(r => formatDate(r.fecha)).join(' · ')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {realizaciones.length} sede{realizaciones.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className={`w-4 h-4 ${evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0 ? 'text-emerald-400' : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`} />
              <span className={`text-sm font-semibold ${evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0 ? 'text-emerald-400' : (isDark ? 'text-cyan-400' : 'text-cyan-600')}`}>
                {evento.costo === 0 || evento.costo === '0' || parseFloat(evento.costo) === 0 ? 'GRATIS' : `Bs. ${evento.costo}`}
              </span>
            </div>
            {evento.requiere_inscripcion && (
              <div className="flex items-center gap-1">
                <UserGroupIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {totalCupos === 0 || isNaN(totalCupos)
                    ? <span className="flex items-center gap-1 text-amber-400"><SparklesIcon className="w-3 h-3" /> EVENTO LIBRE</span>
                    : `Cupos: ${totalCupos} disponibles`}
                </span>
              </div>
            )}
          </div>
          
          {realizaciones.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 Sedes:
              </p>
              <div className="flex flex-wrap gap-2">
                {realizaciones.map((real, idx) => (
                  <div key={idx} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                    ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <BuildingLibraryIcon className="w-3 h-3" />
                    <span>{real.repositorio_nombre || 'Sin sede'}</span>
                    {real.cupos_disponibles > 0 && (
                      <span className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>
                        ({real.cupos_disponibles} cupos)
                      </span>
                    )}
                    {(real.repositorio_ubicacion_gps || real.ubicacion_especifica) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openGoogleMaps(real.repositorio_ubicacion_gps, real.ubicacion_especifica);
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
        
        {/* Acciones - con clase action-button */}
        <div className="flex gap-2 flex-shrink-0 self-start">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onView(evento);
            }}
            className="action-button p-2 rounded-lg transition-colors hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}"
            title="Ver detalles"
          >
            <EyeIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(evento);
            }}
            className="action-button p-2 rounded-lg transition-colors hover:scale-110 active:scale-95 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}"
            title="Editar"
          >
            <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(evento);
            }}
            className="action-button p-2 rounded-lg hover:bg-red-500/10 transition-colors hover:scale-110 active:scale-95"
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente Hero (sin cambios)
const HeroSection = ({ onAdd, stats, userRol, viewMode, onViewModeChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-cyan-500/20 via-cyan-500/10 to-transparent' : 'from-cyan-400/30 via-cyan-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full">
              <CalendarIcon className={`w-12 h-12 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-cyan-400 to-white' : 'from-gray-800 via-cyan-600 to-gray-800'}`}>
            Eventos Culturales
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {userRol === 'responsable' 
              ? 'Gestiona los eventos de tu repositorio'
              : 'Gestiona todos los eventos de la Fundación Cultural BCB'}
          </p>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Eventos</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.tipos}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipos</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Evento
            </motion.button>
            
            <div className="flex gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en cuadrícula"
              >
                <Squares2X2Icon className={`w-5 h-5 ${viewMode === 'grid' ? 'text-cyan-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-cyan-500/20 border border-cyan-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en lista"
              >
                <ListBulletIcon className={`w-5 h-5 ${viewMode === 'list' ? 'text-cyan-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente Principal (sin cambios)
const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
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

  const fetchEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/eventos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setEventos(data.eventos || []);
      } else {
        showToast(data.message || 'Error al cargar eventos', 'error');
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const tipos = ['todos', ...new Set(eventos.map(e => e.tipo_evento).filter(Boolean))];

  const filteredEventos = eventos.filter(evento => {
    const matchesSearch = evento.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          evento.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || evento.estado === filterEstado;
    const matchesTipo = filterTipo === 'todos' || evento.tipo_evento === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  const stats = {
    total: eventos.length,
    tipos: tipos.length - 1,
  };

  const handleAdd = () => {
    setSelectedEvento(null);
    setIsModalOpen(true);
  };

  const handleEdit = (evento) => {
    setSelectedEvento(evento);
    setIsModalOpen(true);
  };

  const handleView = (evento) => {
    setSelectedEvento(evento);
    setIsDetailOpen(true);
  };

  const handleDelete = async (evento) => {
    if (!confirm(`¿Estás seguro de eliminar "${evento.titulo}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/eventos/${evento.id_evento}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Evento eliminado exitosamente', 'success');
        fetchEventos();
      } else {
        showToast(data.message || 'Error al eliminar evento', 'error');
      }
    } catch (error) {
      console.error('Error deleting evento:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/eventos`;
      let method = 'POST';
      
      if (selectedEvento) {
        url = `${API_URL}/api/eventos/${selectedEvento.id_evento}`;
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
          selectedEvento ? '✅ Evento actualizado exitosamente' : '✅ Evento creado exitosamente',
          'success'
        );
        setIsModalOpen(false);
        setSelectedEvento(null);
        fetchEventos();
      } else {
        showToast(data.message || 'Error al guardar evento', 'error');
      }
    } catch (error) {
      console.error('Error saving evento:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando eventos...</p>
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
                    placeholder="Buscar por título o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="finalizado">Finalizado</option>
                </select>
                <select
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  {tipos.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo === 'todos' ? 'Todos los tipos' : tipo}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredEventos.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{eventos.length}</span> eventos
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredEventos.map((evento) => (
                  <EventoCard
                    key={evento.id_evento}
                    evento={evento}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredEventos.map((evento) => (
                  <EventoListItem
                    key={evento.id_evento}
                    evento={evento}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <EventoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          evento={selectedEvento}
          isEditing={!!selectedEvento}
          userInfo={userInfo}
        />
      </div>

      {isDetailOpen && selectedEvento && (
        <EventoDetalle
          evento={selectedEvento}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEdit(selectedEvento);
          }}
          userInfo={userInfo}
        />
      )}
    </>
  );
};

export default Eventos;