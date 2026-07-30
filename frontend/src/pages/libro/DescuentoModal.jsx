import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';

const DescuentoModal = ({ isOpen, onClose, libro, onApply, onRemove }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    descuento_porcentaje: '',
    fecha_inicio: '',
    fecha_fin: '',
    tipo_descuento: 'normal',
    motivo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descuentoActivo, setDescuentoActivo] = useState(false);

  // ✅ Función para formatear fecha local (sin desfase horario)
  const formatDateLocal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // ✅ Ajustar la fecha para mantener la hora local
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (libro && isOpen) {
      const esActivo = libro.aplica_descuento === true && 
                       parseFloat(libro.descuento_porcentaje) > 0;
      
      setDescuentoActivo(esActivo);
      
      setFormData({
        descuento_porcentaje: esActivo ? libro.descuento_porcentaje : '',
        fecha_inicio: formatDateLocal(libro.fecha_inicio_descuento),
        fecha_fin: formatDateLocal(libro.fecha_fin_descuento),
        tipo_descuento: libro.tipo_descuento || 'normal',
        motivo: libro.motivo_descuento || ''
      });
      setError('');
    }
  }, [libro, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const descuento = parseFloat(formData.descuento_porcentaje);
    
    if (isNaN(descuento) || formData.descuento_porcentaje === '' || formData.descuento_porcentaje === null) {
      setError('Por favor, ingresa un porcentaje de descuento válido');
      return;
    }
    
    if (descuento < 0 || descuento > 100) {
      setError('El descuento debe estar entre 0 y 100');
      return;
    }

    if (descuento === 0) {
      if (confirm('¿Estás seguro de eliminar el descuento?')) {
        setLoading(true);
        try {
          await onRemove(libro.id_producto);
        } catch (err) {
          console.error('Error al eliminar descuento:', err);
        } finally {
          setLoading(false);
        }
      }
      return;
    }

    setLoading(true);
    try {
      // ✅ ENVIAR FECHAS SIN CONVERTIR A UTC - MANTENER HORA LOCAL
      const dataToSend = {
        descuento_porcentaje: descuento,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null,
        tipo_descuento: formData.tipo_descuento || 'normal',
        motivo: formData.motivo || 'Aplicación de descuento'
      };
      
      console.log('📦 Enviando datos de descuento:', dataToSend);
      await onApply(libro.id_producto, dataToSend);
    } catch (err) {
      console.error('Error en submit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    if (confirm(`¿Estás seguro de eliminar el descuento de "${libro?.titulo_libro || libro?.nombre}"?`)) {
      setLoading(true);
      try {
        await onRemove(libro.id_producto);
      } catch (err) {
        console.error('Error al eliminar descuento:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const calcularPrecioFinal = () => {
    const precio = parseFloat(libro?.precio) || 0;
    const descuento = parseFloat(formData.descuento_porcentaje) || 0;
    return precio - (precio * descuento / 100);
  };

  const descuentoExpirado = () => {
    if (!libro?.fecha_fin_descuento) return false;
    const fechaFin = new Date(libro.fecha_fin_descuento);
    const ahora = new Date();
    return fechaFin < ahora && libro.aplica_descuento === true;
  };

  const inputCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-amber-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-amber-500'}`;
  const labelCls = `block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const selectCls = `w-full px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
    ${isDark ? 'bg-black/50 border border-white/20 text-white focus:border-amber-500' : 'bg-white border border-gray-300 text-gray-800 focus:border-amber-500'}`;

  if (!libro) return null;

  const tieneDescuento = descuentoActivo || parseFloat(libro.descuento_porcentaje) > 0;

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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10 bg-gray-900/95' : 'border-gray-200 bg-white/95'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${tieneDescuento ? 'bg-amber-500/20' : 'bg-gradient-to-r from-amber-500/20 to-amber-600/20'}`}>
                  <TagIcon className={`w-6 h-6 ${tieneDescuento ? 'text-amber-400' : 'text-amber-600'}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {tieneDescuento ? 'Editar Descuento' : 'Aplicar Descuento'}
                  </h2>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{libro?.titulo_libro || libro?.nombre}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
              >
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Información del libro */}
              <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio original:</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Bs. {parseFloat(libro?.precio || 0).toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-white/10">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Estado:</span>
                  {descuentoExpirado() ? (
                    <span className="flex items-center gap-1 text-sm font-bold text-red-400">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Expirado
                    </span>
                  ) : tieneDescuento ? (
                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                      <CheckCircleIcon className="w-4 h-4" />
                      Activo - {libro.descuento_porcentaje}%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-bold text-gray-400">
                      <XCircleIcon className="w-4 h-4" />
                      Sin descuento
                    </span>
                  )}
                </div>
                
                {tieneDescuento && (
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Precio con descuento:</span>
                    <span className={`font-bold text-amber-400`}>
                      Bs. {parseFloat(libro.precio_con_descuento || libro.precio).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {descuentoExpirado() && (
                <div className={`p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2`}>
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">
                    Este descuento ha expirado. Puedes eliminarlo o crear uno nuevo.
                  </p>
                </div>
              )}

              {/* Porcentaje de descuento */}
              <div>
                <label className={labelCls}>
                  Porcentaje de descuento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="descuento_porcentaje"
                    value={formData.descuento_porcentaje}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="1"
                    required
                    className={`${inputCls} pr-12 ${error ? 'border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="Ej: 20"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                    %
                  </span>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-1">{error}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Valor entre 0 y 100. Con 0 se elimina el descuento.</p>
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

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Fecha inicio</label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Fecha fin</label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className={labelCls}>Motivo</label>
                <input
                  type="text"
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="Ej: Promoción de verano"
                />
              </div>

              {/* Vista previa */}
              {parseFloat(formData.descuento_porcentaje) > 0 && (
                <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Precio con descuento</p>
                      <p className="text-2xl font-bold text-amber-600">
                        Bs. {calcularPrecioFinal().toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 line-through">
                        Bs. {parseFloat(libro?.precio || 0).toFixed(2)}
                      </p>
                      <p className="text-xs font-bold text-amber-500">
                        -{formData.descuento_porcentaje}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                {tieneDescuento && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={loading}
                    className="px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-all duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Eliminando...' : 'Eliminar descuento'}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : (tieneDescuento ? 'Actualizar' : 'Aplicar')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-lg transition-all duration-300
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DescuentoModal;