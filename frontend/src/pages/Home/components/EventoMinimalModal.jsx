import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  SparklesIcon,
  MusicalNoteIcon,
  TicketIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  PaintBrushIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';

// Mismo mapeo que en HomeEventsMinimal — mantenerlos iguales para que la
// tarjeta y el modal muestren el mismo velo/ícono para un mismo evento.
const VISUAL_POR_CATEGORIA = {
  exposicion: { icon: PaintBrushIcon, gradient: 'from-teal-600 to-emerald-700' },
  concierto: { icon: MusicalNoteIcon, gradient: 'from-violet-600 to-fuchsia-700' },
  teatro: { icon: TicketIcon, gradient: 'from-rose-600 to-red-700' },
  taller: { icon: AcademicCapIcon, gradient: 'from-amber-500 to-orange-600' },
  conferencia: { icon: MicrophoneIcon, gradient: 'from-blue-600 to-indigo-700' },
  desfile: { icon: SparklesIcon, gradient: 'from-pink-500 to-rose-600' },
  default: { icon: BuildingLibraryIcon, gradient: 'from-slate-600 to-gray-800' },
};

const detectarCategoria = (event) => {
  const nombreCategoria = event.categoria?.nombreCategoria?.toLowerCase() || '';
  const texto = `${nombreCategoria} ${event.descripcion || ''} ${event.lugar || ''}`.toLowerCase();

  if (texto.includes('exposic')) return 'exposicion';
  if (texto.includes('concierto') || texto.includes('música') || texto.includes('musica')) return 'concierto';
  if (texto.includes('teatro') || texto.includes('obra')) return 'teatro';
  if (texto.includes('taller')) return 'taller';
  if (texto.includes('conferencia') || texto.includes('charla') || texto.includes('prensa')) return 'conferencia';
  if (texto.includes('desfile')) return 'desfile';
  return 'default';
};

const getVisual = (event) => VISUAL_POR_CATEGORIA[detectarCategoria(event)] || VISUAL_POR_CATEGORIA.default;

const tieneFotoReal = (event) =>
  Boolean((event.fotografias && event.fotografias.length > 0) || event.imagen);

const EventoMinimalModal = ({ evento, onClose, isOpen }) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!evento) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr) => {
    if (!timeStr || timeStr === '00:00:00') return '';
    return timeStr.slice(0, 5);
  };

  const conFoto = tieneFotoReal(evento) && !imageError;
  const { icon: Icon, gradient } = getVisual(evento);
  const imagenUrl = evento.fotografias?.[0]?.pathFotografia || evento.imagen;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl bg-white dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Portada: foto real, o velo cultural con ícono si no hay */}
            <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gray-200 dark:bg-gray-800">
              {conFoto ? (
                <img
                  src={imagenUrl}
                  alt={evento.descripcion || 'Evento'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient}`}>
                  <Icon className="w-16 h-16 text-white/85 mb-2" />
                  <span className="text-white/70 text-xs font-light uppercase tracking-wider">
                    {evento.categoria?.nombreCategoria || 'Evento Cultural'}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/20 text-white">
                  <span className="text-2xl font-light">
                    {evento.fecha ? new Date(evento.fecha).getDate() : ''}
                  </span>
                  <span className="text-xs block font-light opacity-80">
                    {evento.fecha ? new Date(evento.fecha).toLocaleDateString('es-ES', { month: 'short' }) : ''}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white line-clamp-2">
                    {evento.descripcion?.substring(0, 80) || evento.categoria?.nombreCategoria || 'Evento Cultural'}
                  </h3>
                  {evento.lugar && (
                    <p className="text-sm text-white/80 font-light flex items-center gap-1">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {evento.lugar}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs font-light">Fecha</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">
                    {formatDate(evento.fecha)}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-light">Hora</span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mt-1">
                    {formatTime(evento.horaInicio) || 'No especificada'}
                    {evento.horaFin && evento.horaFin !== '00:00:00' && ` - ${formatTime(evento.horaFin)}`}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentTextIcon className="w-4 h-4 text-teal-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Descripción
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {evento.descripcion || 'Sin descripción disponible'}
                </p>
              </div>

              {evento.lugar && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-4 h-4 text-teal-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Ubicación
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{evento.lugar}</p>
                  {evento.direccion && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{evento.direccion}</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {evento.categoria?.nombreCategoria && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
                    <SparklesIcon className="w-3 h-3" />
                    {evento.categoria.nombreCategoria}
                  </span>
                )}
                {evento.estado && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      evento.estado === 'CUMPLIDO' || evento.estado === 'Completado'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}
                  >
                    {evento.estado === 'CUMPLIDO' || evento.estado === 'Completado' ? '✅' : '📅'}
                    {evento.estado}
                  </span>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-gray-500 font-light">
                  ID: {evento.idEvento}
                </span>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventoMinimalModal;