import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BuildingLibraryIcon, 
  MapPinIcon, 
  ClockIcon, 
  PhoneIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../components/config/api';
import MapPickerWrapper from '../components/MapPickerWrapper';

// ── RepositorioCard ───────────────────────────────────────────────────────────
const RepositorioCard = ({ repositorio, onEdit, onDelete, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  const getStatusColor = (activo) =>
    activo === true ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';

  const portadaUrl = getImageUrl(repositorio.portada_representativa);
  const logoUrl = getImageUrl(repositorio.logo_repositorio);

  const openGoogleMaps = () => {
    if (repositorio.ubicacion_gps) {
      const coords = repositorio.ubicacion_gps.split(',');
      if (coords.length === 2) {
        window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank');
      }
    } else if (repositorio.direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(repositorio.direccion)}`, '_blank');
    }
  };

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
        
        <div className="relative h-56 overflow-hidden">
          <img
            src={portadaUrl || 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Imagen+no+disponible'}
            alt={repositorio.nombre}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Imagen+no+disponible'; }}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/40 to-transparent' : 'from-gray-900/60 via-gray-900/20 to-transparent'}`} />
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(repositorio.activo)} backdrop-blur-sm shadow-lg`}>
              {repositorio.activo ? '● Activo' : '● Inactivo'}
            </span>
          </div>
          <div className="absolute -bottom-8 left-4">
            <div className={`w-20 h-20 rounded-xl backdrop-blur-md border-2 flex items-center justify-center shadow-xl
              ${isDark ? 'bg-black/60 border-white/30' : 'bg-white/90 border-gray-300'}`}>
              <img
                src={logoUrl || `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`}
                alt={repositorio.sigla}
                className="w-14 h-14 object-contain"
                onError={(e) => { e.target.src = `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`; }}
              />
            </div>
          </div>
        </div>

        <div className="p-5 pt-12">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-colors line-clamp-1 ${isDark ? 'text-white group-hover:text-teal-400' : 'text-gray-800 group-hover:text-teal-600'}`}>
                {repositorio.nombre}
              </h3>
              <p className={`text-sm font-mono mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{repositorio.sigla}</p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <MapPinIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className="truncate">{repositorio.direccion}</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <ClockIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className="truncate">{repositorio.horario_atencion || 'Horario no especificado'}</span>
            </div>
            <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <PhoneIcon className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span>{repositorio.telefono || 'No disponible'}</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2 py-1 rounded-lg text-xs ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
              {repositorio.departamento || 'Departamento no especificado'}
            </span>
            {(repositorio.ubicacion_gps || repositorio.direccion) && (
              <button
                onClick={openGoogleMaps}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all duration-200 hover:scale-105
                  ${isDark ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'}`}
              >
                <MapPinIcon className="w-3 h-3" />
                <span>Ubicación</span>
              </button>
            )}
          </div>

          <div className={`flex gap-2 mt-5 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button onClick={() => onView(repositorio)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <EyeIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver</span>
            </button>
            <button onClick={() => onEdit(repositorio)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <PencilSquareIcon className={`w-4 h-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Editar</span>
            </button>
            <button onClick={() => onDelete(repositorio)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300">
              <TrashIcon className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── RepositorioModal ──────────────────────────────────────────────────────────
const RepositorioModal = ({ isOpen, onClose, onSave, repositorio, isEditing }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    nombre: '', sigla: '', direccion: '', telefono: '',
    horario_atencion: '', departamento: '', ubicacion_gps: '', estado: 'activo'
  });
  const [portadaFile, setPortadaFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [portadaActual, setPortadaActual] = useState('');
  const [logoActual, setLogoActual] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (repositorio && isEditing) {
      setFormData({
        nombre: repositorio.nombre || '',
        sigla: repositorio.sigla || '',
        direccion: repositorio.direccion || '',
        telefono: repositorio.telefono || '',
        horario_atencion: repositorio.horario_atencion || '',
        departamento: repositorio.departamento || '',
        ubicacion_gps: repositorio.ubicacion_gps || '',
        estado: repositorio.activo ? 'activo' : 'inactivo'
      });
      setPortadaPreview(getImageUrl(repositorio.portada_representativa));
      setLogoPreview(getImageUrl(repositorio.logo_repositorio));
      setPortadaActual(repositorio.portada_representativa || '');
      setLogoActual(repositorio.logo_repositorio || '');
    } else {
      setFormData({ nombre: '', sigla: '', direccion: '', telefono: '', horario_atencion: '', departamento: '', ubicacion_gps: '', estado: 'activo' });
      setPortadaPreview('');
      setLogoPreview('');
      setPortadaActual('');
      setLogoActual('');
    }
  }, [repositorio, isEditing, isOpen]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === 'portada') { setPortadaFile(file); setPortadaPreview(URL.createObjectURL(file)); }
    else { setLogoFile(file); setLogoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    Object.keys(formData).forEach(k => { 
      if (formData[k] !== null && formData[k] !== undefined && formData[k] !== '') {
        fd.append(k, formData[k]);
      }
    });
    if (isEditing) {
      if (portadaActual) fd.append('portada_actual', portadaActual);
      if (logoActual) fd.append('logo_actual', logoActual);
    }
    if (portadaFile) fd.append('portada', portadaFile);
    if (logoFile) fd.append('logo', logoFile);
    await onSave(fd);
    setLoading(false);
  };

  const departamentos = ['La Paz', 'Cochabamba', 'Santa Cruz', 'Chuquisaca', 'Potosí', 'Oruro', 'Tarija', 'Beni', 'Pando'];
  const inputCls = `w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-teal-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-teal-500'}`;
  const labelCls = `block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border z-[10000]
              ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b z-10
              ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-xl">
                  <BuildingLibraryIcon className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Repositorio' : 'Nuevo Repositorio'}
                </h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={labelCls}>Nombre *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Sigla</label>
                  <input type="text" name="sigla" value={formData.sigla} onChange={handleChange} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Dirección *</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Horario de Atención</label>
                  <input type="text" name="horario_atencion" value={formData.horario_atencion} onChange={handleChange} placeholder="Lunes a Viernes 09:00-18:00" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Departamento</label>
                  <select name="departamento" value={formData.departamento} onChange={handleChange} className={inputCls}>
                    <option value="">Seleccionar...</option>
                    {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select name="estado" value={formData.estado} onChange={handleChange} className={inputCls}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* MapPickerWrapper */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`${labelCls} mb-2`}>Ubicación GPS (para mapa)</label>
                <MapPickerWrapper
                  isOpen={isOpen}
                  value={formData.ubicacion_gps}
                  onChange={(coords) => setFormData({ ...formData, ubicacion_gps: coords })}
                  isDark={isDark}
                  height="380px"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Busca una dirección o haz clic en el mapa para seleccionar un punto
                </p>
              </div>

              {/* Imagen de portada */}
              <div className={`pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                <label className={`${labelCls} mb-2`}>Imagen de Portada</label>
                <div className="flex items-center gap-4">
                  {portadaPreview && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <img src={portadaPreview} alt="Portada" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'portada')} className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP (máx 5MB)</p>
              </div>

              {/* Logo */}
              <div>
                <label className={`${labelCls} mb-2`}>Logo del Repositorio</label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className={`flex-1 ${isDark ? 'text-white' : 'text-gray-700'}`} />
                </div>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, WEBP (máx 5MB)</p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-6">
                <button type="button" onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all duration-300
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50">
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

