// frontend/src/components/common/CheckoutModal.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CreditCardIcon,
  ShoppingBagIcon,
  UserIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  QrCodeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingStorefrontIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getImageUrl, API_URL } from '../config/api';

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('checkout'); // 'checkout' | 'payment' | 'verificando' | 'success'
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState(null);
  const [ordenId, setOrdenId] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState(15); // 15 minutos

  // QR estático (puedes reemplazar con una API real)
  const QR_IMAGE = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=BCB-Tienda-Virtual-Pago';

  // Calcular totales
  const subtotal = cart?.subtotal || 0;
  const descuentos = cart?.descuentos || 0;
  const total = cart?.total || 0;

  // Datos del cliente
  const clienteNombre = user?.nombre || user?.username || 'Cliente';
  const clienteEmail = user?.email || 'cliente@email.com';

  // Timer para el QR
  useEffect(() => {
    if (step === 'payment' && tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Si el tiempo expira, volver a checkout
            setStep('checkout');
            setError('El tiempo para pagar ha expirado. Por favor, intenta nuevamente.');
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Cada minuto
      return () => clearInterval(timer);
    }
  }, [step, tiempoRestante]);

  // Reiniciar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('checkout');
        setOrderData(null);
        setError(null);
        setOrdenId(null);
        setTiempoRestante(15);
      }, 300);
    }
  }, [isOpen]);

  const handleConfirmarCompra = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Crear la orden en la base de datos con estado 'pendiente_pago'
      const token = localStorage.getItem('token');
      const ventaData = {
        id_cliente: user?.id_usuario,
        items: cart?.items.map(item => ({
          id_producto: item.id_producto,
          id_repositorio: item.id_repositorio,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
          nombre_producto: item.nombre_producto,
          tipo_producto: item.tipo_producto,
          imagen_producto: item.imagen_producto
        })),
        monto_total: total,
        tipo_entrega: 'recojo_local',
        direccion_entrega: null,
        ciudad_entrega: null,
        departamento_entrega: null,
        referencia_entrega: null,
        observaciones: null,
        estado: 'pendiente_pago' // Estado inicial
      };

      const res = await fetch(`${API_URL}/api/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ventaData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al crear la orden');
      }

      // Guardar el ID de la orden
      const idVenta = data.venta?.id_venta || data.id_venta;
      setOrdenId(idVenta);

      // Ir al paso de pago (QR)
      setStep('payment');
      setLoading(false);

      // Guardar datos de la orden
      setOrderData({
        id_venta: idVenta || 'ORD-' + Date.now().toString().slice(-8),
        fecha: new Date().toLocaleString('es-BO'),
        cliente: clienteNombre,
        email: clienteEmail,
        items: cart?.items || [],
        subtotal: subtotal,
        descuentos: descuentos,
        total: total,
        estado: 'pendiente_pago'
      });

    } catch (err) {
      console.error('Error al crear orden:', err);
      setError(err.message || 'Error al procesar la compra');
      setStep('checkout');
      setLoading(false);
    }
  };

  // ✅ Simular pago (el usuario "paga" escaneando el QR)
  const handlePagar = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cambiar a estado "verificando" (el admin debe confirmar)
      setStep('verificando');
      setLoading(false);

      // Actualizar la orden en la BD a "verificando" (pendiente de confirmación)
      const token = localStorage.getItem('token');
      await fetch(`${API_URL}/api/ventas/${ordenId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ estado: 'verificando' })
      });

      // Notificar al admin que hay un nuevo pago pendiente (opcional)
      // Aquí podrías usar WebSocket, notificaciones push, etc.

    } catch (err) {
      console.error('Error al procesar pago:', err);
      setError('Error al procesar el pago. Intenta nuevamente.');
      setStep('payment');
      setLoading(false);
    }
  };

  // ✅ Verificar estado de la orden (para admin)
  const verificarEstadoOrden = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/ventas/${ordenId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.venta) {
        const estado = data.venta.estado;
        if (estado === 'pagado') {
          setStep('success');
          if (onSuccess) onSuccess(data.venta);
          clearCart();
        }
      }
    } catch (err) {
      console.error('Error verificando estado:', err);
    }
  };

  // ✅ Verificar estado cada 10 segundos mientras está en "verificando"
  useEffect(() => {
    if (step === 'verificando') {
      const interval = setInterval(() => {
        verificarEstadoOrden();
      }, 10000); // Cada 10 segundos
      return () => clearInterval(interval);
    }
  }, [step, ordenId]);

  if (!isOpen) return null;

  const minutos = Math.floor(tiempoRestante / 60);
  const segundos = tiempoRestante % 60;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto"
          >
            <div 
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border dark:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl">
                    {step === 'verificando' ? (
                      <ClockIcon className="w-6 h-6 text-amber-500 animate-pulse" />
                    ) : step === 'success' ? (
                      <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <ShoppingBagIcon className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold dark:text-white">
                      {step === 'checkout' ? 'Resumen de compra' : 
                       step === 'payment' ? 'Pagar con QR' : 
                       step === 'verificando' ? 'Verificando pago...' : 
                       '¡Compra exitosa!'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step === 'checkout' ? 'Revisa los detalles de tu pedido' : 
                       step === 'payment' ? 'Escanea el QR para pagar' : 
                       step === 'verificando' ? 'Esperando confirmación del administrador' : 
                       'Tu pedido ha sido confirmado'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={step === 'verificando'}
                  className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${step === 'verificando' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <XMarkIcon className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Error */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                    <button 
                      onClick={() => setError(null)}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Datos del cliente */}
                <div className={`p-4 rounded-xl ${
                  step === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30' : 
                  step === 'verificando' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30' :
                  'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                }`}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-amber-500" />
                    Datos del cliente
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nombre</p>
                      <p className="text-sm font-medium dark:text-white">{clienteNombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Correo electrónico</p>
                      <p className="text-sm font-medium dark:text-white">{clienteEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                      <p className="text-sm font-medium dark:text-white">{new Date().toLocaleDateString('es-BO')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                      <p className={`text-sm font-medium ${
                        step === 'success' ? 'text-emerald-500' : 
                        step === 'verificando' ? 'text-amber-500' :
                        'text-amber-500'
                      }`}>
                        {step === 'success' ? '✅ Pagado' : 
                         step === 'verificando' ? '⏳ Verificando pago...' : 
                         '⏳ Pendiente de pago'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Resumen de productos - SIEMPRE VISIBLE */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <ShoppingBagIcon className="w-4 h-4 text-amber-500" />
                    Productos ({cart?.items?.length || 0})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart?.items?.map((item) => (
                      <div key={item.id_carrito_item} className="flex items-center gap-3 p-2 rounded-lg bg-white dark:bg-gray-800/50">
                        <img
                          src={getImageUrl(item.imagen_producto) || 'https://placehold.co/40x40/1a2f3a/19ADA0?text=Producto'}
                          alt={item.nombre_producto}
                          className="w-10 h-10 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => { e.target.src = 'https://placehold.co/40x40/1a2f3a/19ADA0?text=Producto'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium dark:text-white truncate">{item.nombre_producto}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.cantidad} x Bs. {parseFloat(item.precio_unitario).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-amber-500">
                            Bs. {parseFloat(item.subtotal).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resumen de precios */}
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium dark:text-white">Bs. {parseFloat(subtotal).toFixed(2)}</span>
                    </div>
                    {descuentos > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span>Descuentos</span>
                        <span>- Bs. {parseFloat(descuentos).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-amber-200 dark:border-amber-800/30 pt-2 mt-2">
                      <div className="flex justify-between text-lg font-bold">
                        <span className="dark:text-white">Total a pagar</span>
                        <span className="text-amber-500">Bs. {parseFloat(total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* QR de pago */}
                {step === 'payment' && (
                  <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border-2 border-amber-500/30 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-48 h-48 bg-white rounded-xl p-4 shadow-lg flex items-center justify-center">
                        <img 
                          src={QR_IMAGE} 
                          alt="QR de pago"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 justify-center">
                          <QrCodeIcon className="w-5 h-5 text-amber-500" />
                          Escanea el QR para pagar
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Total: <strong className="text-amber-500">Bs. {parseFloat(total).toFixed(2)}</strong>
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <ClockIcon className="w-3.5 h-3.5" />
                          <span>El QR expira en {minutos}:{segundos.toString().padStart(2, '0')} minutos</span>
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500">
                          Después de pagar, el administrador verificará tu pago
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Estado de verificación */}
                {step === 'verificando' && (
                  <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500/30 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
                        <ClockIcon className="w-10 h-10 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400">
                          Verificando pago...
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          El administrador está verificando tu pago. Esto tomará unos minutos.
                        </p>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Número de orden</p>
                          <p className="text-sm font-bold dark:text-white">{orderData?.id_venta || 'Cargando...'}</p>
                        </div>
                        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-amber-500" />
                          <span>Esperando confirmación...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mensaje de éxito */}
                {step === 'success' && orderData && (
                  <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500/30 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircleIcon className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ¡Pago confirmado!
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Tu pedido ha sido confirmado exitosamente
                        </p>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-800/30">
                          <p className="text-xs text-gray-500 dark:text-gray-400">Número de orden</p>
                          <p className="text-sm font-bold dark:text-white">{orderData.id_venta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  {step === 'checkout' && (
                    <>
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleConfirmarCompra}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CreditCardIcon className="w-5 h-5" />
                            Confirmar compra
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {step === 'payment' && (
                    <>
                      <button
                        onClick={() => setStep('checkout')}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon className="w-4 h-4" />
                        Volver
                      </button>
                      <button
                        onClick={handlePagar}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5" />
                            Pagar (QR)
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {step === 'verificando' && (
                    <button
                      onClick={() => {
                        // Verificar estado manualmente
                        verificarEstadoOrden();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      Verificar estado
                    </button>
                  )}

                  {step === 'success' && (
                    <button
                      onClick={() => {
                        if (onSuccess) onSuccess(orderData);
                        clearCart();
                        onClose();
                      }}
                      className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      Ver mi pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;