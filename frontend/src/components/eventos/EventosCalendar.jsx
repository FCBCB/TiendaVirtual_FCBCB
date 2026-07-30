// src/components/eventos/EventosCalendar.jsx
import React, { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import { 
  Layers, Filter, X, ChevronDown, ChevronUp, 
  Sparkles, Grid3x3, List 
} from 'lucide-react';
import { fetchParametros, fetchEventos } from './eventosService';
import { API_URL } from '../config/api';
import EventoModal from './EventoModal';

// COLORES POR REPOSITORIO
const REPOSITORIO_COLORS = {
  'MNA': { bg: '#E76F51', border: '#C15A44', text: '#FFFFFF', name: 'Museo Nacional de Arte' },
  'CDL': { bg: '#2A9D8F', border: '#1F7A6F', text: '#FFFFFF', name: 'Casa de la Libertad' },
  'ABNB': { bg: '#264653', border: '#1C3644', text: '#FFFFFF', name: 'Archivo y Biblioteca Nacionales de Bolivia' },
  'CNM': { bg: '#F4A261', border: '#E08C4E', text: '#1a1a1a', name: 'Casa Nacional de Moneda' },
  'FM': { bg: '#DF3828', border: '#A52A1E', text: '#FFFFFF', name: 'Museo Fernando Montes' },
  'MUSEF': { bg: '#6C5B7B', border: '#4A3D5E', text: '#FFFFFF', name: 'Museo Nacional de Etnografia y Folklore' },
  'CRC': { bg: '#E9C46A', border: '#D4A373', text: '#1a1a1a', name: 'Centro de la Revolucion Cultural' },
  'CCP': { bg: '#2A9D8F', border: '#1F7A6F', text: '#FFFFFF', name: 'Centro de la Cultura Plurinacional' },
  'MMNP': { bg: '#8B5F8C', border: '#6B406C', text: '#FFFFFF', name: 'Museo Marina Nunez del Prado' },
  'default': { bg: '#19ADA0', border: '#0C6660', text: '#FFFFFF' }
};

// Mapeo de nombres de repositorio a sus IDs reales en la BD
// IMPORTANTE: Estos IDs deben coincidir con los de tu base de datos
const REPOSITORIOS_PREDEFINIDOS = [
  { idRepositorio: 0, nombreRepositorio: 'Todos los repositorios', color: '#19ADA0' },
  { idRepositorio: 1, nombreRepositorio: 'Museo Nacional de Arte', color: '#E76F51', sigla: 'MNA', nombre_busqueda: 'Museo Nacional de Arte' },
  { idRepositorio: 2, nombreRepositorio: 'Casa de la Libertad', color: '#2A9D8F', sigla: 'CDL', nombre_busqueda: 'Casa de la Libertad' },
  { idRepositorio: 3, nombreRepositorio: 'Archivo y Biblioteca Nacionales de Bolivia', color: '#264653', sigla: 'ABNB', nombre_busqueda: 'Archivo y Biblioteca Nacionales' },
  { idRepositorio: 4, nombreRepositorio: 'Casa Nacional de Moneda', color: '#F4A261', sigla: 'CNM', nombre_busqueda: 'Casa Nacional de Moneda' },
  { idRepositorio: 5, nombreRepositorio: 'Museo Fernando Montes', color: '#DF3828', sigla: 'FM', nombre_busqueda: 'Museo Fernando Montes' },
  { idRepositorio: 6, nombreRepositorio: 'Museo Nacional de Etnografia y Folklore', color: '#6C5B7B', sigla: 'MUSEF', nombre_busqueda: 'Museo Nacional de Etnografia' },
  { idRepositorio: 7, nombreRepositorio: 'Centro de la Revolucion Cultural', color: '#E9C46A', sigla: 'CRC', nombre_busqueda: 'Centro de la Revolucion Cultural' },
  { idRepositorio: 8, nombreRepositorio: 'Centro de la Cultura Plurinacional', color: '#2A9D8F', sigla: 'CCP', nombre_busqueda: 'Centro de la Cultura Plurinacional' },
  { idRepositorio: 9, nombreRepositorio: 'Museo Marina Nunez del Prado', color: '#8B5F8C', sigla: 'MMNP', nombre_busqueda: 'Museo Marina Nunez del Prado' }
];

const EventosCalendar = ({ isDark }) => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRepositorio, setSelectedRepositorio] = useState(0);
  const [selectedRepositorioNombre, setSelectedRepositorioNombre] = useState('');
  const [opciones, setOpciones] = useState({ repositorios: [], entidades: [] });
  const [repositoriosBackend, setRepositoriosBackend] = useState([]);
  const [statsPorRepositorio, setStatsPorRepositorio] = useState({});
  const [selectedView, setSelectedView] = useState('dayGridMonth');
  const [animatedEvent, setAnimatedEvent] = useState(null);
  const [allEventos, setAllEventos] = useState([]);
  
  const calendarRef = useRef();

  const getEventColor = (sigla) => {
    if (sigla && REPOSITORIO_COLORS[sigla]) {
      return REPOSITORIO_COLORS[sigla];
    }
    return REPOSITORIO_COLORS.default;
  };

  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    return `${API_URL}${logoPath}`;
  };

  // Normalizar texto para comparación
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .trim();
  };

  // Filtrar eventos por repositorio (por nombre, no por ID)
  const filtrarEventosPorRepositorio = (eventosLista, repositorioId) => {
    if (repositorioId === 0) return eventosLista;
    
    const repositorioSeleccionado = REPOSITORIOS_PREDEFINIDOS.find(r => r.idRepositorio === repositorioId);
    if (!repositorioSeleccionado) return eventosLista;
    
    const nombreBusqueda = normalizeText(repositorioSeleccionado.nombre_busqueda || repositorioSeleccionado.nombreRepositorio);
    
    return eventosLista.filter(evento => {
      const lugarEvento = normalizeText(evento.lugar || '');
      const repositorioNombre = normalizeText(evento.repositorio?.nombreRepositorio || '');
      const descripcion = normalizeText(evento.descripcion || '');
      
      // Buscar coincidencia por lugar o nombre del repositorio
      return lugarEvento.includes(nombreBusqueda) || 
             repositorioNombre.includes(nombreBusqueda) ||
             nombreBusqueda.includes(lugarEvento);
    });
  };

  // Cargar opciones de filtros
  useEffect(() => {
    const loadOpciones = async () => {
      try {
        const token = localStorage.getItem('token');
        const reposResponse = await fetch(`${API_URL}/api/repositorios/admin/todos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const reposData = await reposResponse.json();
        
        const entidades = await fetchParametros('entidades');
        const reposBackend = reposData.repositorios || [];
        setRepositoriosBackend(reposBackend);
        
        // Mapear repositorios con logos
        const reposMapeados = REPOSITORIOS_PREDEFINIDOS.filter(r => r.idRepositorio !== 0).map(repoPref => {
          const repoBackend = reposBackend.find(r => 
            normalizeText(r.nombre).includes(normalizeText(repoPref.nombre_busqueda || repoPref.nombreRepositorio)) ||
            normalizeText(repoPref.nombre_busqueda || repoPref.nombreRepositorio).includes(normalizeText(r.nombre))
          );
          return {
            ...repoPref,
            logo_repositorio: repoBackend?.logo_repositorio || null,
            id_repositorio_real: repoBackend?.id_repositorio || repoPref.idRepositorio,
            nombre: repoBackend?.nombre || repoPref.nombreRepositorio
          };
        });
        
        setOpciones({ 
          repositorios: reposMapeados,
          entidades: entidades || [] 
        });
      } catch (error) {
        console.error('Error loading opciones:', error);
        setOpciones({ 
          repositorios: REPOSITORIOS_PREDEFINIDOS.filter(r => r.idRepositorio !== 0),
          entidades: [] 
        });
      }
    };
    loadOpciones();
  }, []);

  // Cargar TODOS los eventos (sin filtro por repositorio)
  const loadAllEventos = async () => {
    setLoading(true);
    try {
      const hoy = new Date();
      const fechaInicio = new Date(hoy);
      fechaInicio.setDate(hoy.getDate() - 30);
      const fechaFin = new Date(hoy);
      fechaFin.setDate(hoy.getDate() + 120);

      const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
      const fechaFinStr = fechaFin.toISOString().split('T')[0];

      const eventosData = await fetchEventos({
        fecha_inicio: fechaInicioStr,
        fecha_fin: fechaFinStr,
        idRepositorio: 0,
        idEntidad: 0,
        idCategoria: 0,
      });

      console.log('📅 Todos los eventos recibidos:', eventosData.length);
      setAllEventos(eventosData);
      
      // Calcular estadísticas por repositorio
      const stats = {};
      eventosData.forEach(evento => {
        const lugar = evento.lugar || 'Otros';
        let sigla = '';
        let nombre = lugar;
        
        // Buscar a qué repositorio pertenece
        const repositorioMatch = REPOSITORIOS_PREDEFINIDOS.find(repo => 
          normalizeText(lugar).includes(normalizeText(repo.nombre_busqueda || repo.nombreRepositorio))
        );
        
        if (repositorioMatch) {
          sigla = repositorioMatch.sigla;
          nombre = repositorioMatch.nombreRepositorio;
        }
        
        if (!stats[sigla]) {
          stats[sigla] = {
            count: 0,
            nombre: nombre,
            sigla: sigla || 'otros',
            color: getEventColor(sigla).bg
          };
        }
        stats[sigla].count++;
      });
      
      setStatsPorRepositorio(stats);
      
      // Aplicar filtro inicial
      aplicarFiltroYActualizar(eventosData);
      
    } catch (error) {
      console.error('Error loading eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtro y actualizar calendario
  const aplicarFiltroYActualizar = (eventosLista = allEventos) => {
    const eventosFiltrados = filtrarEventosPorRepositorio(eventosLista, selectedRepositorio);
    
    const calendarEvents = eventosFiltrados.map(evento => {
      let sigla = '';
      let repoInfo = null;
      
      // Buscar a qué repositorio pertenece este evento
      const lugarEvento = evento.lugar || '';
      const repositorioMatch = REPOSITORIOS_PREDEFINIDOS.find(repo => 
        normalizeText(lugarEvento).includes(normalizeText(repo.nombre_busqueda || repo.nombreRepositorio))
      );
      
      if (repositorioMatch) {
        sigla = repositorioMatch.sigla;
        repoInfo = repositorioMatch;
      }
      
      const colors = getEventColor(sigla);
      
      let logoUrl = null;
      if (repoInfo) {
        const repoBackend = repositoriosBackend.find(r => 
          normalizeText(r.nombre).includes(normalizeText(repoInfo.nombre_busqueda || repoInfo.nombreRepositorio))
        );
        if (repoBackend?.logo_repositorio) {
          logoUrl = getLogoUrl(repoBackend.logo_repositorio);
        }
      }
      
      const tieneHora = evento.horaInicio && evento.horaInicio !== '00:00:00' && evento.horaInicio !== '';
      
      let startDate = evento.fecha;
      if (tieneHora && evento.horaInicio) {
        const horaStr = evento.horaInicio.length === 5 ? `${evento.horaInicio}:00` : evento.horaInicio;
        startDate = `${evento.fecha}T${horaStr}`;
      }
      
      return {
        id: evento.idEvento || evento.id,
        title: evento.descripcion?.substring(0, 50) || evento.categoria?.nombreCategoria || 'Evento',
        start: startDate,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          raw: evento,
          repositorioSigla: sigla,
          repositorioLogo: logoUrl,
          tieneHora: tieneHora,
          horaInicio: evento.horaInicio
        }
      };
    });
    
    setEventos(calendarEvents);
    console.log(`📊 Mostrando ${calendarEvents.length} eventos de ${eventosLista.length} totales`);
  };

  // Cargar eventos al inicio
  useEffect(() => {
    loadAllEventos();
  }, []);

  // Aplicar filtro cuando cambia el repositorio seleccionado
  useEffect(() => {
    if (allEventos.length > 0) {
      aplicarFiltroYActualizar(allEventos);
    }
  }, [selectedRepositorio]);

  const handleEventClick = (info) => {
    setAnimatedEvent(info.event.id);
    setTimeout(() => {
      setSelectedEvento(info.event.extendedProps.raw);
    }, 200);
  };

  const handleRepositorioChange = (id) => {
    const nuevoId = parseInt(id) || 0;
    setSelectedRepositorio(nuevoId);
    
    const repoSeleccionado = REPOSITORIOS_PREDEFINIDOS.find(r => r.idRepositorio === nuevoId);
    if (repoSeleccionado) {
      setSelectedRepositorioNombre(repoSeleccionado.nombreRepositorio);
    } else {
      setSelectedRepositorioNombre('');
    }
  };

  const limpiarFiltros = () => {
    setSelectedRepositorio(0);
    setSelectedRepositorioNombre('');
  };

  const getFilterCount = () => {
    return selectedRepositorio !== 0 ? 1 : 0;
  };

  const getRepositorioSeleccionado = () => {
    if (selectedRepositorio === 0) return null;
    return REPOSITORIOS_PREDEFINIDOS.find(r => r.idRepositorio === selectedRepositorio);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-wayruru-teal to-wayruru-teal-deep">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
        
        <div className="flex flex-wrap justify-between items-center gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm animate-pulse">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-black dark:text-white">Eventos por Repositorio</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-black dark:text-white text-sm flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {eventos.length} eventos mostrados
                </span>
                <span className="text-black dark:text-white text-sm">
                  de {allEventos.length} totales
                </span>
                {getFilterCount() > 0 && (
                  <span className="text-white/80 text-sm flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                    📍 {getRepositorioSeleccionado()?.nombreRepositorio}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex bg-white/20 backdrop-blur-sm rounded-xl p-1">
              <button
                onClick={() => setSelectedView('dayGridMonth')}
                className={`p-2 rounded-lg transition-all duration-200 ${selectedView === 'dayGridMonth' ? 'bg-white text-wayruru-teal shadow-md' : 'text-white hover:bg-white/20'}`}
              >
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedView('timeGridWeek')}
                className={`p-2 rounded-lg transition-all duration-200 ${selectedView === 'timeGridWeek' ? 'bg-white text-wayruru-teal shadow-md' : 'text-white hover:bg-white/20'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-all duration-300 backdrop-blur-sm bg-amber-400 text-black ${
                showFilters 
                  ? 'bg-white text-wayruru-teal shadow-lg' 
                  : 'bg-amber-400 text-black hover:bg-green-400'
              }`}
            >
              <Filter className="h-4 w-4" />
              Repositorios
              {getFilterCount() > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-wayruru-teal text-white rounded-full font-bold">
                  {getFilterCount()}
                </span>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de filtros */}
      <div className={`transition-all duration-500 overflow-hidden ${showFilters ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className={`p-5 rounded-2xl ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200'} shadow-xl`}>
          <label className={`block text-xs font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Filter className="h-4 w-4" />
            SELECCIONAR REPOSITORIO
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Opción "Todos" */}
            <button
              onClick={limpiarFiltros}
              className={`p-4 rounded-xl text-left flex items-center gap-4 transition-all border ${
                selectedRepositorio === 0 
                  ? 'border-wayruru-teal bg-wayruru-teal/10 ring-2 ring-wayruru-teal/20' 
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
                🌍
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-800 dark:text-white">Todos los repositorios</div>
                <div className="text-xs text-gray-500">Mostrar {allEventos.length} eventos de todos los repositorios</div>
              </div>
              {selectedRepositorio === 0 && (
                <div className="ml-auto text-wayruru-teal">
                  <span className="text-xl">✓</span>
                </div>
              )}
            </button>

            {/* Lista de repositorios */}
            {REPOSITORIOS_PREDEFINIDOS.filter(r => r.idRepositorio !== 0).map(repo => {
              const colors = REPOSITORIO_COLORS[repo.sigla] || REPOSITORIO_COLORS.default;
              const stats = statsPorRepositorio[repo.sigla] || { count: 0 };
              const isSelected = selectedRepositorio === repo.idRepositorio;

              return (
                <button
                  key={repo.idRepositorio}
                  onClick={() => handleRepositorioChange(repo.idRepositorio)}
                  className={`p-4 rounded-xl text-left flex items-center gap-4 transition-all border ${
                    isSelected 
                      ? 'border-wayruru-teal bg-wayruru-teal/10 ring-2 ring-wayruru-teal/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div 
                    className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: colors.bg + '20' }}
                  >
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
                      <span className="text-white text-sm font-bold">{repo.sigla?.substring(0, 2)}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-white truncate">{repo.nombreRepositorio}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {stats.count} eventos • {repo.sigla}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="ml-auto text-wayruru-teal">
                      <span className="text-xl">✓</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Mostrar repositorio seleccionado actualmente */}
          {selectedRepositorio !== 0 && (
            <div className="mt-4 p-3 rounded-lg bg-wayruru-teal/10 border border-wayruru-teal/20">
              <p className="text-sm text-wayruru-teal">
                📍 Mostrando eventos de: <span className="font-semibold">{getRepositorioSeleccionado()?.nombreRepositorio}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Calendario */}
      <div className={`rounded-2xl p-5 ${isDark ? 'bg-gray-800/30' : 'bg-white'} shadow-xl transition-all duration-300 overflow-x-auto`}>
        {loading ? (
          <div className="flex flex-col justify-center items-center h-96">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-b-3 border-wayruru-teal mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-wayruru-teal animate-pulse" />
              </div>
            </div>
            <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Cargando eventos culturales...
            </p>
          </div>
        ) : eventos.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96 text-center">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Layers className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              No hay eventos en este repositorio
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              No se encontraron eventos para el repositorio seleccionado.
              {selectedRepositorio !== 0 && (
                <button 
                  onClick={limpiarFiltros}
                  className="ml-2 text-wayruru-teal hover:underline font-medium"
                >
                  Ver todos los eventos
                </button>
              )}
            </p>
          </div>
        ) : (
          <FullCalendar
            key={selectedView}
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listWeek'
            }}
            buttonText={{
              today: 'Hoy',
              month: 'Mes',
              week: 'Semana',
              list: 'Lista'
            }}
            initialView={selectedView}
            locale={esLocale}
            events={eventos}
            eventClick={handleEventClick}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={true}
            editable={false}
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }}
            eventDidMount={(info) => {
              if (animatedEvent === info.event.id) {
                info.el.style.animation = 'eventPop 0.5s ease-out';
                setTimeout(() => { if (info.el) info.el.style.animation = ''; }, 500);
              }
            }}
            eventContent={(eventInfo) => {
              const tieneHora = eventInfo.event.extendedProps?.tieneHora;
              const horaInicio = eventInfo.event.extendedProps?.horaInicio;
              const repoLogo = eventInfo.event.extendedProps?.repositorioLogo;
              const bgColor = eventInfo.event.backgroundColor;
              const textColor = eventInfo.event.textColor;
              const title = eventInfo.event.title;
              
              let horaStr = '';
              if (tieneHora && horaInicio && horaInicio !== '00:00:00') {
                const [hours, minutes] = horaInicio.split(':');
                horaStr = `${hours}:${minutes}`;
              }
              
              return {
                html: `
                  <div class="fc-event-custom" style="
                    background: ${bgColor};
                    color: ${textColor};
                    padding: 4px 8px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin: 2px;
                  ">
                    ${repoLogo ? `
                      <img 
                        src="${repoLogo}" 
                        style="
                          width: 18px;
                          height: 18px;
                          border-radius: 50%;
                          object-fit: cover;
                          background: white;
                          padding: 2px;
                          flex-shrink: 0;
                        "
                        onerror="this.style.display='none'"
                      />
                    ` : ''}
                    ${horaStr ? `
                      <span style="
                        font-size: 0.65rem;
                        opacity: 0.85;
                        flex-shrink: 0;
                        font-weight: 600;
                      ">
                        🕐 ${horaStr}
                      </span>
                    ` : ''}
                    <span style="
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      flex: 1;
                    ">
                      ${title}
                    </span>
                  </div>
                `
              };
            }}
          />
        )}
      </div>

      {selectedEvento && (
        <EventoModal
          evento={selectedEvento}
          onClose={() => setSelectedEvento(null)}
          isDark={isDark}
        />
      )}

      <style>{`
        @keyframes eventPop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        .fc-event-custom:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default EventosCalendar;