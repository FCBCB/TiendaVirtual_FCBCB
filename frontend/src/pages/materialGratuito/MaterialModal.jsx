import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  BuildingLibraryIcon,
  DocumentIcon,
  MapPinIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

const MaterialModal = ({ isOpen, onClose, onSave, material, isEditing, userInfo }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo_material: '',
    id_autor: '',
    id_categoria: '',
    id_repositorio: '',
    anio_publicacion: '',
    editorial: '',
    idioma: 'es',
    palabras_clave: '',
    visibilidad: true,
    repositorios_adicionales: []
  });
  const [archivoFile, setArchivoFile] = useState(null);
  const [archivoPreview, setArchivoPreview] = useState('');
  const [archivoActual, setArchivoActual] = useState('');
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

  const tiposMaterial = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'imagen', 'video', 'audio', 'zip', 'rar', 'otro'
  ];

  const idiomas = ['es', 'en', 'fr', 'pt', 'it', 'de', 'otro'];

  // Obtener autores, categorías y repositorios
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      const token = localStorage.getItem('token');
      
      // Obtener autores
      setCargandoAutores(true);
      try {
        const autoresRes = await fetch(`${API_URL}/api/material/autores`, {
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
        const categoriasRes = await fetch(`${API_URL}/api/material/categorias`, {
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
        const reposRes = await fetch(`${API_URL}/api/material/repositorios/disponibles`, {
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
    if (material && isEditing) {
      setFormData({
        titulo: material.titulo || '',
        descripcion: material.descripcion || '',
        tipo_material: material.tipo_material || '',
        id_autor: material.id_autor || '',
        id_categoria: material.id_categoria || '',
        id_repositorio: material.id_repositorio || '',
        anio_publicacion: material.anio_publicacion || '',
        editorial: material.editorial || '',
        idioma: material.idioma || 'es',
        palabras_clave: material.palabras_clave || '',
        visibilidad: material.visibilidad !== undefined ? material.visibilidad : true,
        repositorios_adicionales: material.repositorios_adicionales || []
      });
      setArchivoPreview(material.archivo_url || '');
      setArchivoActual(material.archivo_url || '');
      setPortadaPreview(getImageUrl(material.imagen_portada));
      setPortadaActual(material.imagen_portada || '');
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        tipo_material: '',
        id_autor: '',
        id_categoria: '',
        id_repositorio: '',
        anio_publicacion: '',
        editorial: '',
        idioma: 'es',
        palabras_clave: '',
        visibilidad: true,
        repositorios_adicionales: []
      });
      setArchivoPreview('');
      setArchivoActual('');
      setArchivoFile(null);
      setPortadaPreview('');
      setPortadaActual('');
      setPortadaFile(null);
    }
  }, [material, isEditing, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArchivoFile(file);
      setArchivoPreview(URL.createObjectURL(file));
    }
  };

  const handlePortadaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortadaFile(file);
      setPortadaPreview(URL.createObjectURL(file));
    }
  };

  const addRepositorioAdicional = (repositorioId) => {
    const repo = repositorios.find(r => r.id_repositorio === repositorioId);
    if (repo && !formData.repositorios_adicionales.some(r => r.id_repositorio === repositorioId)) {
      setFormData({
        ...formData,
        repositorios_adicionales: [...formData.repositorios_adicionales, repo]
      });
      setShowRepoSelector(false);
    }
  };

  const removeRepositorioAdicional = (repositorioId) => {
    setFormData({
      ...formData,
      repositorios_adicionales: formData.repositorios_adicionales.filter(r => r.id_repositorio !== repositorioId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formDataToSend = new FormData();
    formDataToSend.append('titulo', formData.titulo);
    formDataToSend.append('descripcion', formData.descripcion || '');
    formDataToSend.append('tipo_material', formData.tipo_material);
    formDataToSend.append('id_autor', formData.id_autor || '');
    formDataToSend.append('id_categoria', formData.id_categoria || '');
    formDataToSend.append('id_repositorio', formData.id_repositorio);
    formDataToSend.append('anio_publicacion', formData.anio_publicacion || '');
    formDataToSend.append('editorial', formData.editorial || '');
    formDataToSend.append('idioma', formData.idioma || 'es');
    formDataToSend.append('palabras_clave', formData.palabras_clave || '');
    formDataToSend.append('visibilidad', formData.visibilidad);
    
    // Repositorios adicionales
    const reposIds = formData.repositorios_adicionales.map(r => r.id_repositorio);
    formDataToSend.append('repositorios_adicionales', JSON.stringify(reposIds));
    
    if (isEditing && archivoActual) {
      formDataToSend.append('archivo_actual', archivoActual);
    }
    
    if (isEditing && portadaActual) {
      formDataToSend.append('portada_actual', portadaActual);
    }
    
    if (archivoFile) {
      formDataToSend.append('archivo', archivoFile);
    }
    
    if (portadaFile) {
      formDataToSend.append('portada', portadaFile);
    }
    
    await onSave(formDataToSend);
    setLoading(false);
  };

  const repositoriosDisponibles = repositorios.filter(
    r => !formData.repositorios_adicionales.some(selected => selected.id_repositorio === r.id_repositorio) &&
    r.id_repositorio !== parseInt(formData.id_repositorio)
  );

  const inputCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-teal-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-teal-500'}`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const selectCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-teal-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-teal-500'}`;

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
                <div className="p-2 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-xl">
                  <DocumentIcon className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Material' : 'Nuevo Material'}
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
                  <label className={labelCls}>Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
                    required
                    className={inputCls}
                    placeholder="Ej: Revista Cultural Piedra de Agua N° 1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Descripción del material..."
                  />
                </div>

                <div>
                  <label className={labelCls}>Tipo de Material *</label>
                  <select
                    name="tipo_material"
                    value={formData.tipo_material}
                    onChange={handleChange}
                    required
                    className={selectCls}
                  >
                    <option value="">Seleccionar...</option>
                    {tiposMaterial.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Idioma</label>
                  <select
                    name="idioma"
                    value={formData.idioma}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    {idiomas.map(idioma => (
                      <option key={idioma} value={idioma}>{idioma.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Autor</label>
                  <select
                    name="id_autor"
                    value={formData.id_autor}
                    onChange={handleChange}
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
                  {cargandoAutores && <p className="text-xs text-gray-500 mt-1">Cargando autores...</p>}
                </div>

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
                  {cargandoCategorias && <p className="text-xs text-gray-500 mt-1">Cargando categorías...</p>}
                </div>

                <div>
                  <label className={labelCls}>Año de Publicación</label>
                  <input
                    type="number"
                    name="anio_publicacion"
                    value={formData.anio_publicacion}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: 2013"
                    min="1000"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className={labelCls}>Editorial</label>
                  <input
                    type="text"
                    name="editorial"
                    value={formData.editorial}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: FCBCB"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelCls}>Palabras Clave (tags)</label>
                  <input
                    type="text"
                    name="palabras_clave"
                    value={formData.palabras_clave}
                    onChange={handleChange}
                    className={inputCls}
                    placeholder="Ej: cultura, revista, patrimonio"
                  />
                </div>
              </div>

              {/* Repositorio Principal */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={labelCls}>Repositorio Principal *</label>
                <select
                  name="id_repositorio"
                  value={formData.id_repositorio}
                  onChange={handleChange}
                  required
                  className={selectCls}
                >
                  <option value="">Seleccionar repositorio...</option>
                  {repositorios.map(repo => (
                    <option key={repo.id_repositorio} value={repo.id_repositorio}>
                      {repo.nombre} - {repo.direccion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Repositorios Adicionales */}
              <div>
                <label className={labelCls}>Repositorios Adicionales</label>
                <div className="space-y-2 mb-2">
                  {formData.repositorios_adicionales.map((repo) => (
                    <div key={repo.id_repositorio} className={`flex items-center justify-between p-2.5 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                      <div className="flex items-center gap-2">
                        <BuildingLibraryIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>{repo.nombre}</span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>({repo.sigla})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRepositorioAdicional(repo.id_repositorio)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {repositoriosDisponibles.length > 0 && (
                  <div className="relative">
                    {!showRepoSelector ? (
                      <button
                        type="button"
                        onClick={() => setShowRepoSelector(true)}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-teal-500/20 hover:bg-teal-500/30 text-teal-400 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Agregar otro repositorio
                      </button>
                    ) : (
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                        <select
                          onChange={(e) => addRepositorioAdicional(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500
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
              </div>

              {/* Visibilidad */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="visibilidad"
                    checked={formData.visibilidad}
                    onChange={handleChange}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <div>
                    <label className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {formData.visibilidad ? '👁️ Público' : '🔒 Oculto'}
                    </label>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formData.visibilidad 
                        ? 'Visible para todos los usuarios' 
                        : 'Oculto, solo visible para administradores y responsables'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Archivo */}
              <div className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={labelCls}>Archivo *</label>
                <div className="flex items-center gap-4">
                  {archivoPreview && (
                    <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                      <DocumentIcon className={`w-8 h-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                      <p className={`text-xs truncate max-w-[100px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {archivoPreview.split('/').pop() || 'Archivo'}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                    onChange={handleArchivoChange}
                    className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, PPT, ZIP, RAR (máx 50MB)</p>
              </div>

              {/* Portada */}
              <div>
                <label className={labelCls}>Imagen de Portada (opcional)</label>
                <div className="flex items-center gap-4">
                  {portadaPreview && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <img src={portadaPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortadaChange}
                    className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP (máx 5MB)</p>
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
                  disabled={loading || !formData.titulo || !formData.tipo_material || !formData.id_repositorio || !archivoFile && !isEditing}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

export default MaterialModal;