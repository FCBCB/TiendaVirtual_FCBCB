import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingLibraryIcon,
  ShoppingBagIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

const SouvenirModal = ({ isOpen, onClose, onSave, souvenir, isEditing, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion_general: '',
    descripcion_especifica: '',
    tipo_souvenir: '',
    material: '',
    dimensiones: '',
    peso: '',
    precio: '',
    repositorios: []
  });
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [imagenPrincipalPreview, setImagenPrincipalPreview] = useState('');
  const [imagenPrincipalActual, setImagenPrincipalActual] = useState('');
  const [imagenesAdicionales, setImagenesAdicionales] = useState([]);
  const [imagenesAdicionalesPreviews, setImagenesAdicionalesPreviews] = useState([]);
  const [imagenesAdicionalesExistentes, setImagenesAdicionalesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [repositorios, setRepositorios] = useState([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [eliminandoImagen, setEliminandoImagen] = useState(false);

  const categorias = ['Llavero', 'Imán', 'Postal', 'Taza', 'Camiseta', 'Gorras', 'Cuadro', 'Otros'];
  const materiales = ['Alpaca', 'Cerámica', 'Madera', 'Textil', 'Metal', 'Cuero', 'Silicona', 'Vidrio', 'Otros'];

  // Obtener repositorios disponibles
  useEffect(() => {
    const fetchRepositorios = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/souvenirs/repositorios/disponibles`, {
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
  if (souvenir && isEditing) {
    console.log('🔍 Modal - Editando souvenir:', souvenir.id_producto);
    console.log('📸 Imágenes adicionales:', souvenir.imagenes_adicionales);
    
    setFormData({
      nombre: souvenir.nombre || '',
      descripcion_general: souvenir.descripcion_general || '',
      descripcion_especifica: souvenir.descripcion_especifica || '',
      tipo_souvenir: souvenir.tipo_souvenir || '',
      material: souvenir.material || '',
      dimensiones: souvenir.dimensiones || '',
      peso: souvenir.peso || '',
      precio: souvenir.precio || '',
      repositorios: souvenir.repositorios_disponibles || []
    });
    
    // Imagen principal
    setImagenPrincipalPreview(getImageUrl(souvenir.imagen_principal));
    setImagenPrincipalActual(souvenir.imagen_principal || '');
    
    // ✅ Forzar carga de imágenes adicionales - asegurar que se muestren
    const imagenes = souvenir.imagenes_adicionales || [];
    console.log(`📸 Modal - ${imagenes.length} imágenes adicionales encontradas`);
    setImagenesAdicionalesExistentes(imagenes);
    setImagenesAEliminar([]);
    
    // Limpiar imágenes nuevas
    setImagenesAdicionales([]);
    setImagenesAdicionalesPreviews([]);
  } else {
    // Resetear todo para nuevo souvenir
    setFormData({
      nombre: '',
      descripcion_general: '',
      descripcion_especifica: '',
      tipo_souvenir: '',
      material: '',
      dimensiones: '',
      peso: '',
      precio: '',
      repositorios: []
    });
    setImagenPrincipalPreview('');
    setImagenPrincipalActual('');
    setImagenPrincipal(null);
    setImagenesAdicionales([]);
    setImagenesAdicionalesPreviews([]);
    setImagenesAdicionalesExistentes([]);
    setImagenesAEliminar([]);
  }
}, [souvenir, isEditing, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar imagen principal
  const handleImagenPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenPrincipal(file);
      setImagenPrincipalPreview(URL.createObjectURL(file));
    }
  };

  // Manejar imágenes adicionales
  const handleImagenesAdicionalesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagenesAdicionales(prev => [...prev, ...files]);
      setImagenesAdicionalesPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  // Eliminar imagen adicional (nueva - sin subir)
  const removeImagenAdicional = (index) => {
    setImagenesAdicionales(prev => prev.filter((_, i) => i !== index));
    setImagenesAdicionalesPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ ELIMINAR IMAGEN ADICIONAL EXISTENTE (DE LA BD) - CON FEEDBACK
  const handleEliminarImagenExistente = async (id_imagen) => {
    if (!confirm('¿Estás seguro de eliminar esta imagen permanentemente?')) return;
    
    setEliminandoImagen(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/souvenirs/imagenes/${id_imagen}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Eliminar de la lista de imágenes existentes
        setImagenesAdicionalesExistentes(prev => prev.filter(img => img.id_imagen !== id_imagen));
        // Mostrar mensaje de éxito
        alert('✅ Imagen eliminada exitosamente');
      } else {
        alert(data.message || 'Error al eliminar la imagen');
      }
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      alert('❌ Error de conexión al eliminar la imagen');
    } finally {
      setEliminandoImagen(false);
    }
  };

  // Agregar repositorio
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
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('descripcion_general', formData.descripcion_general || '');
    formDataToSend.append('descripcion_especifica', formData.descripcion_especifica || '');
    formDataToSend.append('tipo_souvenir', formData.tipo_souvenir || '');
    formDataToSend.append('material', formData.material || '');
    formDataToSend.append('dimensiones', formData.dimensiones || '');
    formDataToSend.append('peso', formData.peso || '');
    formDataToSend.append('precio', formData.precio);
    formDataToSend.append('repositorios', JSON.stringify(formData.repositorios));
    
    if (isEditing && imagenPrincipalActual) {
      formDataToSend.append('imagen_actual', imagenPrincipalActual);
    }
    
    if (imagenPrincipal) {
      formDataToSend.append('imagen', imagenPrincipal);
    }
    
    // Agregar imágenes adicionales nuevas
    for (const img of imagenesAdicionales) {
      formDataToSend.append('imagenes', img);
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
                <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl">
                  <ShoppingBagIcon className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Souvenir' : 'Nuevo Souvenir'}
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
              {/* Campos básicos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Descripción General</label>
                  <textarea
                    name="descripcion_general"
                    value={formData.descripcion_general}
                    onChange={handleChange}
                    rows={2}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Descripción Específica</label>
                  <textarea
                    name="descripcion_especifica"
                    value={formData.descripcion_especifica}
                    onChange={handleChange}
                    rows={3}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Tipo de Souvenir</label>
                  <select
                    name="tipo_souvenir"
                    value={formData.tipo_souvenir}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Material</label>
                  <select
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  >
                    <option value="">Seleccionar...</option>
                    {materiales.map(mat => (
                      <option key={mat} value={mat}>{mat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Dimensiones</label>
                  <input
                    type="text"
                    name="dimensiones"
                    value={formData.dimensiones}
                    onChange={handleChange}
                    placeholder="Ej: 10x5x3 cm"
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Peso (g)</label>
                  <input
                    type="number"
                    name="peso"
                    value={formData.peso}
                    onChange={handleChange}
                    placeholder="Ej: 150"
                    step="0.01"
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                      ${isDark ? 'bg-black/50 border border-white/20 text-white' : 'bg-white border border-gray-300 text-gray-800'}`}
                  />
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
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
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
                            <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
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
                              className={`w-20 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500
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
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar otro repositorio
                      </button>
                    ) : (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <select
                          onChange={(e) => addRepositorio(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500
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

              {/* IMAGEN PRINCIPAL */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Imagen Principal *
                </label>
                <div className="flex items-center gap-4">
                  {imagenPrincipalPreview && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <img src={imagenPrincipalPreview} alt="Principal" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenPrincipalChange}
                    className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF, WEBP (máx 5MB)</p>
              </div>

              {/* IMÁGENES ADICIONALES - CON ELIMINACIÓN FUNCIONAL */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <PhotoIcon className="w-4 h-4 inline mr-1" />
                  Imágenes Adicionales
                </label>
                
                {/* ✅ Imágenes existentes (de la BD) - CON BOTÓN DE ELIMINAR FUNCIONAL */}
                {imagenesAdicionalesExistentes.length > 0 && (
                  <div className="mb-3">
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Imágenes guardadas ({imagenesAdicionalesExistentes.length}):
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {imagenesAdicionalesExistentes.map((img) => (
                        <div 
                          key={img.id_imagen} 
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-500/30 group shadow-lg"
                        >
                          <img 
                            src={getImageUrl(img.imagen_url)} 
                            alt="Adicional" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100/1a2f3a/19ADA0?text=No'; }}
                          />
                          {/* Overlay oscuro al hacer hover */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => handleEliminarImagenExistente(img.id_imagen)}
                              disabled={eliminandoImagen}
                              className={`p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-110 ${
                                eliminandoImagen ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Eliminar imagen"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                          {/* Badge de orden */}
                          <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">
                            #{img.orden !== undefined ? img.orden + 1 : '?'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ Nuevas imágenes adicionales (previews) */}
                {imagenesAdicionalesPreviews.length > 0 && (
                  <div className="mb-3">
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Nuevas imágenes para subir ({imagenesAdicionalesPreviews.length}):
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {imagenesAdicionalesPreviews.map((preview, index) => (
                        <div 
                          key={index} 
                          className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-amber-500/30 group shadow-lg"
                        >
                          <img 
                            src={preview} 
                            alt={`Adicional ${index + 1}`} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() => removeImagenAdicional(index)}
                              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all duration-300 transform hover:scale-110"
                              title="Quitar imagen"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="absolute bottom-1 left-1 bg-amber-500/80 text-white text-[10px] px-2 py-0.5 rounded-full">
                            Nueva
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input para subir nuevas imágenes */}
                <div className="mt-3">
                  <label className={`flex items-center justify-center w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:border-amber-500 ${
                    isDark ? 'border-white/20 hover:bg-white/5' : 'border-gray-300 hover:bg-gray-50'
                  }`}>
                    <div className="text-center">
                      <PhotoIcon className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Haz clic o arrastra imágenes aquí
                      </p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        JPG, PNG, GIF, WEBP (máx 5MB cada una)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagenesAdicionalesChange}
                      className="hidden"
                    />
                  </label>
                </div>
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
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

export default SouvenirModal;