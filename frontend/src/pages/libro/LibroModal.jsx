import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingLibraryIcon,
  BookOpenIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  GlobeAltIcon,
  TagIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

const LibroModal = ({ isOpen, onClose, onSave, libro, isEditing, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion_general: '',
    descripcion_especifica: '',
    precio: '',
    id_autor: '',
    id_categoria: '',
    titulo_libro: '',
    reseña: '',
    tema: '',
    editorial: '',
    anio_publicacion: '',
    isbn: '',
    repositorios: [],
    // ✅ CAMPOS DE DESCUENTO
    descuento_porcentaje: '',
    fecha_inicio_descuento: '',
    fecha_fin_descuento: '',
    tipo_descuento: 'normal',
    motivo_descuento: ''
  });
  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [portadaActual, setPortadaActual] = useState('');
  const [loading, setLoading] = useState(false);
  const [autores, setAutores] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [repositorios, setRepositorios] = useState([]);
  const [showRepoSelector, setShowRepoSelector] = useState(false);
  const [cargandoAutores, setCargandoAutores] = useState(false);
  const [cargandoCategorias, setCargandoCategorias] = useState(false);

  // Obtener autores, categorías y repositorios
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      const token = localStorage.getItem('token');
      
      // Obtener autores
      setCargandoAutores(true);
      try {
        const autoresRes = await fetch(`${API_URL}/api/libros/autores`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const autoresData = await autoresRes.json();
        if (autoresRes.ok) {
          setAutores(autoresData.autores || []);
        }
      } catch (error) {
        console.error('Error fetching autores:', error);
      } finally {
        setCargandoAutores(false);
      }
      
      // Obtener categorías
      setCargandoCategorias(true);
      try {
        const categoriasRes = await fetch(`${API_URL}/api/libros/categorias`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const categoriasData = await categoriasRes.json();
        if (categoriasRes.ok) {
          setCategorias(categoriasData.categorias || []);
        }
      } catch (error) {
        console.error('Error fetching categorias:', error);
      } finally {
        setCargandoCategorias(false);
      }
      
      // Obtener repositorios
      try {
        const reposRes = await fetch(`${API_URL}/api/libros/repositorios/disponibles`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const reposData = await reposRes.json();
        if (reposRes.ok) {
          let repos = reposData.repositorios || [];
          if (userInfo?.rol === 'responsable' && userInfo?.id_repositorio_asignado) {
            repos = repos.filter(r => r.id_repositorio === userInfo.id_repositorio_asignado);
          }
          setRepositorios(repos);
        }
      } catch (error) {
        console.error('Error fetching repositorios:', error);
      }
    };
    
    fetchData();
  }, [isOpen, userInfo]);

  useEffect(() => {
    if (libro && isEditing) {
      setFormData({
        nombre: libro.nombre || '',
        descripcion_general: libro.descripcion_general || '',
        descripcion_especifica: libro.descripcion_especifica || '',
        precio: libro.precio || '',
        id_autor: libro.id_autor || '',
        id_categoria: libro.id_categoria || '',
        titulo_libro: libro.titulo_libro || '',
        reseña: libro.reseña || '',
        tema: libro.tema || '',
        editorial: libro.editorial || '',
        anio_publicacion: libro.anio_publicacion || '',
        isbn: libro.isbn || '',
        repositorios: libro.repositorios_disponibles || [],
        // ✅ CARGAR DATOS DE DESCUENTO
        descuento_porcentaje: libro.descuento_porcentaje || '',
        fecha_inicio_descuento: libro.fecha_inicio_descuento ? 
          new Date(libro.fecha_inicio_descuento).toISOString().slice(0, 16) : '',
        fecha_fin_descuento: libro.fecha_fin_descuento ? 
          new Date(libro.fecha_fin_descuento).toISOString().slice(0, 16) : '',
        tipo_descuento: libro.tipo_descuento || 'normal',
        motivo_descuento: libro.motivo_descuento || ''
      });
      setPortadaPreview(getImageUrl(libro.portada_libro || libro.imagen_principal));
      setPortadaActual(libro.portada_libro || libro.imagen_principal || '');
    } else {
      setFormData({
        nombre: '',
        descripcion_general: '',
        descripcion_especifica: '',
        precio: '',
        id_autor: '',
        id_categoria: '',
        titulo_libro: '',
        reseña: '',
        tema: '',
        editorial: '',
        anio_publicacion: '',
        isbn: '',
        repositorios: [],
        descuento_porcentaje: '',
        fecha_inicio_descuento: '',
        fecha_fin_descuento: '',
        tipo_descuento: 'normal',
        motivo_descuento: ''
      });
      setPortadaPreview('');
      setPortadaActual('');
      setPortadaFile(null);
    }
  }, [libro, isEditing, isOpen]);

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
    formDataToSend.append('nombre', formData.nombre);
    formDataToSend.append('descripcion_general', formData.descripcion_general || '');
    formDataToSend.append('descripcion_especifica', formData.descripcion_especifica || '');
    formDataToSend.append('precio', formData.precio);
    formDataToSend.append('id_autor', formData.id_autor);
    formDataToSend.append('id_categoria', formData.id_categoria || '');
    formDataToSend.append('titulo_libro', formData.titulo_libro);
    formDataToSend.append('reseña', formData.reseña || '');
    formDataToSend.append('tema', formData.tema || '');
    formDataToSend.append('editorial', formData.editorial || '');
    formDataToSend.append('anio_publicacion', formData.anio_publicacion || '');
    formDataToSend.append('isbn', formData.isbn || '');
    formDataToSend.append('repositorios', JSON.stringify(formData.repositorios));
    
    // ✅ ENVIAR DATOS DE DESCUENTO
    formDataToSend.append('descuento_porcentaje', formData.descuento_porcentaje || 0);
    formDataToSend.append('fecha_inicio_descuento', formData.fecha_inicio_descuento || '');
    formDataToSend.append('fecha_fin_descuento', formData.fecha_fin_descuento || '');
    formDataToSend.append('tipo_descuento', formData.tipo_descuento || 'normal');
    formDataToSend.append('motivo_descuento', formData.motivo_descuento || '');
    
    if (isEditing && portadaActual) {
      formDataToSend.append('portada_actual', portadaActual);
      formDataToSend.append('imagen_actual', portadaActual);
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

  const inputCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-blue-500'}`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const selectCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-blue-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-blue-500'}`;

  // Calcular precio con descuento para vista previa
  const calcularPrecioConDescuento = () => {
    const precio = parseFloat(formData.precio) || 0;
    const descuento = parseFloat(formData.descuento_porcentaje) || 0;
    return precio - (precio * descuento / 100);
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
                <div className="p-2 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl">
                  <BookOpenIcon className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Libro' : 'Nuevo Libro'}
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
                {/* Nombre del producto */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Nombre del Producto *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className={inputCls}
                    placeholder="Ej: Cien años de soledad"
                  />
                </div>

                {/* Título del libro */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Título del Libro *</label>
                  <input
                    type="text"
                    name="titulo_libro"
                    value={formData.titulo_libro}
                    onChange={handleChange}
                    required
                    className={inputCls}
                    placeholder="Ej: Cien años de soledad (título exacto)"
                  />
                </div>

                {/* Autor */}
                <div>
                  <label className={labelCls}>Autor *</label>
                  <select
                    name="id_autor"
                    value={formData.id_autor}
                    onChange={handleChange}
                    required
                    className={selectCls}
                    disabled={cargandoAutores}
                  >
                    <option value="">Seleccionar autor...</option>
                    {autores.map(autor => (
                      <option key={autor.id_autor} value={autor.id_autor}>
                        {autor.nombre_completo || `${autor.nombre} ${autor.apellido}`}
                      </option>
                    ))}
                  </select>
                  {cargandoAutores && (
                    <p className="text-xs text-gray-500 mt-1">Cargando autores...</p>
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select
                    name="id_categoria"
                    value={formData.id_categoria}
                    onChange={handleChange}
                    className={selectCls}
                    disabled={cargandoCategorias}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map(cat => (
                      <option key={cat.id_categoria} value={cat.id_categoria}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                  {cargandoCategorias && (
                    <p className="text-xs text-gray-500 mt-1">Cargando categorías...</p>
                  )}
                </div>

                {/* ISBN */}
                <div>
                  <label className={labelCls}>ISBN</label>
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: 978-84-376-0494-7"
                  />
                </div>

                {/* Año de Publicación */}
                <div>
                  <label className={labelCls}>Año de Publicación</label>
                  <input
                    type="number"
                    name="anio_publicacion"
                    value={formData.anio_publicacion}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: 1967"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>

                {/* Editorial */}
                <div>
                  <label className={labelCls}>Editorial</label>
                  <input
                    type="text"
                    name="editorial"
                    value={formData.editorial}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: Sudamericana"
                  />
                </div>

                {/* Tema */}
                <div>
                  <label className={labelCls}>Tema</label>
                  <input
                    type="text"
                    name="tema"
                    value={formData.tema}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: Realismo mágico, Literatura latinoamericana"
                  />
                </div>

                {/* Precio */}
                <div>
                  <label className={labelCls}>Precio (Bs.) *</label>
                  <input
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    step="0.01"
                    required
                    className={inputCls}
                    placeholder="Ej: 120.00"
                  />
                </div>

                {/* ✅ SECCIÓN DE DESCUENTOS */}
                {(userInfo?.rol === 'admin' || userInfo?.rol === 'responsable') && (
                  <div className="md:col-span-2">
                    <div className={`mt-2 p-4 rounded-xl ${isDark ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                      <label className={`flex items-center gap-2 text-sm font-medium mb-3 ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                        <TagIcon className="w-4 h-4" />
                        🏷️ Configurar Descuento
                      </label>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Porcentaje de descuento */}
                        <div>
                          <label className={labelCls}>% Descuento</label>
                          <input
                            type="number"
                            name="descuento_porcentaje"
                            value={formData.descuento_porcentaje}
                            onChange={handleChange}
                            min="0"
                            max="100"
                            className={inputCls}
                            placeholder="Ej: 20"
                          />
                          <p className="text-xs text-gray-500 mt-1">0 = sin descuento</p>
                        </div>
                        
                        {/* Tipo de descuento */}
                        <div>
                          <label className={labelCls}>Tipo de descuento</label>
                          <select
                            name="tipo_descuento"
                            value={formData.tipo_descuento}
                            onChange={handleChange}
                            className={selectCls}
                          >
                            <option value="normal">Normal</option>
                            <option value="especial">Especial</option>
                            <option value="flash">Flash (tiempo limitado)</option>
                            <option value="preventa">Preventa</option>
                          </select>
                        </div>
                        
                        {/* Fecha inicio */}
                        <div>
                          <label className={labelCls}>Fecha inicio descuento</label>
                          <input
                            type="datetime-local"
                            name="fecha_inicio_descuento"
                            value={formData.fecha_inicio_descuento}
                            onChange={handleChange}
                            className={inputCls}
                          />
                        </div>
                        
                        {/* Fecha fin */}
                        <div>
                          <label className={labelCls}>Fecha fin descuento</label>
                          <input
                            type="datetime-local"
                            name="fecha_fin_descuento"
                            value={formData.fecha_fin_descuento}
                            onChange={handleChange}
                            className={inputCls}
                          />
                        </div>
                        
                        {/* Motivo del descuento */}
                        <div className="md:col-span-2">
                          <label className={labelCls}>Motivo del descuento</label>
                          <input
                            type="text"
                            name="motivo_descuento"
                            value={formData.motivo_descuento}
                            onChange={handleChange}
                            className={inputCls}
                            placeholder="Ej: Promoción de verano, Liquidación, Oferta especial..."
                          />
                        </div>
                      </div>
                      
                      {/* Vista previa del precio con descuento */}
                      {formData.descuento_porcentaje > 0 && formData.precio && (
                        <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-100/50 border border-amber-300'}`}>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <span className="text-sm text-gray-500">Precio original:</span>
                              <span className="ml-2 font-semibold">Bs. {parseFloat(formData.precio).toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Descuento:</span>
                              <span className="ml-2 font-semibold text-amber-600">{formData.descuento_porcentaje}%</span>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Precio final:</span>
                              <span className="ml-2 text-lg font-bold text-amber-600">
                                Bs. {calcularPrecioConDescuento().toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Descripciones */}
                <div className="md:col-span-2">
                  <label className={labelCls}>Descripción General</label>
                  <textarea
                    name="descripcion_general"
                    value={formData.descripcion_general}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="Descripción breve del libro..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Descripción Específica</label>
                  <textarea
                    name="descripcion_especifica"
                    value={formData.descripcion_especifica}
                    onChange={handleChange}
                    rows={2}
                    className={`${inputCls} resize-none`}
                    placeholder="Detalles específicos del libro..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Reseña</label>
                  <textarea
                    name="reseña"
                    value={formData.reseña}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="Reseña completa del libro..."
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
                            <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
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
                              className={`w-20 px-2 py-1 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500
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
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar otro repositorio
                      </button>
                    ) : (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <select
                          onChange={(e) => addRepositorio(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500
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
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Portada del Libro</label>
                <div className="flex items-center gap-4">
                  {portadaPreview && (
                    <div className="w-24 h-32 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
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
                  className={`flex-1 px-4 py-2.5 rounded-lg transition-all duration-300
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || formData.repositorios.length === 0 || !formData.id_autor || !formData.titulo_libro}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

export default LibroModal;