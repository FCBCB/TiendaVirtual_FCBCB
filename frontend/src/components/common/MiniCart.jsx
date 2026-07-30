// src/components/common/MiniCart.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBagIcon,
  XMarkIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  ClockIcon,
  CreditCardIcon,
  TagIcon,
  CheckCircleIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { getImageUrl } from '../config/api';
// ✅ IMPORTAR CheckoutModal
import CheckoutModal from './CheckoutModal';

const MiniCart = () => {
  const { 
    cart, 
    itemCount, 
    isCartOpen, 
    closeCart, 
    updateQuantity, 
    removeFromCart,
    clearCart,
    loading 
  } = useCart();
  const [updatingItem, setUpdatingItem] = useState(null);
  // ✅ Estado para el checkout
  const [showCheckout, setShowCheckout] = useState(false);

  // ✅ Calcular el ahorro total
  const calcularAhorroTotal = useMemo(() => {
    if (!cart?.items || cart.items.length === 0) return 0;
    
    let ahorro = 0;
    cart.items.forEach(item => {
      if (item.descuento_aplicado && item.descuento_aplicado > 0) {
        const precioOriginal = item.precio_unitario / (1 - item.descuento_aplicado / 100);
        const ahorroItem = (precioOriginal - item.precio_unitario) * item.cantidad;
        ahorro += ahorroItem;
      }
    });
    return ahorro;
  }, [cart?.items]);

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) {
      await handleRemoveItem(item.id_carrito_item);
      return;
    }
    setUpdatingItem(item.id_carrito_item);
    await updateQuantity(item.id_carrito_item, newQuantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (itemId) => {
    setUpdatingItem(itemId);
    await removeFromCart(itemId);
    setUpdatingItem(null);
  };

  const handleClearCart = async () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
      await clearCart();
    }
  };

  const calcularHorasRestantes = () => {
    if (!cart?.fecha_expiracion) return 0;
    const expiracion = new Date(cart.fecha_expiracion);
    const ahora = new Date();
    const diff = expiracion - ahora;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  };

  const horasRestantes = calcularHorasRestantes();

  // ✅ Función para obtener el nombre del repositorio
  const getNombreRepositorio = (item) => {
    if (item.nombre_repositorio) return item.nombre_repositorio;
    if (item.id_repositorio && cart?.repositorios) {
      const repo = cart.repositorios.find(r => r.id_repositorio === item.id_repositorio);
      if (repo) return repo.nombre;
    }
    return 'Tienda';
  };

  // ✅ Manejar finalizar compra
  const handleFinalizarCompra = () => {
    if (cart?.items?.length === 0) return;
    closeCart();
    setShowCheckout(true);
  };

  // ✅ Manejar éxito de compra
  const handleCheckoutSuccess = (orderData) => {
    console.log('✅ Orden completada:', orderData);
    setShowCheckout(false);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
              onClick={closeCart}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md z-[9999] bg-white dark:bg-gray-900 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="w-6 h-6 text-amber-500" />
                  <h2 className="text-lg font-bold dark:text-white">Mi Carrito</h2>
                  <span className="text-sm text-gray-500">({itemCount} items)</span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 dark:text-white" />
                </button>
              </div>

              {/* Tiempo de expiración */}
              {horasRestantes > 0 && itemCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm flex-shrink-0">
                  <ClockIcon className="w-4 h-4" />
                  <span>El carrito expira en {horasRestantes} horas</span>
                </div>
              )}

              {/* Items del carrito */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart?.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBagIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>
                    <button
                      onClick={closeCart}
                      className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-colors"
                    >
                      Seguir comprando
                    </button>
                  </div>
                ) : (
                  cart?.items?.map((item) => {
                    const tieneDescuento = item.descuento_aplicado && item.descuento_aplicado > 0;
                    const precioOriginal = tieneDescuento 
                      ? item.precio_unitario / (1 - item.descuento_aplicado / 100)
                      : item.precio_unitario;
                    const nombreRepositorio = item.nombre_repositorio || 'Tienda';
                    
                    return (
                      <div
                        key={item.id_carrito_item}
                        className="flex gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={getImageUrl(item.imagen_producto) || 'https://placehold.co/80x80/1a2f3a/19ADA0?text=Producto'}
                          alt={item.nombre_producto}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={(e) => { e.target.src = 'https://placehold.co/80x80/1a2f3a/19ADA0?text=Producto'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium dark:text-white truncate">{item.nombre_producto}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <BuildingStorefrontIcon className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                              {nombreRepositorio}
                            </span>
                          </div>
                          <div className="mt-1">
                            {tieneDescuento ? (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-amber-500 dark:text-amber-400">
                                  Bs. {parseFloat(item.precio_unitario).toFixed(2)}
                                </span>
                                <span className="text-xs line-through text-gray-400 dark:text-gray-500">
                                  Bs. {parseFloat(precioOriginal).toFixed(2)}
                                </span>
                                <span className="text-[10px] font-bold bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded-full">
                                  -{item.descuento_aplicado}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                Bs. {parseFloat(item.precio_unitario).toFixed(2)}
                              </span>
                            )}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500">
                              Subtotal: Bs. {parseFloat(item.subtotal).toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.cantidad - 1)}
                              disabled={loading || updatingItem === item.id_carrito_item}
                              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-medium w-6 text-center dark:text-white">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, item.cantidad + 1)}
                              disabled={loading || updatingItem === item.id_carrito_item}
                              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id_carrito_item)}
                              disabled={loading || updatingItem === item.id_carrito_item}
                              className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 disabled:opacity-50 ml-auto"
                            >
                              <TrashIcon className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer del carrito */}
              {cart?.items?.length > 0 && (
                <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex-shrink-0">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                      <span className="font-medium dark:text-white">Bs. {parseFloat(cart.subtotal || 0).toFixed(2)}</span>
                    </div>
                    {cart.descuentos > 0 && (
                      <div className="flex justify-between text-sm text-green-500">
                        <span className="flex items-center gap-1">
                          <TagIcon className="w-3.5 h-3.5" />
                          Descuentos aplicados
                        </span>
                        <span>- Bs. {parseFloat(cart.descuentos || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {calcularAhorroTotal > 0 && (
                      <div className="flex justify-between text-sm text-emerald-500">
                        <span className="flex items-center gap-1">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          Ahorro total
                        </span>
                        <span>- Bs. {parseFloat(calcularAhorroTotal).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 dark:border-gray-800 my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="dark:text-white">Total</span>
                      <span className="text-amber-500">Bs. {parseFloat(cart.total || 0).toFixed(2)}</span>
                    </div>
                    {cart.items.some(i => i.descuento_aplicado > 0) && (
                      <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 text-right">
                        {cart.items.filter(i => i.descuento_aplicado > 0).length} item(s) con descuento aplicado
                      </div>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearCart}
                      className="flex-1 px-4 py-2 rounded-xl border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium"
                    >
                      Vaciar
                    </button>
                    <button
                      onClick={handleFinalizarCompra}
                      disabled={cart?.items?.length === 0}
                      className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCardIcon className="w-4 h-4" />
                      Finalizar compra
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ✅ Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={handleCheckoutSuccess}
      />
    </>
  );
};

export default MiniCart;