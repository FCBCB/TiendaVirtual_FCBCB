import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  ArrowRightIcon,
  MusicalNoteIcon,
  TicketIcon,
  AcademicCapIcon,
  MicrophoneIcon,
  PaintBrushIcon,
  BuildingLibraryIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { API_URL } from '../../components/config/api';
import EventoMinimalModal from './components/EventoMinimalModal';

// ✅ Velo cultural (ícono + degradado) por tipo de evento
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

// Cantidad de eventos a mostrar inicialmente y por cada "Ver más"
const INITIAL_VISIBLE = 4;
const LOAD_MORE_COUNT = 4;

const HomeEventsMinimal = () => {
  const [events, setEvents] = useState([]);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    if (hasFetched.current) {
      if (isMounted.current) setLoading(false);
      return;
    }
    hasFetched.current = true;

    const fetchEvents = async () => {
      try {
        if (isMounted.current) {
          setLoading(true);
          setError(false);
        }

        const token = localStorage.getItem('token');

        const hoy = new Date();
        const inicio = new Date(hoy);
        inicio.setDate(hoy.getDate() - 30);
        const fin = new Date(hoy);
        fin.setDate(hoy.getDate() + 90);

        const fechaInicio = inicio.toISOString().split('T')[0];
        const fechaFin = fin.toISOString().split('T')[0];

        const response = await fetch(`${API_URL}/api/eventos-proxy/eventos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token || ''}`,
          },
          body: JSON.stringify({
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            idRepositorio: 0,
            idEntidad: 0,
            idCategoria: 0,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        let eventosData = [];
        if (data && Array.isArray(data.eventos)) {
          eventosData = data.eventos;
        } else if (data && Array.isArray(data.data)) {
          eventosData = data.data;
        } else if (Array.isArray(data)) {
          eventosData = data;
        }

        const eventosFiltrados = eventosData.filter(
          (event) => event.fecha && event.descripcion && event.descripcion.trim() !== ''
        );

        const eventosOrdenados = eventosFiltrados.sort(
          (a, b) => new Date(b.fecha) - new Date(a.fecha)
        );

        if (isMounted.current) {
          setEvents(eventosOrdenados);
          // ✅ Resetear visibleCount cuando llegan nuevos datos
          setVisibleCount(INITIAL_VISIBLE);
          setError(false);
        }
      } catch (err) {
        console.error('Error fetching events:', err);
        if (isMounted.current) {
          setError(true);
          setEvents([]);
        }
      } finally {
        if (isMounted.current) setLoading(false);
      }
    };

    fetchEvents();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // ✅ Función para cargar más eventos
  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, events.length));
  };

  // ✅ Verificar si hay más eventos por mostrar
  const hasMoreEvents = visibleCount < events.length;

  // ✅ Eventos visibles (solo los primeros `visibleCount`)
  const visibleEvents = events.slice(0, visibleCount);

  const hasEvents = events.length > 0;

  if (loading) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4" />
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse h-72" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">Eventos Culturales</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">
              Próximas actividades y exposiciones
            </p>
            <div className="mt-8 p-8 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-gray-500 dark:text-gray-400 font-light">
                No pudimos cargar los eventos en este momento
              </p>
              <button
                onClick={() => {
                  hasFetched.current = false;
                  setLoading(true);
                  setError(false);
                }}
                className="inline-flex items-center gap-2 mt-4 text-sm text-teal-600 dark:text-teal-400 hover:underline"
              >
                Reintentar
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!hasEvents) {
    return (
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-light text-gray-900 dark:text-white">Eventos Culturales</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">
              Próximas actividades y exposiciones
            </p>
            <div className="mt-8 p-8 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <p className="text-gray-500 dark:text-gray-400 font-light">
                No hay eventos disponibles en este momento
              </p>
              <button
                onClick={() => navigate('/dashboard/actividades')}
                className="inline-flex items-center gap-2 mt-4 text-sm text-teal-600 dark:text-teal-400 hover:underline"
              >
                Ver calendario de eventos
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-light text-gray-900 dark:text-white">Eventos Culturales</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-light">
                {visibleEvents.length} de {events.length} eventos disponibles
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard/actividades')}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors group"
            >
              Ver todos
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ✅ GRID - Solo muestra los eventos visibles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleEvents.map((event, index) => {
              const conFoto = tieneFotoReal(event);
              const { icon: Icon, gradient } = getVisual(event);

              return (
                <motion.div
                  key={event.idEvento || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
                  className="group cursor-pointer"
                  onClick={() => handleEventClick(event)}
                >
                  <div className="relative rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col">
                    {/* Imagen o velo cultural */}
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700 relative flex-shrink-0">
                      {conFoto ? (
                        <img
                          src={event.fotografias?.[0]?.pathFotografia || event.imagen}
                          alt={event.descripcion || 'Evento cultural'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.dataset.fallback = 'true';
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${gradient} transition-transform duration-700 group-hover:scale-105 p-4 text-center`}
                        >
                          <Icon className="w-12 h-12 text-white/85 mb-2" />
                          <span className="text-white/70 text-[11px] font-light uppercase tracking-wider line-clamp-2">
                            {event.categoria?.nombreCategoria || 'Evento Cultural'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Badge de estado */}
                    <div className="absolute top-3 right-3 z-10">
                      {new Date(event.fecha) >= new Date() ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/90 text-white backdrop-blur-sm">
                          Próximo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-gray-500/80 text-white backdrop-blur-sm">
                          Pasado
                        </span>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-light">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span>{formatDate(event.fecha)}</span>
                        {event.horaInicio && event.horaInicio !== '00:00:00' && (
                          <>
                            <span className="w-px h-3 bg-gray-300 dark:bg-gray-600" />
                            <ClockIcon className="w-3.5 h-3.5" />
                            <span>{event.horaInicio.slice(0, 5)}</span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-2 text-sm font-medium text-gray-800 dark:text-white line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex-1">
                        {event.descripcion?.substring(0, 60) || event.categoria?.nombreCategoria || 'Evento Cultural'}
                      </h3>

                      {event.lugar && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-light">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          <span className="truncate">{event.lugar}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ✅ Botón "Ver más" - solo aparece si hay más eventos por mostrar */}
          {hasMoreEvents && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-teal-600 dark:text-teal-400 border-2 border-teal-600 dark:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors shadow-sm hover:shadow-md group"
              >
                Ver más eventos
                <span className="text-xs opacity-70">
                  ({visibleCount} de {events.length})
                </span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* ✅ Si ya se mostraron todos, mostrar mensaje */}
          {!hasMoreEvents && events.length > INITIAL_VISIBLE && (
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 font-light">
                Mostrando todos los {events.length} eventos disponibles
              </p>
            </div>
          )}
        </div>
      </section>

      <EventoMinimalModal
        evento={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </>
  );
};

export default HomeEventsMinimal;