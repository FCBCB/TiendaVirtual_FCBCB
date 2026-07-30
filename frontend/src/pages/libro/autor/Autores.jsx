import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  GlobeAltIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../../components/context/ThemeContext';
import { API_URL } from '../../../components/config/api';
import AutorModal from './AutorModal';

// ── HeroSection ──────────────────────────────────────────────────────────────
const HeroSection = ({ onAdd, stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-cyan-500/20 via-cyan-500/10 to-transparent' : 'from-cyan-400/30 via-cyan-400/20 to-transparent'}`} />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=1600')] bg-cover bg-center opacity-20" />
      
      <div className="relative px-8 py-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-cyan-600/20 rounded-full">
              <UserIcon className={`w-12 h-12 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
            </div>
          </div>
          <h1 className={`text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${isDark ? 'from-white via-cyan-400 to-white' : 'from-gray-800 via-cyan-600 to-gray-800'}`}>
            Autores
          </h1>
          <p className={`text-lg mb-6 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Gestiona los autores de los libros de la biblioteca
          </p>
          
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>{stats.total}</div>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Autores</div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <PlusIcon className="w-5 h-5" />
            Nuevo Autor
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

// ── Componente Principal ──────────────────────────────────────────────────────
const Autores = () => {
  const [autores, setAutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAutor, setSelectedAutor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Obtener autores
  const fetchAutores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/libros/admin/autores`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setAutores(data.autores || []);
      } else {
        showToast(data.message || 'Error al cargar autores', 'error');
      }
    } catch (error) {
      console.error('Error fetching autores:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutores();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  const filteredAutores = autores.filter(autor => {
    const search = searchTerm.toLowerCase();
    return (
      autor.nombre?.toLowerCase().includes(search) ||
      autor.apellido?.toLowerCase().includes(search) ||
      autor.nacionalidad?.toLowerCase().includes(search)
    );
  });

  const stats = { total: autores.length };

  const handleAdd = () => {
    setSelectedAutor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (autor) => {
    setSelectedAutor(autor);
    setIsModalOpen(true);
  };

  const handleDelete = async (autor) => {
    if (!confirm(`¿Estás seguro de eliminar al autor "${autor.nombre} ${autor.apellido}"?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/libros/autores/${autor.id_autor}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        showToast('✅ Autor eliminado exitosamente', 'success');
        fetchAutores();
      } else {
        showToast(data.message || 'Error al eliminar autor', 'error');
      }
    } catch (error) {
      console.error('Error deleting autor:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  const handleSave = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      let url = `${API_URL}/api/libros/autores`;
      let method = 'POST';
      
      if (selectedAutor) {
        url = `${API_URL}/api/libros/autores/${selectedAutor.id_autor}`;
        method = 'PUT';
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(
          selectedAutor ? '✅ Autor actualizado exitosamente' : '✅ Autor creado exitosamente',
          'success'
        );
        setIsModalOpen(false);
        setSelectedAutor(null);
        fetchAutores();
      } else {
        showToast(data.message || 'Error al guardar autor', 'error');
      }
    } catch (error) {
      console.error('Error saving autor:', error);
      showToast('Error de conexión con el servidor', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto" />
          <p className="mt-4 text-gray-400">Cargando autores...</p>
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
            {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDark ? 'bg-black' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <HeroSection onAdd={handleAdd} stats={stats} />

          {/* Filtros y búsqueda */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o nacionalidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all
                      ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredAutores.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{autores.length}</span> autores
            </p>
          </div>

          {/* Tabla de Autores */}
          <div className={`rounded-2xl overflow-hidden border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-white/5' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nombre</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Apellido</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nacionalidad</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Libros</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Estado</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  <AnimatePresence>
                    {filteredAutores.map((autor, index) => (
                      <motion.tr
                        key={autor.id_autor}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`hover:bg-white/5 transition-colors ${isDark ? 'text-white' : 'text-gray-800'}`}
                      >
                        <td className="px-6 py-4 text-sm">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-700'
                            }`}>
                              {autor.nombre?.charAt(0)}
                            </div>
                            <span className="font-medium">{autor.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{autor.apellido}</td>
                        <td className="px-6 py-4">
                          {autor.nacionalidad && (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              <GlobeAltIcon className="w-3 h-3" />
                              {autor.nacionalidad}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                            isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'
                          }`}>
                            <DocumentTextIcon className="w-3 h-3" />
                            {autor.total_libros || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            autor.activo 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {autor.activo ? '● Activo' : '● Inactivo'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(autor)}
                              className={`p-2 rounded-lg transition-colors hover:scale-110 active:scale-95 ${
                                isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                              }`}
                              title="Editar autor"
                            >
                              <PencilSquareIcon className="w-4 h-4 text-cyan-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(autor)}
                              className="p-2 rounded-lg hover:bg-red-500/10 transition-colors hover:scale-110 active:scale-95"
                              title="Eliminar autor"
                            >
                              <TrashIcon className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>

          {filteredAutores.length === 0 && (
            <div className="text-center py-16">
              <UserIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No se encontraron autores</p>
              <button onClick={handleAdd} className="mt-4 text-cyan-500 hover:text-cyan-600 font-medium">
                Crear nuevo autor
              </button>
            </div>
          )}
        </div>

        <AutorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          autor={selectedAutor}
          isEditing={!!selectedAutor}
        />
      </div>
    </>
  );
};

export default Autores;