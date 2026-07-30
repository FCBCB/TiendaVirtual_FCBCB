import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../../../components/context/ThemeContext';

const CategoriaModal = ({ isOpen, onClose, onSave, categoria, isEditing }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    activo: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (categoria && isEditing) {
      setFormData({
        nombre: categoria.nombre || '',
        descripcion: categoria.descripcion || '',
        activo: categoria.activo !== undefined ? categoria.activo : true
      });
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        activo: true
      });
    }
  }, [categoria, isEditing, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const inputCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-pink-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-pink-500'}`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border ${
              isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 flex items-center justify-between p-6 border-b z-20
              ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-sm`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-pink-500/20 to-pink-600/20 rounded-xl">
                  <TagIcon className={`w-6 h-6 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
                </div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={labelCls}>Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className={inputCls}
                  placeholder="Ej: Literatura"
                />
              </div>

              <div>
                <label className={labelCls}>Descripción</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Breve descripción de la categoría..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleChange}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Categoría activa (visible en la aplicación)
                </label>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-white/10">
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
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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

export default CategoriaModal;