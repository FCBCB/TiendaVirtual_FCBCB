import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingLibraryIcon,
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';
import MapPicker from '../../components/MapPicker';

const EventoModal = ({ isOpen, onClose, onSave, evento, isEditing, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_evento: '',
    costo: 0,
    requiere_inscripcion: false,
    cupo_maximo: 0,
    estado: 'activo',
    realizaciones: []
  });
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [imagenActual, setImagenActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [repositorios, setRepositorios] = useState([]);
  const [showRealizacionSelector, setShowRealizacionSelector] = useState(false);

  const tiposEvento = ['Visita Guiada', 'Taller', 'Concierto', 'Exposición', 'Feria', 'Otros'];

  useEffect(() => {
    const fetchRepositorios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/eventos/repositorios/disponibles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          let repos = data.repositorios || [];
          if (userInfo?.rol === 'responsable' && userInfo?.id_repositorio_asignado) {
            repos = repos.filter(r => r.id_repositorio === userInfo.id_repositorio_asignado);
          }
          setRepositorios(repos);
        }
      } catch (error) {
        console.error('Error fetching repositorios:', error);
      }
    };
    if (isOpen) {
      fetchRepositorios();
    }
  }, [isOpen, userInfo]);

  useEffect(() => {
    if (evento && isEditing) {
      setFormData({
        titulo: evento.titulo || '',
        descripcion: evento.descripcion || '',
        tipo_evento: evento.tipo_evento || '',
        costo: evento.costo || 0,
        requiere_inscripcion: evento.requiere_inscripcion === 1 || evento.requiere_inscripcion === true,
        cupo_maximo: evento.cupo_maximo || 0,
        estado: evento.estado || 'activo',
        realizaciones: evento.realizaciones || []
      });
      setImagenPreview(getImageUrl(evento.imagen_portada));
      setImagenActual(evento.imagen_portada || '');
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo_evento: '',
        costo: 0,
        requiere_inscripcion: false,
        cupo_maximo: 0,
        estado: 'activo',
        realizaciones: []
      });
      setImagenPreview('');
      setImagenActual('');
      setImagenFile(null);
    }
  }, [evento, isEditing, isOpen]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const addRealizacion = () => {
    setFormData({
      ...formData,
      realizaciones: [...formData.realizaciones, {
        id_repositorio: '',
        fecha: '',
        hora_inicio: '',
        hora_fin: '',
        ubicacion_especifica: '',
        ubicacion_gps: '', // Nueva campo para coordenadas GPS
        cupos_disponibles: 0
      }]
    });
    setShowRealizacionSelector(false);
  };

  const removeRealizacion = (index) => {
    setFormData({
      ...formData,
      realizaciones: formData.realizaciones.filter((_, i) => i !== index)
    });
  };

  const updateRealizacion = (index, field, value) => {
    const newRealizaciones = [...formData.realizaciones];
    newRealizaciones[index] = { ...newRealizaciones[index], [field]: value };
    setFormData({ ...formData, realizaciones: newRealizaciones });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('descripcion', formData.descripcion);
    formDataToSend.append('tipo_evento', formData.tipo_evento);
    formDataToSend.append('costo', formData.costo);
    formDataToSend.append('requiere_inscripcion', formData.requiere_inscripcion);
    formDataToSend.append('cupo_maximo', formData.cupo_maximo);
    formDataToSend.append('estado', formData.estado);
    formDataToSend.append('realizaciones', JSON.stringify(formData.realizaciones));
    
    if (isEditing && imagenActual) {
      formDataToSend.append('imagen_actual', imagenActual);
    }
    
    if (imagenFile) {
      formDataToSend.append('imagen', imagenFile);
    }
    
    await onSave(formDataToSend);
    setLoading(false);
  };

  const getRepositorioNombre = (id) => {
    const repo = repositorios.find(r => r.id_repositorio === id);
    return repo ? repo.nombre : '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
            style={{ zIndex: 10000 }}
          >
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm z-20`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-xl">
                  <CalendarIcon className={`w-6 h-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Descripción *</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={4}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipo de Evento</label>
                  <select
                    name="tipo_evento"
                    value={formData.tipo_evento}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposEvento.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Costo (Bs.)</label>
                  <input
                    type="number"
                    name="costo"
                    value={formData.costo}
                    onChange={handleChange}
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Cupo Máximo</label>
                  <input
                    type="number"
                    name="cupo_maximo"
                    value={formData.cupo_maximo}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Estado</label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                    <option value="finalizado">Finalizado</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiere_inscripcion"
                      checked={formData.requiere_inscripcion}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Requiere inscripción previa</span>
                  </label>
                </div>
              </div>

              {/* Realizaciones */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fechas y Sedes *
                  </label>
                  <button
                    type="button"
                    onClick={addRealizacion}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Agregar fecha
                  </button>
                </div>
                
                <div className="space-y-4 mb-3">
                  {formData.realizaciones.map((real, index) => (
                    <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Realización #{index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeRealizacion(index)}
                          className="text-red-400 hover:text-red-500 text-sm"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Repositorio *</label>
                          <select
                            value={real.id_repositorio}
                            onChange={(e) => updateRealizacion(index, 'id_repositorio', parseInt(e.target.value))}
                            required
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          >
                            <option value="">Seleccionar...</option>
                            {repositorios.map(repo => (
                              <option key={repo.id_repositorio} value={repo.id_repositorio}>
                                {repo.nombre} ({repo.sigla})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Fecha *</label>
                          <input
                            type="date"
                            value={real.fecha}
                            onChange={(e) => updateRealizacion(index, 'fecha', e.target.value)}
                            required
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hora Inicio *</label>
                          <input
                            type="time"
                            value={real.hora_inicio}
                            onChange={(e) => updateRealizacion(index, 'hora_inicio', e.target.value)}
                            required
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hora Fin *</label>
                          <input
                            type="time"
                            value={real.hora_fin}
                            onChange={(e) => updateRealizacion(index, 'hora_fin', e.target.value)}
                            required
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Ubicación en el mapa (coordenadas GPS)
                          </label>
                          <MapPicker
                            value={real.ubicacion_gps || ''}
                            onChange={(coords) => updateRealizacion(index, 'ubicacion_gps', coords)}
                            isDark={isDark}
                            height="250px"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Busca o haz clic en el mapa para seleccionar la ubicación exacta del evento</p>
                        </div>
                        <div className="md:col-span-2">
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación Específica (opcional)</label>
                          <input
                            type="text"
                            value={real.ubicacion_especifica || ''}
                            onChange={(e) => updateRealizacion(index, 'ubicacion_especifica', e.target.value)}
                            placeholder="Sala, auditorio, etc."
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cupos Disponibles</label>
                          <input
                            type="number"
                            value={real.cupos_disponibles || 0}
                            onChange={(e) => updateRealizacion(index, 'cupos_disponibles', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                              ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {formData.realizaciones.length === 0 && (
                  <p className="text-sm text-red-400 mt-2">Debes agregar al menos una fecha de realización</p>
                )}
              </div>

              {/* Imagen */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Imagen del Evento</label>
                <div className="flex items-center gap-4">
                  {imagenPreview && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300">
                      <img src={imagenPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF, WEBP (máx 5MB)</p>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.realizaciones.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventoModal;