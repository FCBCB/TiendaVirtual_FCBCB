import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  TagIcon,
  ArrowPathIcon,
  QrCodeIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../components/context/ThemeContext';
import { API_URL, getImageUrl } from '../../components/config/api';

// ─── Componente de Estadísticas ──────────────────────────────────────────
const StatsCard = ({ icon: Icon, label, value, color, subtitle }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-105
      ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {value}
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {label}
          </p>
          {subtitle && (
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Modal de Confirmación de Pago ──────────────────────────────────────
const ConfirmarPagoModal = ({ isOpen, onClose, onConfirm, venta }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);

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
            className={`relative w-full max-w-md rounded-2xl shadow-2xl border z-[10000]
              ${isDark ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-white/20' : 'bg-gradient-to-br from-white to-gray-100 border-gray-200'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl">
                  <CheckCircleIcon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Confirmar Pago
                </h2>
              </div>
              <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
                <XMarkIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-gray-600'}`} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <div className="flex items-center gap-2 text-sm">
                  <ExclamationTriangleIcon className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    ¿Estás seguro de confirmar este pago?
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="space-y-2 text-sm">
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-medium">Venta:</span> #{venta?.id_venta}
                  </p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-medium">Cliente:</span> {venta?.cliente_nombre || venta?.cliente_email || 'N/A'}
                  </p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    <span className="font-medium">Total:</span> Bs. {parseFloat(venta?.monto_total || 0).toFixed(2)}
                  </p>
                  {venta?.codigo_transaccion && (
                    <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      <span className="font-medium">Código QR:</span> {venta.codigo_transaccion}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-all
                    ${isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>
                  Cancelar
                </button>
                <button onClick={() => { setLoading(true); onConfirm(); }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Confirmando...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-5 h-5" />
                      Confirmar Pago
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─── Componente Principal ────────────────────────────────────────────────
const Ventas = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [ventas, setVentas] = useState([]);
  const [filteredVentas, setFilteredVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [expandedRows, setExpandedRows] = useState({});
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    pagados: 0,
    cancelados: 0,
    totalMonto: 0
  });
  
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isConfirmarPagoModalOpen, setIsConfirmarPagoModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  const fetchVentas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = `${API_URL}/api/ventas/admin/todas`;
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showToast(data.message || 'Error al cargar ventas', 'error');
        return;
      }
      
      const ventasData = data.ventas || [];
      setVentas(ventasData);
      setFilteredVentas(ventasData);
      calcularEstadisticas(ventasData);
      
    } catch (error) {
      console.error('Error fetching ventas:', error);
      showToast('Error de conexión con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentas();
    const interval = setInterval(fetchVentas, 30000);
    return () => clearInterval(interval);
  }, []);

  const calcularEstadisticas = (data) => {
    const total = data.length;
    const pendientes = data.filter(v => v.estado_venta === 'pendiente_pago' || v.estado_venta === 'verificando').length;
    const pagados = data.filter(v => v.estado_venta === 'pagado').length;
    const cancelados = data.filter(v => v.estado_venta === 'cancelado').length;
    const totalMonto = data.reduce((sum, v) => sum + parseFloat(v.monto_total || 0), 0);
    
    setEstadisticas({ total, pendientes, pagados, cancelados, totalMonto });
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 4000);
  };

  useEffect(() => {
    let filtered = ventas;
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(v => 
        v.id_venta?.toString().includes(q) ||
        v.cliente_nombre?.toLowerCase().includes(q) ||
        v.cliente_email?.toLowerCase().includes(q) ||
        v.repositorio_nombre?.toLowerCase().includes(q) ||
        v.codigo_transaccion?.toLowerCase().includes(q)
      );
    }
    
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(v => v.estado_venta === filtroEstado);
    }
    
    setFilteredVentas(filtered);
  }, [searchTerm, filtroEstado, ventas]);

  const handleConfirmarPago = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ventas/${selectedVenta.id_venta}/confirmar-pago`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('✅ Pago confirmado exitosamente', 'success');
        setIsConfirmarPagoModalOpen(false);
        fetchVentas();
      } else {
        showToast(data.message || 'Error al confirmar pago', 'error');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const toggleRow = (id) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEstadoLabel = (estado) => {
    const labels = {
      'pendiente_pago': { text: '⏳ Pendiente', color: 'bg-yellow-500/20 text-yellow-400' },
      'verificando': { text: '🔍 Verificando', color: 'bg-blue-500/20 text-blue-400' },
      'pagado': { text: '✅ Pagado', color: 'bg-emerald-500/20 text-emerald-400' },
      'preparando': { text: '📦 Preparando', color: 'bg-purple-500/20 text-purple-400' },
      'enviado': { text: '🚚 Enviado', color: 'bg-indigo-500/20 text-indigo-400' },
      'entregado': { text: '📬 Entregado', color: 'bg-green-500/20 text-green-400' },
      'cancelado': { text: '❌ Cancelado', color: 'bg-red-500/20 text-red-400' }
    };
    return labels[estado] || { text: estado, color: 'bg-gray-500/20 text-gray-400' };
  };

  const estadosFiltro = [
    { value: 'todos', label: 'Todos' },
    { value: 'pendiente_pago', label: '⏳ Pendiente' },
    { value: 'verificando', label: '🔍 Verificando' },
    { value: 'pagado', label: '✅ Pagado' },
    { value: 'preparando', label: '📦 Preparando' },
    { value: 'enviado', label: '🚚 Enviado' },
    { value: 'entregado', label: '📬 Entregado' },
    { value: 'cancelado', label: '❌ Cancelado' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto" />
          <p className="mt-4 text-gray-400">Cargando ventas...</p>
        </div>
      </div>
    );
  }

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
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl mb-8">
            <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-amber-500/20 via-amber-500/10 to-transparent' : 'from-amber-400/30 via-amber-400/20 to-transparent'}`} />
            <div className="relative px-8 py-16 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full">
                    <ShoppingBagIcon className={`w-12 h-12 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                </div>
                <h1 className={`text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r
                  ${isDark ? 'from-white via-amber-400 to-white' : 'from-gray-800 via-amber-600 to-gray-800'}`}>
                  Gestión de Ventas
                </h1>
                <p className={`text-xl mb-8 max-w-2xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Administra y verifica todos los pedidos de compra realizados en la tienda
                </p>
              </motion.div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatsCard
              icon={ShoppingBagIcon}
              label="Total Ventas"
              value={estadisticas.total}
              color="bg-gradient-to-r from-amber-500 to-amber-600"
            />
            <StatsCard
              icon={ClockIcon}
              label="Pendientes"
              value={estadisticas.pendientes}
              color="bg-gradient-to-r from-yellow-500 to-yellow-600"
              subtitle={estadisticas.pendientes > 0 ? '⚠️ Requieren atención' : ''}
            />
            <StatsCard
              icon={CheckCircleIcon}
              label="Pagadas"
              value={estadisticas.pagados}
              color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            />
            <StatsCard
              icon={CurrencyDollarIcon}
              label="Total Recaudado"
              value={`Bs. ${estadisticas.totalMonto.toFixed(2)}`}
              color="bg-gradient-to-r from-blue-500 to-blue-600"
            />
          </div>

          {/* Filtros y Búsqueda */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente, repositorio o código QR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all
                    ${isDark ? 'bg-white/5 border border-white/10 text-white placeholder-gray-400' : 'bg-white border border-gray-200 text-gray-800 placeholder-gray-400'}`}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                {estadosFiltro.map((est) => (
                  <button
                    key={est.value}
                    onClick={() => setFiltroEstado(est.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all hover:scale-105
                      ${filtroEstado === est.value 
                        ? 'bg-amber-500 text-white shadow-lg' 
                        : isDark 
                          ? 'bg-white/5 hover:bg-white/10 text-gray-300' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                  >
                    {est.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              Mostrando <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{filteredVentas.length}</span> de{' '}
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{ventas.length}</span> ventas
            </p>
          </div>

          {/* Tabla de Ventas */}
          <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-4 h-4" />
                        Cliente
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <EnvelopeIcon className="w-4 h-4" />
                        Correo
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        Producto
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Cant.
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/10' : 'divide-gray-200'}`}>
                  <AnimatePresence>
                    {filteredVentas.map((venta) => {
                      const estadoInfo = getEstadoLabel(venta.estado_venta);
                      const puedeConfirmarPago = ['pendiente_pago', 'verificando'].includes(venta.estado_venta);
                      const isExpanded = expandedRows[venta.id_venta];
                      
                      // Tomar el primer producto para mostrar en la fila principal
                      const primerProducto = venta.detalles?.[0] || null;
                      
                      return (
                        <motion.tr
                          key={venta.id_venta}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}
                        >
                          <td className="px-4 py-3">
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {venta.cliente_nombre || 'Cliente'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {venta.cliente_email || 'N/A'}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {primerProducto && (
                                <img
                                  src={getImageUrl(primerProducto.imagen_producto) || 'https://placehold.co/30x30/1a2f3a/19ADA0?text=P'}
                                  alt={primerProducto.nombre_producto}
                                  className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                                  onError={(e) => { e.target.src = 'https://placehold.co/30x30/1a2f3a/19ADA0?text=P'; }}
                                />
                              )}
                              <span className={`text-sm truncate max-w-[120px] ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {primerProducto?.nombre_producto || 'Sin producto'}
                              </span>
                              {venta.detalles?.length > 1 && (
                                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  +{venta.detalles.length - 1}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                              {primerProducto?.tipo_producto || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                              Bs. {parseFloat(primerProducto?.precio_unitario || 0).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {primerProducto?.cantidad || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                              Bs. {parseFloat(venta.monto_total || 0).toFixed(2)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${estadoInfo.color}`}>
                              {estadoInfo.text}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              {venta.detalles?.length > 0 && (
                                <button
                                  onClick={() => toggleRow(venta.id_venta)}
                                  className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
                                  title="Ver detalles"
                                >
                                  {isExpanded ? (
                                    <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              )}
                              {puedeConfirmarPago && (
                                <button
                                  onClick={() => {
                                    setSelectedVenta(venta);
                                    setIsConfirmarPagoModalOpen(true);
                                  }}
                                  className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                                  title="Confirmar pago"
                                >
                                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                                </button>
                              )}
                              {venta.codigo_transaccion && (
                                <div className="p-1.5 rounded-lg" title="Código QR">
                                  <QrCodeIcon className="w-4 h-4 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Filas expandidas con detalles de productos */}
            {filteredVentas.map((venta) => {
              const isExpanded = expandedRows[venta.id_venta];
              if (!isExpanded || !venta.detalles || venta.detalles.length <= 1) return null;
              
              return (
                <motion.div
                  key={`expand-${venta.id_venta}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`border-t ${isDark ? 'border-white/5 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="p-4">
                    <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      Detalles de productos (Venta #{venta.id_venta})
                    </p>
                    <div className="space-y-2">
                      {venta.detalles.map((detalle, idx) => (
                        <div key={idx} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <img
                              src={getImageUrl(detalle.imagen_producto) || 'https://placehold.co/30x30/1a2f3a/19ADA0?text=P'}
                              alt={detalle.nombre_producto}
                              className="w-8 h-8 object-cover rounded-lg"
                              onError={(e) => { e.target.src = 'https://placehold.co/30x30/1a2f3a/19ADA0?text=P'; }}
                            />
                            <div>
                              <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {detalle.nombre_producto}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {detalle.tipo_producto || 'Producto'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              Bs. {parseFloat(detalle.precio_unitario || 0).toFixed(2)}
                            </span>
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              x{detalle.cantidad}
                            </span>
                            <span className={`text-sm font-bold ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                              Bs. {parseFloat(detalle.subtotal || 0).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {filteredVentas.length === 0 && (
            <div className="text-center py-16">
              <ShoppingBagIcon className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {searchTerm || filtroEstado !== 'todos' 
                  ? 'No se encontraron ventas con estos filtros' 
                  : 'No hay ventas registradas aún'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Pago */}
      <ConfirmarPagoModal
        isOpen={isConfirmarPagoModalOpen}
        onClose={() => setIsConfirmarPagoModalOpen(false)}
        onConfirm={handleConfirmarPago}
        venta={selectedVenta}
      />
    </>
  );
};

export default Ventas;