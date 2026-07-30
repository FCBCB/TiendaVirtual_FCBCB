import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TicketIcon,
  MapPinIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  PowerIcon,
  BuildingLibraryIcon,
  PhoneIcon,
  UserIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

// ─── Card de Repositorio con Ticket ──────────────────────────────────────
const RepositorioCard = ({ repositorio, ticket, onToggleVenta, onUpdatePrecio, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const imageUrl = getImageUrl(repositorio.portada_representativa);
  const logoUrl = getImageUrl(repositorio.logo_repositorio);

  // Si no hay ticket, mostramos el repositorio sin ticket
  const tieneTicket = ticket !== null && ticket !== undefined;
  const disponible = tieneTicket ? ticket.venta_habilitada === true : false;
  const precio = tieneTicket ? parseFloat(ticket.precio || 0).toFixed(2) : '0.00';
  const descuento = tieneTicket ? parseFloat(ticket.descuento || 0) : 0;
  const precioConDescuento = tieneTicket ? parseFloat(ticket.precio_con_descuento || ticket.precio || 0).toFixed(2) : '0.00';
  const estadoTicket = ticket?.estado_ticket || 'sin_ticket';
  const disponibilidadHoy = ticket?.disponibilidad_hoy || 'no_disponible';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    setIsHovered(false);
  };

  // Horario fijo del museo
  const horarioApertura = '08:30';
  const horarioCierre = '16:30';

  // Estado del ticket para mostrar
  const getEstadoInfo = () => {
    if (!tieneTicket) {
      return { texto: 'Sin ticket', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }
    if (disponibilidadHoy === 'cerrado_domingo') {
      return { texto: '🔴 Cerrado (Domingo)', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    }
    if (disponible) {
      return { texto: '🟢 Venta Activa', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    return { texto: '🔴 Venta Inactiva', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const estadoInfo = getEstadoInfo();

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group"
      style={{ transition: 'transform 0.1s ease-out' }}
    >
      <div className={`relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300
        ${isDark ? 'bg-gray-900 border border-white/20' : 'bg-white border border-gray-200'}`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 pointer-events-none ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} />
        
        {/* Header del Repositorio */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={imageUrl || 'https://placehold.co/600x400/1a2f3a/19ADA0?text=Sin+Imagen'}
            alt={repositorio.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = 'https://placehold.co/600x400/1a2f3a/19ADA0?text=Sin+Imagen'; }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/40 to-transparent' : 'from-gray-900/60 via-gray-900/20 to-transparent'}`} />
          
          <div className="absolute top-4 left-4">
            <div className={`w-16 h-16 rounded-xl backdrop-blur-md border-2 flex items-center justify-center shadow-xl
              ${isDark ? 'bg-black/60 border-white/30' : 'bg-white/90 border-gray-300'}`}>
              <img
                src={logoUrl || `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`}
                alt={repositorio.sigla}
                className="w-12 h-12 object-contain"
                onError={(e) => { e.target.src = `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`; }}
              />
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border
              ${repositorio.activo ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
              {repositorio.activo ? '🟢 Activo' : '🔴 Inactivo'}
            </span>
            {tieneTicket && (
              <span 
                onClick={() => onToggleVenta(ticket)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border cursor-pointer transition-all hover:scale-105 ${estadoInfo.color}`}
              >
                {estadoInfo.texto}
              </span>
            )}
          </div>

          <div className="absolute bottom-4 right-4">
            <div className="flex flex-col items-end gap-1">
              {descuento > 0 ? (
                <>
                  <span className="text-sm line-through text-white/60 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                    Bs. {precio}
                  </span>
                  <span className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                    Bs. {precioConDescuento}
                  </span>
                  <span className="text-xs font-bold text-red-400 bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    -{descuento}% OFF
                  </span>
                </>
              ) : (
                <span className="px-4 py-2 rounded-full text-lg font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                  Bs. {precio}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info del Repositorio */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-colors ${isDark ? 'text-white group-hover:text-amber-400' : 'text-gray-800 group-hover:text-amber-600'}`}>
                {repositorio.nombre}
              </h3>
              <p className={`text-sm font-mono ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{repositorio.sigla}</p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <MapPinIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span className="truncate">{repositorio.direccion}</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <PhoneIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>{repositorio.telefono || 'No disponible'}</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <ClockIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span className="font-medium">{horarioApertura} - {horarioCierre} hrs</span>
              <span className="text-xs text-gray-400">(Lunes a Sábado)</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <BuildingStorefrontIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>{repositorio.departamento || 'Departamento no especificado'}</span>
            </div>
          </div>

          {/* Estado del Ticket */}
          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TicketIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {tieneTicket ? 'Ticket configurado' : 'Sin ticket configurado'}
                </span>
              </div>
              {tieneTicket && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-full
                  ${disponible && disponibilidadHoy !== 'cerrado_domingo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {disponible && disponibilidadHoy !== 'cerrado_domingo' ? 'Disponible' : 'No disponible'}
                </span>
              )}
            </div>
            {tieneTicket && disponibilidadHoy === 'cerrado_domingo' && (
              <div className="mt-2 text-xs text-red-400 flex items-center gap-1">
                <ExclamationTriangleIcon className="w-3 h-3" />
                Cerrado los domingos
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            {tieneTicket ? (
              <>
                <button 
                  onClick={() => onView(ticket)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105
                    ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <EyeIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver Detalles</span>
                </button>
                <button 
                  onClick={() => onUpdatePrecio(ticket)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105
                    ${isDark ? 'bg-amber-500/20 hover:bg-amber-500/30' : 'bg-amber-50 hover:bg-amber-100'}`}
                >
                  <CurrencyDollarIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Modificar Precio
                  </span>
                </button>
                <button 
                  onClick={() => onToggleVenta(ticket)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105
                    ${disponible ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-emerald-500/20 hover:bg-emerald-500/30'}`}
                >
                  <PowerIcon className={`w-4 h-4 ${disponible ? 'text-red-400' : 'text-emerald-400'}`} />
                  <span className={`text-sm font-medium ${disponible ? 'text-red-400' : 'text-emerald-400'}`}>
                    {disponible ? 'Deshabilitar Venta' : 'Habilitar Venta'}
                  </span>
                </button>
              </>
            ) : (
              <button 
                onClick={() => onUpdatePrecio(null)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105
                  ${isDark ? 'bg-amber-500/20 hover:bg-amber-500/30' : 'bg-amber-50 hover:bg-amber-100'}`}
              >
                <PlusIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Configurar Ticket
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Modal de Precio ──────────────────────────────────────────────────────
const PrecioModal = ({ isOpen, onClose, onSave, ticket, repositorio }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [precio, setPrecio] = useState('');
  const [descuento, setDescuento] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setPrecio(ticket.precio || '');
      setDescuento(ticket.descuento || '');
    } else {
      setPrecio('');
      setDescuento('');
    }
  }, [ticket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave({ 
      precio: parseFloat(precio), 
      descuento: parseFloat(descuento) || 0,
      repositorioId: repositorio?.id_repositorio
    });
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border z-[10000]
              ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-6 border-b
              ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl">
                  <CurrencyDollarIcon className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {ticket ? 'Modificar Precio' : 'Configurar Ticket'}
                </h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Repositorio/Museo
                </label>
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {repositorio?.nombre || 'No especificado'}
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Precio del Ticket (Bs.)
                </label>
                <input
                  type="number"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                  step="0.01"
                  min="0"
                  required
                  placeholder="Ej: 25.00"
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                    ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Precio del ticket de entrada al museo</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  % Descuento (opcional)
                </label>
                <input
                  type="number"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                    ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Dejar en 0 para sin descuento</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Horario del museo: <strong>08:30 - 16:30 hrs</strong> (Lunes a Sábado)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm mt-1">
                  <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <strong>Domingos cerrado</strong>
                  </span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading || !precio}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50">
                  {loading ? 'Guardando...' : (ticket ? 'Actualizar Precio' : 'Crear Ticket')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Modal de Detalle ──────────────────────────────────────────────────────
const DetalleModal = ({ ticket, repositorio, onClose, onEdit }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const imageUrl = getImageUrl(repositorio?.portada_representativa);
  const disponible = ticket?.venta_habilitada === true;
  const descuento = ticket?.descuento || 0;
  const precio = ticket?.precio || 0;
  const precioConDescuento = ticket?.precio_con_descuento || precio;

  const getEstadoInfo = () => {
    if (!ticket) {
      return { texto: 'Sin ticket', color: 'bg-gray-500/20 text-gray-400' };
    }
    if (ticket.disponibilidad_hoy === 'cerrado_domingo') {
      return { texto: 'Cerrado (Domingo)', color: 'bg-red-500/20 text-red-400' };
    }
    if (disponible) {
      return { texto: 'Venta Activa', color: 'bg-emerald-500/20 text-emerald-400' };
    }
    return { texto: 'Venta Inactiva', color: 'bg-red-500/20 text-red-400' };
  };

  const estadoInfo = getEstadoInfo();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
          className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000]
            ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`sticky top-0 flex items-center justify-between p-6 border-b z-10
            ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl">
                <BuildingLibraryIcon className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Detalles del Museo
              </h2>
            </div>
            <div className="flex gap-2">
              {ticket && (
                <button onClick={() => { onEdit(); onClose(); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                  <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </button>
              )}
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img src={imageUrl || 'https://placehold.co/800x400/1a2f3a/19ADA0?text=No+Image'} 
                alt={repositorio?.nombre} className="w-full h-56 object-cover" />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm ${estadoInfo.color}`}>
                  {estadoInfo.texto}
                </span>
              </div>
            </div>

            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {repositorio?.nombre}
            </h3>
            <p className={`text-sm font-mono mt-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              {repositorio?.sigla}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Dirección</p>
                <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {repositorio?.direccion || 'No especificada'}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Teléfono</p>
                <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {repositorio?.telefono || 'No disponible'}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Horario</p>
                <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  08:30 - 16:30 hrs
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Lunes a Sábado</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Departamento</p>
                <p className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {repositorio?.departamento || 'No especificado'}
                </p>
              </div>
            </div>

            {ticket && (
              <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <h4 className={`text-sm font-semibold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Información del Ticket
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio</p>
                    <p className={`text-xl font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Bs. {parseFloat(precio).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Estado</p>
                    <p className={`text-lg font-bold ${disponible ? 'text-emerald-400' : 'text-red-400'}`}>
                      {disponible ? 'Disponible' : 'No disponible'}
                    </p>
                  </div>
                  {descuento > 0 && (
                    <div className="col-span-2">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Descuento</p>
                      <p className={`text-lg font-bold text-red-400`}>
                        {descuento}% OFF - Bs. {parseFloat(precioConDescuento).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ─── Componente Principal ────────────────────────────────────────────────
const Tickets = () => {
  const [repositorios, setRepositorios] = useState([]);
  const [ticketsMap, setTicketsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isPrecioModalOpen, setIsPrecioModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedRepositorio, setSelectedRepositorio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener todos los repositorios
      const reposResponse = await fetch(`${API_URL}/api/repositorios/admin/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const reposData = await reposResponse.json();
      
      if (!reposResponse.ok) {
        showToast(reposData.message || 'Error al cargar repositorios', 'error');
        return;
      }
      
      const repos = reposData.repositorios || [];
      
      // ✅ NUEVO ENDPOINT: Obtener tickets por museo
      const ticketsResponse = await fetch(`${API_URL}/api/tickets/museos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ticketsData = await ticketsResponse.json();
      
      if (!ticketsResponse.ok) {
        showToast(ticketsData.message || 'Error al cargar tickets', 'error');
        return;
      }
      
      const tickets = ticketsData.tickets || [];
      
      // Crear un mapa de tickets por repositorio
      const map = {};
      tickets.forEach(ticket => {
        if (ticket.id_repositorio) {
          map[ticket.id_repositorio] = ticket;
        }
      });
      
      setRepositorios(repos);
      setTicketsMap(map);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    const repo = repositorios.find(r => r.id_repositorio === ticket.id_repositorio);
    setSelectedRepositorio(repo || null);
    setIsDetailOpen(true);
  };

  const handleUpdatePrecio = (ticket) => {
    setSelectedTicket(ticket);
    if (ticket) {
      const repo = repositorios.find(r => r.id_repositorio === ticket.id_repositorio);
      setSelectedRepositorio(repo || null);
    }
    setIsPrecioModalOpen(true);
  };

  const handleConfigurarTicket = (repositorio) => {
    setSelectedRepositorio(repositorio);
    setSelectedTicket(null);
    setIsPrecioModalOpen(true);
  };

  // ✅ NUEVO: Toggle de venta usando el nuevo endpoint
  const handleToggleVenta = async (ticket) => {
    const nuevoEstado = !ticket.venta_habilitada;
    const action = nuevoEstado ? 'habilitar' : 'deshabilitar';
    
    if (!confirm(`¿Estás seguro de ${action} la venta de tickets para este museo?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      
      // ✅ NUEVO ENDPOINT: /api/tickets/museos/:id/toggle-venta
      const res = await fetch(`${API_URL}/api/tickets/museos/${ticket.id_repositorio}/toggle-venta`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          habilitar: nuevoEstado
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(`✅ Venta ${action} exitosamente`, 'success');
        fetchData();
      } else {
        showToast(data.message || 'Error al cambiar estado', 'error');
      }
    } catch (error) {
      console.error('Error toggling venta:', error);
      showToast('Error de conexión', 'error');
    }
  };

  // ✅ NUEVO: Guardar precio usando el nuevo endpoint
  const handleSavePrecio = async ({ precio, descuento, repositorioId }) => {
    try {
      const token = localStorage.getItem('token');
      
      // ✅ NUEVO ENDPOINT: /api/tickets/museos/:id
      const res = await fetch(`${API_URL}/api/tickets/museos/${repositorioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          precio: precio,
          descuento: descuento,
          venta_habilitada: selectedTicket ? selectedTicket.venta_habilitada : true
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        showToast(selectedTicket ? '✅ Precio actualizado exitosamente' : '✅ Ticket configurado exitosamente', 'success');
        setIsPrecioModalOpen(false);
        setSelectedTicket(null);
        setSelectedRepositorio(null);
        fetchData();
      } else {
        showToast(data.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('Error de conexión', 'error');
    }
  };

  // Filtrado
  const filteredRepositorios = repositorios.filter(repo => {
    const q = searchTerm.toLowerCase();
    return repo.nombre?.toLowerCase().includes(q) || 
           repo.sigla?.toLowerCase().includes(q) ||
           repo.direccion?.toLowerCase().includes(q);
  });

  const totalConTicket = repositorios.filter(r => ticketsMap[r.id_repositorio]).length;
  const totalActivos = repositorios.filter(r => r.activo).length;
  const totalHabilitados = repositorios.filter(r => {
    const ticket = ticketsMap[r.id_repositorio];
    return ticket && ticket.venta_habilitada === true;
  }).length;

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto" />
        <p className="mt-4 text-gray-400">Cargando museos y tickets...</p>
      </div>
    </div>
  );

  return (
    <>
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transition-all duration-300
          ${toast.type === 'success' ? 'bg-green-500/90 text-white border-green-400' : 'bg-red-500/90 text-white border-red-400'}`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl mb-8">
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-amber-500/20 via-amber-500/10 to-transparent' : 'from-amber-400/30 via-amber-400/20 to-transparent'}`} />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1600')] bg-cover bg-center opacity-20" />
            <div className="relative px-8 py-16 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full">
                    <BuildingLibraryIcon className={`w-12 h-12 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                </div>
                <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r
                  ${isDark ? 'from-white via-amber-400 to-white' : 'from-gray-800 via-amber-600 to-gray-800'}`}>
                  Museos y Tickets
                </h1>
                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Gestiona los tickets de entrada a los museos de la Fundación Cultural BCB
                </p>
                <div className="flex justify-center gap-8 mb-8 flex-wrap">
                  {[
                    { val: totalActivos, label: 'Museos Activos', color: 'amber' },
                    { val: totalConTicket, label: 'Con Ticket', color: 'emerald' },
                    { val: totalHabilitados, label: 'Venta Activa', color: 'green' },
                    { val: repositorios.length - totalConTicket, label: 'Sin Ticket', color: 'red' },
                  ].map(({ val, label, color }) => (
                    <div key={label} className="text-center">
                      <div className={`text-2xl font-bold ${isDark ? `text-${color}-400` : `text-${color}-600`}`}>{val}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
                    </div>
                  ))}
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                  <ClockIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Horario: <strong>08:30 - 16:30 hrs</strong> (Lunes a Sábado)
                  </span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder="Buscar museo por nombre, sigla o dirección..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`} />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredRepositorios.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{repositorios.length}</span> museos
            </p>
          </div>

          {/* Grid de Repositorios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRepositorios.map((repo) => {
                const ticket = ticketsMap[repo.id_repositorio] || null;
                return (
                  <RepositorioCard 
                    key={repo.id_repositorio}
                    repositorio={repo}
                    ticket={ticket}
                    onToggleVenta={ticket ? handleToggleVenta : undefined}
                    onUpdatePrecio={ticket ? handleUpdatePrecio : () => handleConfigurarTicket(repo)}
                    onView={ticket ? handleView : undefined}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {filteredRepositorios.length === 0 && (
            <div className="text-center py-16">
              <BuildingLibraryIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No se encontraron museos</p>
            </div>
          )}
        </div>

        {/* Modales */}
        <PrecioModal
          isOpen={isPrecioModalOpen}
          onClose={() => setIsPrecioModalOpen(false)}
          onSave={handleSavePrecio}
          ticket={selectedTicket}
          repositorio={selectedRepositorio}
        />

        {isDetailOpen && selectedTicket && selectedRepositorio && (
          <DetalleModal
            ticket={selectedTicket}
            repositorio={selectedRepositorio}
            onClose={() => setIsDetailOpen(false)}
            onEdit={() => { setIsDetailOpen(false); handleUpdatePrecio(selectedTicket); }}
          />
        )}
      </div>
    </>
  );
};

export default Tickets;