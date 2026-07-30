import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingLibraryIcon,
  PhotoIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ArchiveBoxIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

const CatalogoModal = ({ isOpen, onClose, onSave, catalogo, isEditing, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    titulo: '',
    curaduria: '',
    reseña: '',
    anio_publicacion: '',
    formato: '',
    precio: '',
    repositorios: []
  });
  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [portadaActual, setPortadaActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [repositorios, setRepositorios] = useState([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);

  const formatos = ['Digital', 'Impreso', 'Físico', 'Catálogo de Exposición', 'Guía', 'Otros'];

  useEffect(() => {
    const fetchRepositorios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/catalogos/repositorios/disponibles`, {
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
    if (catalogo && isEditing) {
      setFormData({
        titulo: catalogo.titulo || '',
        curaduria: catalogo.curaduria || '',
        reseña: catalogo.reseña || '',
        anio_publicacion: catalogo.anio_publicacion || '',
        formato: catalogo.formato || '',
        precio: catalogo.precio || '',
        repositorios: catalogo.repositorios_disponibles || []
      });
      setPortadaPreview(getImageUrl(catalogo.portada_url));
      setPortadaActual(catalogo.portada_url || '');
    } else {
      setFormData({
        titulo: '',
        curaduria: '',
        reseña: '',
        anio_publicacion: '',
        formato: '',
        precio: '',
        repositorios: []
      });
      setPortadaPreview('');
      setPortadaActual('');
      setPortadaFile(null);
    }
  }, [catalogo, isEditing, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  const addRepositorio = (repositorioId) => {
    const repo = repositorios.find(r => r.id_repositorio === repositorioId);
    if (repo && !formData.repositorios.some(r => r.id_repositorio === repositorioId)) {
      setFormData({
        ...formData,
        repositorios: [...formData.repositorios, { 
          id_repositorio: repo.id_repositorio,
          nombre: repo.nombre,
          sigla: repo.sigla,
          direccion: repo.direccion,
          ubicacion_gps: repo.ubicacion_gps,
          stock: 0
        }]
      });
      setShowRepoSelector(false);
    }
  };

  const removeRepositorio = (repositorioId) => {
    setFormData({
      ...formData,
      repositorios: formData.repositorios.filter(r => r.id_repositorio !== repositorioId)
    });
  };

  const updateStock = (repositorioId, stock) => {
    setFormData({
      ...formData,
      repositorios: formData.repositorios.map(r => 
        r.id_repositorio === repositorioId ? { ...r, stock: parseInt(stock) || 0 } : r
      )
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('curaduria', formData.curaduria);
    formDataToSend.append('reseña', formData.reseña);
    formDataToSend.append('anio_publicacion', formData.anio_publicacion);
    formDataToSend.append('formato', formData.formato);
    formDataToSend.append('precio', formData.precio);
    formDataToSend.append('repositorios', JSON.stringify(formData.repositorios));
    
    if (isEditing && portadaActual) {
      formDataToSend.append('portada_actual', portadaActual);
    }
    
    if (portadaFile) {
      formDataToSend.append('portada', portadaFile);
    }
    
    await onSave(formDataToSend);
    setLoading(false);
  };

  const repositoriosDisponibles = repositorios.filter(
    r => !formData.repositorios.some(selected => selected.id_repositorio === r.id_repositorio)
  );

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
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
                <div className="p-2 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl">
                  <PhotoIcon className={`w-6 h-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Catálogo' : 'Nuevo Catálogo'}
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
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Curador</label>
                  <input
                    type="text"
                    name="curaduria"
                    value={formData.curaduria}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Año de Publicación</label>
                  <input
                    type="number"
                    name="anio_publicacion"
                    value={formData.anio_publicacion}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Formato</label>
                  <select
                    name="formato"
                    value={formData.formato}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {formatos.map(fmt => (
                      <option key={fmt} value={fmt}>{fmt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Precio (Bs.) *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reseña</label>
                  <textarea
                    name="reseña"
                    value={formData.reseña}
                    onChange={handleChange}
                    rows={4}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>
              </div>

              {/* Selección de Repositorios */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Repositorios donde está disponible *
                </label>
                
                <div className="space-y-3 mb-3">
                  {formData.repositorios.map((repo) => (
                    <div key={repo.id_repositorio} className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({repo.sigla})</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPinIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{repo.direccion}</span>
                            {repo.ubicacion_gps && (
                              <button
                                type="button"
                                onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                                className="text-xs text-teal-500 hover:text-teal-400"
                              >
                                Ver mapa
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock:</label>
                            <input
                              type="number"
                              value={repo.stock}
                              onChange={(e) => updateStock(repo.id_repositorio, e.target.value)}
                              className={`w-20 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500
                                ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeRepositorio(repo.id_repositorio)}
                            className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {repositoriosDisponibles.length > 0 && (
                  <div className="relative">
                    {!showRepoSelector ? (
                      <button
                        type="button"
                        onClick={() => setShowRepoSelector(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar otro repositorio
                      </button>
                    ) : (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <select
                          onChange={(e) => addRepositorio(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500
                            ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                          value=""
                        >
                          <option value="">Seleccionar repositorio...</option>
                          {repositoriosDisponibles.map(repo => (
                            <option key={repo.id_repositorio} value={repo.id_repositorio}>
                              {repo.nombre} - {repo.direccion}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => setShowRepoSelector(false)}
                          className="mt-2 text-xs text-gray-500 hover:text-gray-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {formData.repositorios.length === 0 && (
                  <p className="text-sm text-red-400 mt-2">Debes seleccionar al menos un repositorio</p>
                )}
              </div>

              {/* Portada */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Portada del Catálogo</label>
                <div className="flex items-center gap-4">
                  {portadaPreview && (
                    <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-300">
                      <img src={portadaPreview} alt="Preview" className="w-full h-full object-cover" />
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
                  disabled={loading || formData.repositorios.length === 0}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

export default CatalogoModal;