// ── RepositorioDetalleModal ───────────────────────────────────────────────────
const RepositorioDetalleModal = ({ repositorio, onClose, onEdit }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(repositorio.portada_representativa);
  const logoUrl = getImageUrl(repositorio.logo_repositorio);

  const openGoogleMaps = () => {
    if (repositorio.ubicacion_gps) {
      const coords = repositorio.ubicacion_gps.split(',');
      if (coords.length === 2) {
        window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank');
      }
    } else if (repositorio.direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(repositorio.direccion)}`, '_blank');
    }
  };

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
              <div className="p-2 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-xl">
                <BuildingLibraryIcon className={`w-6 h-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Detalles del Repositorio</h2>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { onEdit(); onClose(); }} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              </button>
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="relative rounded-xl overflow-hidden mb-6">
              <img src={portadaUrl || 'https://placehold.co/800x400/1a2f3a/19ADA0?text=No+Image'} alt={repositorio.nombre} className="w-full h-64 object-cover"
                onError={(e) => { e.target.src = 'https://placehold.co/800x400/1a2f3a/19ADA0?text=No+Image'; }} />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm
                  ${repositorio.activo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {repositorio.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center shadow-lg
                ${isDark ? 'bg-black/50 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}>
                <img src={logoUrl || `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`} alt={repositorio.sigla} className="w-16 h-16 object-contain"
                  onError={(e) => { e.target.src = `https://placehold.co/80x80/19ADA0/white?text=${repositorio.sigla?.substring(0, 2) || 'R'}`; }} />
              </div>
              <div className="flex-1">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{repositorio.nombre}</h3>
                <p className={`text-lg font-mono mt-1 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{repositorio.sigla}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Dirección', value: repositorio.direccion },
                { label: 'Teléfono', value: repositorio.telefono || 'No disponible' },
                { label: 'Horario de Atención', value: repositorio.horario_atencion || 'No especificado' },
                { label: 'Departamento', value: repositorio.departamento || 'No especificado' },
              ].map(({ label, value }) => (
                <div key={label} className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
                  <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</p>
                </div>
              ))}
            </div>

            {repositorio.ubicacion_gps && (
              <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-teal-500/10 border border-teal-500/30' : 'bg-teal-50 border border-teal-200'}`}>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ubicación GPS</p>
                <p className={`text-lg font-mono ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>{repositorio.ubicacion_gps}</p>
                <button onClick={openGoogleMaps}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors text-sm">
                  <MapPinIcon className="w-4 h-4" />
                  Ver en Google Maps
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/10">
              <div className="flex items-center justify-end gap-2">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Creado el {new Date(repositorio.fecha_creacion).toLocaleDateString('es-BO')}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── HeroSection ───────────────────────────────────────────────────────────────
const HeroSection = ({ onAdd, stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-teal-500/20 via-teal-500/10 to-transparent' : 'from-teal-400/30 via-teal-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=1600')] bg-cover bg-center opacity-20" />
      <div className="relative px-8 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-teal-500/20 to-teal-600/20 rounded-full">
              <BuildingLibraryIcon className={`w-12 h-12 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r
            ${isDark ? 'from-white via-teal-400 to-white' : 'from-gray-800 via-teal-600 to-gray-800'}`}>
            Repositorios Culturales
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Gestiona todos los repositorios, museos y centros culturales de la Fundación Cultural BCB
          </p>
          <div className="flex justify-center gap-8 mb-8">
            {[
              { val: stats.total, label: 'Total Repositorios', color: 'teal' },
              { val: stats.activos, label: 'Activos', color: 'emerald' },
              { val: stats.departamentos, label: 'Departamentos', color: 'teal' },
            ].map(({ val, label, color }) => (
              <div key={label} className="text-center">
                <div className={`text-2xl font-bold ${isDark ? `text-${color}-400` : `text-${color}-600`}`}>{val}</div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</div>
              </div>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            <PlusIcon className="w-5 h-5" />
            Nuevo Repositorio
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// ── Repositorios (componente principal) ───────────────────────────────────────
const Repositorios = () => {
  const [repositorios, setRepositorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRepositorio, setSelectedRepositorio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [filterDepartamento, setFilterDepartamento] = useState('todos');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const fetchRepositorios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/repositorios/admin/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setRepositorios(data.repositorios || []);
      } else {
        showToast(data.message || 'Error al cargar repositorios', 'error');
      }
    } catch (error) {
      console.error('Error fetching repositorios:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRepositorios(); }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const departamentos = ['todos', ...new Set(repositorios.map(r => r.departamento).filter(Boolean))];

  const filteredRepositorios = repositorios.filter(repo => {
    const q = searchTerm.toLowerCase();
    return (
      (repo.nombre?.toLowerCase().includes(q) || repo.sigla?.toLowerCase().includes(q) || repo.direccion?.toLowerCase().includes(q)) &&
      (filterEstado === 'todos' || repo.activo === (filterEstado === 'activo')) &&
      (filterDepartamento === 'todos' || repo.departamento === filterDepartamento)
    );
  });

  const stats = {
    total: repositorios.length,
    activos: repositorios.filter(r => r.activo === true).length,
    departamentos: new Set(repositorios.map(r => r.departamento).filter(Boolean)).size
  };

  const handleAdd = () => { setSelectedRepositorio(null); setIsModalOpen(true); };
  const handleEdit = (r) => { setSelectedRepositorio(r); setIsModalOpen(true); };
  const handleView = (r) => { setSelectedRepositorio(r); setIsDetailOpen(true); };

  const handleDelete = async (repositorio) => {
    if (!confirm(`¿Estás seguro de eliminar "${repositorio.nombre}"?`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/repositorios/${repositorio.id_repositorio}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast('✅ Repositorio eliminado exitosamente', 'success');
        fetchRepositorios();
      } else {
        showToast(data.message || 'Error al eliminar', 'error');
      }
    } catch (error) {
      console.error('Error deleting repositorio:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedRepositorio
        ? `${API_URL}/api/repositorios/${selectedRepositorio.id_repositorio}`
        : `${API_URL}/api/repositorios`;
      const method = selectedRepositorio ? 'PUT' : 'POST';
      
      const res = await fetch(url, { 
        method, 
        headers: { 'Authorization': `Bearer ${token}` }, 
        body: formData 
      });
      const data = await res.json();
      if (res.ok) {
        showToast(selectedRepositorio ? '✅ Repositorio actualizado' : '✅ Repositorio creado', 'success');
        setIsModalOpen(false);
        setSelectedRepositorio(null);
        fetchRepositorios();
      } else {
        showToast(data.message || 'Error al guardar', 'error');
      }
    } catch (error) {
      console.error('Error saving repositorio:', error);
      showToast('Error de conexión', 'error');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto" />
        <p className="mt-4 text-gray-400">Cargando repositorios...</p>
      </div>
    </div>
  );

  const selectCls = `px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`;

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
          <HeroSection onAdd={handleAdd} stats={stats} />

          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input type="text" placeholder="Buscar por nombre, sigla o dirección..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`} />
              </div>
              <div className="flex flex-wrap gap-3">
                <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={selectCls}>
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                <select value={filterDepartamento} onChange={(e) => setFilterDepartamento(e.target.value)} className={selectCls}>
                  {departamentos.map(d => <option key={d} value={d}>{d === 'todos' ? 'Todos los departamentos' : d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredRepositorios.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{repositorios.length}</span> repositorios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRepositorios.map((r) => (
                <RepositorioCard key={r.id_repositorio} repositorio={r}
                  onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />
              ))}
            </AnimatePresence>
          </div>

          {filteredRepositorios.length === 0 && (
            <div className="text-center py-16">
              <BuildingLibraryIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No se encontraron repositorios</p>
              <button onClick={handleAdd} className="mt-4 text-teal-500 hover:text-teal-600 font-medium">
                Crear nuevo repositorio
              </button>
            </div>
          )}
        </div>

        <RepositorioModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          repositorio={selectedRepositorio}
          isEditing={!!selectedRepositorio}
        />
      </div>

      {isDetailOpen && selectedRepositorio && (
        <RepositorioDetalleModal
          repositorio={selectedRepositorio}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => { setIsDetailOpen(false); handleEdit(selectedRepositorio); }}
        />
      )}
    </>
  );
};

export default Repositorios;