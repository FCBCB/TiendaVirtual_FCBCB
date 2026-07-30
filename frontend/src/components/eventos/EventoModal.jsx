// src/components/eventos/EventoModal.jsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  X, Calendar, MapPin, Users, Clock, Building, FolderOpen, 
  User, Mail, Phone, Image as ImageIcon, Target, CheckCircle, 
  AlertCircle, CalendarDays, Tag, Sparkles, ChevronRight,
  ExternalLink, FileText, Award, Navigation, Globe, Loader2
} from 'lucide-react';
import { API_URL, getImageUrl } from '../config/api';

const EventoModal = ({ evento, onClose, isDark }) => {
  const modalRef = useRef();
  const [repositorioInfo, setRepositorioInfo] = useState(null);
  const [loadingRepositorio, setLoadingRepositorio] = useState(false);
  const [repositorioError, setRepositorioError] = useState(false);

  // Normalizar texto para comparación (quitar acentos, mayúsculas, etc.)
  const normalizeText = (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'n')
      .trim();
  };

  // Buscar repositorio por nombre (usando evento.lugar)
  const fetchRepositorioByNombre = async () => {
    const lugarNombre = evento?.lugar;
    if (!lugarNombre) {
      console.log('No hay lugar en el evento');
      setRepositorioError(true);
      return;
    }

    console.log('🔍 Buscando repositorio por nombre:', lugarNombre);
    setLoadingRepositorio(true);
    setRepositorioError(false);

    try {
      const token = localStorage.getItem('token');
      // Obtener todos los repositorios
      const response = await fetch(`${API_URL}/api/repositorios/admin/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok && data.repositorios) {
        const repositorios = data.repositorios;
        const lugarNormalizado = normalizeText(lugarNombre);
        
        // Buscar coincidencia por nombre
        const encontrado = repositorios.find(repo => {
          const nombreRepo = normalizeText(repo.nombre);
          // Comparación flexible
          return nombreRepo.includes(lugarNormalizado) || 
                 lugarNormalizado.includes(nombreRepo) ||
                 nombreRepo === lugarNormalizado;
        });
        
        if (encontrado) {
          console.log('✅ Repositorio encontrado:', encontrado);
          // Obtener detalles completos del repositorio encontrado
          const detailResponse = await fetch(`${API_URL}/api/repositorios/${encontrado.id_repositorio}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const detailData = await detailResponse.json();
          if (detailResponse.ok && detailData.repositorio) {
            setRepositorioInfo(detailData.repositorio);
          } else {
            setRepositorioInfo(encontrado);
          }
        } else {
          console.log('❌ No se encontró repositorio con nombre:', lugarNombre);
          setRepositorioError(true);
        }
      } else {
        console.error('Error cargando repositorios:', data);
        setRepositorioError(true);
      }
    } catch (error) {
      console.error('❌ Error fetching repositorio:', error);
      setRepositorioError(true);
    } finally {
      setLoadingRepositorio(false);
    }
  };

  // Cargar información del repositorio
  useEffect(() => {
    if (evento) {
      fetchRepositorioByNombre();
    }
  }, [evento]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  const formatHora = (hora) => {
    if (!hora) return '';
    const str = String(hora).trim();
    return str.length >= 8 ? str.slice(0, 5) : str;
  };

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const [year, month, day] = fecha.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${parseInt(day)} de ${meses[parseInt(month) - 1]} de ${year}`;
  };

  // Abrir Google Maps con la ubicación
  const openGoogleMaps = () => {
    if (repositorioInfo?.ubicacion_gps) {
      const [lat, lng] = repositorioInfo.ubicacion_gps.split(',');
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else if (repositorioInfo?.direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(repositorioInfo.direccion)}`, '_blank');
    } else if (evento?.lugar) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(evento.lugar)}`, '_blank');
    }
  };

  if (!evento) return null;

  const horaInicio = formatHora(evento.horaInicio);
  const horaFin = formatHora(evento.horaFin);
  const tieneHora = horaInicio || horaFin;
  
  // Determinar color del evento basado en categoría o estado
  const getEventColor = () => {
    if (evento.color) {
      if (evento.color.includes('success')) return '#10B981';
      if (evento.color.includes('primary')) return '#19ADA0';
      if (evento.color.includes('danger')) return '#EF4444';
      if (evento.color.includes('warning')) return '#F59E0B';
    }
    return '#19ADA0';
  };

  const eventColor = getEventColor();
  const estado = evento.estado || 'Programado';
  const isCompleted = estado === 'CUMPLIDO' || estado === 'Completado';

  // Información de contacto formateada
  const getNombreCompletoContacto = () => {
    if (!evento.contacto) return '';
    return [evento.contacto.nombreContacto, evento.contacto.primerApContacto, evento.contacto.segundoApContacto]
      .filter(Boolean).join(' ');
  };

  // Determinar si hay ubicación disponible
  const hasUbicacion = repositorioInfo?.ubicacion_gps || repositorioInfo?.direccion || evento?.lugar;

  return (
    <div 
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl transform transition-all duration-300 animate-slideUp"
      >
        {/* Header con gradiente y diseño moderno */}
        <div 
          className="relative p-6 text-white"
          style={{ background: `linear-gradient(135deg, ${eventColor}, ${eventColor}cc)` }}
        >
          {/* Badge de estado */}
          <div className="absolute top-4 right-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${
              isCompleted 
                ? 'bg-green-500/30 text-green-100' 
                : 'bg-blue-500/30 text-blue-100'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <Sparkles className="h-3 w-3" />
              )}
              <span>{estado}</span>
            </div>
          </div>

          {/* Tipo de evento */}
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
              <CalendarDays className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {evento.categoria?.nombreCategoria || 'Evento Cultural'}
            </span>
          </div>

          {/* Título */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 pr-20 leading-tight">
            {evento.descripcion?.substring(0, 100) || evento.categoria?.nombreCategoria || 'Evento Cultural'}
          </h2>

          {/* Información de fecha y lugar */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <Calendar className="h-4 w-4" />
              <span>{formatFecha(evento.fecha)}</span>
            </div>
            {tieneHora && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <Clock className="h-4 w-4" />
                <span>{horaInicio}{horaFin ? ` - ${horaFin}` : ''}</span>
              </div>
            )}
            {evento.lugar && (
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5">
                <MapPin className="h-4 w-4" />
                <span>{evento.lugar}</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm hover:scale-110"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable con diseño mejorado */}
        <div className={`p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6 ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          
          {/* Descripción completa */}
          {evento.descripcion && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} border-l-4`} style={{ borderLeftColor: eventColor }}>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: eventColor }} />
                <div>
                  <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Descripción del Evento
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed whitespace-pre-wrap text-sm`}>
                    {evento.descripcion}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mapa y Ubicación del Repositorio */}
          {(hasUbicacion || loadingRepositorio) && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-r from-gray-800/50 to-gray-800/30' : 'bg-gradient-to-r from-white to-gray-50'} border shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-wayruru-teal/15">
                    <Globe className="h-4 w-4 text-wayruru-teal" />
                  </div>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Ubicación del Repositorio
                  </h3>
                </div>
                {hasUbicacion && (
                  <button
                    onClick={openGoogleMaps}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-wayruru-teal hover:bg-wayruru-teal/80 text-black dark: text-white rounded-lg transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg bg-purple-400 "
                  >
                    <Navigation className="h-3.5 w-3.5 text-white" />
                    Ver en Google Maps
                  </button>
                )}
              </div>

              {/* Estado de carga */}
              {loadingRepositorio && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-wayruru-teal" />
                  <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Buscando información del repositorio...
                  </span>
                </div>
              )}

              {/* Información del repositorio encontrado */}
              {!loadingRepositorio && repositorioInfo && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-wayruru-teal" />
                    <span className={`font-semibold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {repositorioInfo.nombre}
                    </span>
                    {repositorioInfo.sigla && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                        {repositorioInfo.sigla}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {repositorioInfo.direccion && (
                      <p className="flex items-start gap-2 text-sm">
                        <MapPin className="h-3.5 w-3.5 text-wayruru-teal mt-0.5 flex-shrink-0" />
                        <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {repositorioInfo.direccion}
                        </span>
                      </p>
                    )}
                    {repositorioInfo.horario_atencion && (
                      <p className="flex items-center gap-2 text-sm">
                        <Clock className="h-3.5 w-3.5 text-wayruru-teal" />
                        <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {repositorioInfo.horario_atencion}
                        </span>
                      </p>
                    )}
                    {repositorioInfo.telefono && (
                      <p className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-wayruru-teal" />
                        <a href={`tel:${repositorioInfo.telefono}`} className={`hover:underline ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {repositorioInfo.telefono}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Mapa estático (iframe de Google Maps) */}
              {!loadingRepositorio && hasUbicacion && (
                <>
                  <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md mt-3">
                    {repositorioInfo?.ubicacion_gps ? (
                      <iframe
                        title="Ubicación del repositorio"
                        width="100%"
                        height="250"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${repositorioInfo.ubicacion_gps}&zoom=15&language=es`}
                        allowFullScreen
                        loading="lazy"
                        className="w-full"
                      />
                    ) : repositorioInfo?.direccion ? (
                      <iframe
                        title="Ubicación del repositorio"
                        width="100%"
                        height="250"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(repositorioInfo.direccion)}&zoom=15&language=es`}
                        allowFullScreen
                        loading="lazy"
                        className="w-full"
                      />
                    ) : evento?.lugar ? (
                      <iframe
                        title="Ubicación del evento"
                        width="100%"
                        height="250"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(evento.lugar)}&zoom=15&language=es`}
                        allowFullScreen
                        loading="lazy"
                        className="w-full"
                      />
                    ) : (
                      <div className={`h-[200px] flex flex-col items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <MapPin className="h-12 w-12 text-gray-400 mb-2" />
                        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Ubicación no disponible
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {repositorioInfo?.ubicacion_gps && (
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      📍 Coordenadas: {repositorioInfo.ubicacion_gps}
                    </p>
                  )}
                </>
              )}

              {/* Error al cargar repositorio */}
              {!loadingRepositorio && repositorioError && (
                <div className={`p-3 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
                  <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    ⚠️ No se encontró información del repositorio para "{evento.lugar}"
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    El mapa se mostrará usando la ubicación del evento
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid de información principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evento.entidad?.nombreEntidad && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-wayruru-teal/10">
                    <Building className="h-4 w-4 text-wayruru-teal" />
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Entidad Organizadora
                  </h3>
                </div>
                <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {evento.entidad.nombreEntidad}
                </p>
                {evento.entidad.descripcionEntidad && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {evento.entidad.descripcionEntidad}
                  </p>
                )}
              </div>
            )}

            {/* Repositorio - mostrando el lugar del evento */}
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-orange-500/10">
                  <FolderOpen className="h-4 w-4 text-orange-500" />
                </div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Repositorio / Lugar
                </h3>
              </div>
              <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                {evento.lugar || 'No especificado'}
              </p>
              {repositorioInfo?.sigla && (
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Sigla: {repositorioInfo.sigla}
                </p>
              )}
            </div>

            {evento.categoria?.nombreCategoria && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <Tag className="h-4 w-4 text-purple-500" />
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Categoría
                  </h3>
                </div>
                <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {evento.categoria.nombreCategoria}
                </p>
              </div>
            )}

            {evento.participantes && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm hover:shadow-md transition-shadow`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Participantes
                  </h3>
                </div>
                <p className={`font-medium text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {evento.participantes} personas estimadas
                </p>
              </div>
            )}
          </div>

          {/* El resto del código permanece igual... */}
          {/* Objetivo Esperado */}
          {evento.objetivoEsperado && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gradient-to-r from-gray-800/50 to-gray-800/30' : 'bg-gradient-to-r from-white to-gray-50'} border`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-wayruru-teal/15">
                  <Target className="h-5 w-5 text-wayruru-teal" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Objetivo del Evento
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                    {evento.objetivoEsperado}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unidad y Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evento.unidad?.nombreUnidad && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10">
                    <Building className="h-4 w-4 text-indigo-500" />
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Unidad Responsable
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {evento.unidad.nombreUnidad}
                </p>
              </div>
            )}

            {evento.personal?.nombrePersonal && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-teal-500/10">
                    <User className="h-4 w-4 text-teal-500" />
                  </div>
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Responsable
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {evento.personal.cargoPersonal && (
                    <span className="text-xs block opacity-70">{evento.personal.cargoPersonal}</span>
                  )}
                  <span className="font-medium">{evento.personal.nombrePersonal}</span>
                </p>
              </div>
            )}
          </div>

          {/* Contacto - Tarjeta destacada */}
          {evento.contacto && (evento.contacto.nombreContacto || evento.contacto.telefonoContacto || evento.contacto.emailContacto) && (
            <div className={`p-4 rounded-xl ${isDark ? 'bg-wayruru-teal/10 border border-wayruru-teal/20' : 'bg-wayruru-teal/5 border border-wayruru-teal/20'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-wayruru-teal/20">
                  <User className="h-4 w-4 text-wayruru-teal" />
                </div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  Información de Contacto
                </h3>
              </div>
              <div className="space-y-2">
                {getNombreCompletoContacto() && (
                  <p className={`text-sm flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className="font-medium">Nombre:</span> {getNombreCompletoContacto()}
                  </p>
                )}
                {evento.contacto.telefonoContacto && (
                  <p className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-wayruru-teal" />
                    <a href={`tel:${evento.contacto.telefonoContacto}`} className={`hover:underline ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {evento.contacto.telefonoContacto}
                    </a>
                  </p>
                )}
                {evento.contacto.emailContacto && (
                  <p className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-wayruru-teal" />
                    <a href={`mailto:${evento.contacto.emailContacto}`} className={`hover:underline ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {evento.contacto.emailContacto}
                    </a>
                  </p>
                )}
                {evento.contacto.direccionContacto && (
                  <p className={`text-sm flex items-start gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{evento.contacto.direccionContacto}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Fotografías - Galería mejorada */}
          {evento.fotografias && evento.fotografias.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/10">
                    <ImageIcon className="h-4 w-4 text-pink-500" />
                  </div>
                  <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    Galería de Imágenes
                  </h3>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {evento.fotografias.length} {evento.fotografias.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {evento.fotografias.map((foto, idx) => (
                  <a
                    key={idx}
                    href={foto.pathFotografia}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-wayruru-teal transition-all duration-300 hover:shadow-lg"
                  >
                    <img
                      src={foto.pathFotografia}
                      alt={`Fotografía del evento ${idx + 1}`}
                      className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x300/19ADA0/white?text=Sin+Imagen';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones y Conclusiones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evento.observaciones && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-yellow-900/20 border border-yellow-800/30' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                    Observaciones
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap`}>
                  {evento.observaciones}
                </p>
              </div>
            )}

            {evento.obsConclusion && (
              <div className={`p-3 rounded-xl ${isDark ? 'bg-green-900/20 border border-green-800/30' : 'bg-green-50 border border-green-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-green-600" />
                  <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                    Conclusiones
                  </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} whitespace-pre-wrap`}>
                  {evento.obsConclusion}
                </p>
              </div>
            )}
          </div>

          {/* Equipamiento */}
          {evento.equipamiento && evento.equipamiento.length > 0 && (
            <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10">
                  <FolderOpen className="h-4 w-4 text-cyan-500" />
                </div>
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Equipamiento Solicitado
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {evento.equipamiento.map((eq, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {eq.nombreEquipamiento}
                    {eq.cantidadSolicitada && (
                      <span className="text-wayruru-teal font-semibold">×{eq.cantidadSolicitada}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer con metadatos */}
          <div className={`pt-4 mt-2 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <div className="flex flex-wrap gap-4 text-xs">
              {evento.estado && (
                <div className="flex items-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                    Estado: {evento.estado}
                  </span>
                </div>
              )}
              {evento.usuarioRegistro?.nom_usuario && (
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                  👤 Registrado por: {evento.usuarioRegistro.nom_usuario}
                </span>
              )}
              {evento.fechaRegistro && (
                <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>
                  📅 Registro: {formatFecha(evento.fechaRegistro)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventoModal;