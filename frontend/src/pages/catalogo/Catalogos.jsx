import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PhotoIcon,
  UserIcon,
  TagIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  BuildingLibraryIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapPinIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';
import CatalogoDetalle from './CatalogoDetalle';
import CatalogoModal from './CatalogoModal';

// Componente de Card (Grid) - Con clic en todo el card y botones fijos
const CatalogoCard = ({ catalogo, onEdit, onDelete, onView }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(catalogo.portada_url);

  const handleMouseMove = (e) => {
    // Solo aplicar efecto si el mouse está sobre el contenedor principal
    // y no sobre los botones
    if (!cardRef.current) return;
    const target = e.target;
    // Evitar el efecto 3D si el mouse está sobre los botones o sus hijos
    if (target.closest('.action-button')) {
      return;
    }
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 30;
    const rotateY = (centerX - x) / 30;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    }
    setIsHovered(false);
  };

  const handleCardClick = (e) => {
    // Evitar que el clic se propague si es sobre los botones
    if (e.target.closest('.action-button')) {
      return;
    }
    onView(catalogo);
  };

  const getStatusColor = (estado) => {
    return estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 20) return 'text-amber-400';
    return 'text-emerald-400';
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
      onClick={handleCardClick}
      className="relative group h-full cursor-pointer"
      style={{ transition: 'transform 0.1s ease-out' }}
    >
      <div className={`relative rounded-2xl overflow-hidden shadow-xl border transition-all duration-300 flex flex-col h-full
        ${isDark 
          ? 'bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-white/10' 
          : 'bg-gradient-to-br from-white/90 to-gray-100/90 border-gray-200'
        }`}
      >
        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent transition-transform duration-700 ${isHovered ? 'translate-x-full' : '-translate-x-full'} pointer-events-none`} />
        
        {/* Imagen - con aspect-ratio para que ocupe todo el ancho */}
        <div className="relative w-full bg-gray-100 dark:bg-gray-800">
          <div className="aspect-[3/4] w-full overflow-hidden">
            <img 
              src={portadaUrl} 
              alt={catalogo.titulo}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = 'https://placehold.co/800x600/1a2f3a/19ADA0?text=Sin+Portada';
              }}
            />
          </div>
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-gray-900 via-gray-900/30 to-transparent' : 'from-white via-white/30 to-transparent'} pointer-events-none`} />
          
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(catalogo.estado)} backdrop-blur-sm`}>
              {catalogo.estado === 'activo' ? '● Activo' : '● Inactivo'}
            </span>
          </div>
          
          <div className="absolute bottom-4 right-4 z-10">
            <span className="px-3 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
              Bs. {catalogo.precio}
            </span>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-5 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={`text-xl font-bold transition-colors line-clamp-2 ${isDark ? 'text-white group-hover:text-purple-400' : 'text-gray-800 group-hover:text-purple-600'}`}>
                {catalogo.titulo}
              </h3>
              {catalogo.curaduria && (
                <div className="flex items-center gap-2 mt-1">
                  <UserIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {catalogo.curaduria}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <div className={`flex items-center gap-2 text-sm ${getStockColor(catalogo.stock)}`}>
              <TagIcon className="w-4 h-4" />
              <span className="font-semibold">Stock: {catalogo.stock} unidades</span>
            </div>
            {catalogo.anio_publicacion && (
              <div className="flex items-center gap-1">
                <CalendarIcon className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {catalogo.anio_publicacion}
                </span>
              </div>
            )}
          </div>
          
          {catalogo.formato && (
            <div className="mt-2">
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Formato: {catalogo.formato}
              </p>
            </div>
          )}
          
          {/* Botones - con clase action-button para identificar y detener propagación */}
          <div className={`flex gap-2 mt-auto pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(catalogo);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <EyeIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Ver</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(catalogo);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-100 hover:bg-gray-200'}"
            >
              <PencilSquareIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Editar</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(catalogo);
              }}
              className="action-button flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <TrashIcon className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Eliminar</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Lista
const CatalogoListItem = ({ catalogo, onEdit, onDelete, onView }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const portadaUrl = getImageUrl(catalogo.portada_url);
  const repositorios = catalogo.repositorios_disponibles || [];

  const getStatusColor = (estado) => {
    return estado === 'activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400';
  };

  const getStockColor = (stock) => {
    if (stock === 0) return 'text-red-400';
    if (stock < 20) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const openGoogleMaps = (ubicacion_gps, direccion) => {
    if (ubicacion_gps) {
      window.open(`https://www.google.com/maps?q=${ubicacion_gps}`, '_blank');
    } else if (direccion) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(direccion)}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl p-4 transition-all duration-300 ${isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-50'}`}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Portada */}
        <div className={`w-24 h-32 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${isDark ? 'bg-black/50 border border-white/20' : 'bg-gray-100 border border-gray-200'}`}>
          <img 
            src={portadaUrl} 
            alt={catalogo.titulo} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://placehold.co/100x140/1a2f3a/19ADA0?text=No';
            }}
          />
        </div>
        
        {/* Información principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {catalogo.titulo}
            </h3>
            <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(catalogo.estado)}`}>
              {catalogo.estado === 'activo' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          {catalogo.curaduria && (
            <div className="flex items-center gap-2 mt-1">
              <UserIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {catalogo.curaduria}
              </p>
            </div>
          )}
          <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {catalogo.reseña}
          </p>
          
          {/* Información adicional */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {catalogo.formato && (
              <div className="flex items-center gap-1">
                <ArchiveBoxIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {catalogo.formato}
                </span>
              </div>
            )}
            {catalogo.anio_publicacion && (
              <div className="flex items-center gap-1">
                <CalendarIcon className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {catalogo.anio_publicacion}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CurrencyDollarIcon className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              <span className={`text-sm font-semibold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                Bs. {catalogo.precio}
              </span>
            </div>
            <div className={`flex items-center gap-1 ${getStockColor(catalogo.stock)}`}>
              <TagIcon className="w-4 h-4" />
              <span className="text-sm font-semibold">Stock: {catalogo.stock}</span>
            </div>
          </div>
          
          {/* Repositorios disponibles con ubicación */}
          {repositorios.length > 0 && (
            <div className="mt-3">
              <p className={`text-xs font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                📍 Disponible en:
              </p>
              <div className="flex flex-wrap gap-2">
                {repositorios.map((repo) => (
                  <div key={repo.id_repositorio} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                    ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'}`}
                  >
                    <BuildingLibraryIcon className="w-3 h-3" />
                    <span>{repo.nombre}</span>
                    <span className={getStockColor(repo.stock)}>({repo.stock})</span>
                    {(repo.ubicacion_gps || repo.direccion) && (
                      <button
                        type="button"
                        onClick={() => openGoogleMaps(repo.ubicacion_gps, repo.direccion)}
                        className="ml-1 text-teal-500 hover:text-teal-400"
                        title="Ver en mapa"
                      >
                        <MapPinIcon className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Acciones */}
        <div className="flex gap-2 flex-shrink-0 self-start">
          <button 
            onClick={() => onView(catalogo)} 
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            title="Ver detalles"
          >
            <EyeIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
          <button 
            onClick={() => onEdit(catalogo)} 
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            title="Editar"
          >
            <PencilSquareIcon className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </button>
          <button 
            onClick={() => onDelete(catalogo)} 
            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
            title="Eliminar"
          >
            <TrashIcon className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente Hero
const HeroSection = ({ onAdd, stats, userRol, viewMode, onViewModeChange }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-purple-500/20 via-purple-500/10 to-transparent' : 'from-purple-400/30 via-purple-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full">
              <PhotoIcon className={`w-12 h-12 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
          </div>
          <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-purple-400 to-white' : 'from-gray-800 via-purple-600 to-gray-800'}`}>
            Catálogos de Arte
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {userRol === 'responsable' 
              ? 'Gestiona los catálogos de tu repositorio'
              : 'Gestiona todos los catálogos de la Fundación Cultural BCB'}
          </p>
          
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Catálogos</div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAdd}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5" />
              Nuevo Catálogo
            </motion.button>
            
            <div className="flex gap-2">
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-purple-500/20 border border-purple-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en cuadrícula"
              >
                <Squares2X2Icon className={`w-5 h-5 ${viewMode === 'grid' ? 'text-purple-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-purple-500/20 border border-purple-500/50' 
                    : (isDark ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'bg-white border border-gray-200 hover:bg-gray-100')
                }`}
                title="Vista en lista"
              >
                <ListBulletIcon className={`w-5 h-5 ${viewMode === 'list' ? 'text-purple-400' : (isDark ? 'text-gray-400' : 'text-gray-500')}`} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Componente Principal
const Catalogos = () => {
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCatalogo, setSelectedCatalogo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [userInfo, setUserInfo] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const getUserInfo = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUserInfo({
            id: payload.id,
            rol: payload.rol,
            id_repositorio_asignado: payload.id_repositorio_asignado
          });
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
    };
    getUserInfo();
  }, []);

  const fetchCatalogos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/catalogos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setCatalogos(data.catalogos || []);
      } else {
        showToast(data.message || 'Error al cargar catálogos', 'error');
      }
    } catch (error) {
      console.error('Error fetching catalogos:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogos();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const filteredCatalogos = catalogos.filter(catalogo => {
    const matchesSearch = catalogo.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          catalogo.curaduria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          catalogo.reseña?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === 'todos' || catalogo.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: catalogos.length,
  };

  const handleAdd = () => {
    setSelectedCatalogo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (catalogo) => {
    setSelectedCatalogo(catalogo);
    setIsModalOpen(true);
  };

  const handleView = (catalogo) => {
    setSelectedCatalogo(catalogo);
    setIsDetailOpen(true);
  };

  const handleDelete = async (catalogo) => {
    if (!confirm(`¿Estás seguro de eliminar "${catalogo.titulo}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/catalogos/${catalogo.id_catalogo}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Catálogo eliminado exitosamente', 'success');
        fetchCatalogos();
      } else {
        showToast(data.message || 'Error al eliminar catálogo', 'error');
      }
    } catch (error) {
      console.error('Error deleting catalogo:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/catalogos`;
      let method = 'POST';
      
      if (selectedCatalogo) {
        url = `${API_URL}/api/catalogos/${selectedCatalogo.id_catalogo}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(
          selectedCatalogo ? '✅ Catálogo actualizado exitosamente' : '✅ Catálogo creado exitosamente',
          'success'
        );
        setIsModalOpen(false);
        setSelectedCatalogo(null);
        fetchCatalogos();
      } else {
        showToast(data.message || 'Error al guardar catálogo', 'error');
      }
    } catch (error) {
      console.error('Error saving catalogo:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando catálogos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500/90 backdrop-blur-sm text-white border-green-400' 
            : 'bg-red-500/90 backdrop-blur-sm text-white border-red-400'
        }`}>
          <div className="flex items-center gap-3">
            {toast.type === 'success' ? (
              <CheckCircleIcon className="w-5 h-5" />
            ) : (
              <XCircleIcon className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <HeroSection 
            onAdd={handleAdd} 
            stats={stats} 
            userRol={userInfo?.rol}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Buscar por título, curador o reseña..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className={`px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredCatalogos.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{catalogos.length}</span> catálogos
            </p>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredCatalogos.map((catalogo) => (
                  <CatalogoCard
                    key={catalogo.id_catalogo}
                    catalogo={catalogo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {filteredCatalogos.map((catalogo) => (
                  <CatalogoListItem
                    key={catalogo.id_catalogo}
                    catalogo={catalogo}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <CatalogoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          catalogo={selectedCatalogo}
          isEditing={!!selectedCatalogo}
          userInfo={userInfo}
        />
      </div>

      {isDetailOpen && selectedCatalogo && (
        <CatalogoDetalle
          catalogo={selectedCatalogo}
          onClose={() => setIsDetailOpen(false)}
          onEdit={() => {
            setIsDetailOpen(false);
            handleEdit(selectedCatalogo);
          }}
          userInfo={userInfo}
        />
      )}
    </>
  );
};

export default Catalogos;