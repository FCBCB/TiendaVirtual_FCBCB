// src/components/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_URL } from '../config/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToken, setCartToken] = useState(null);
  const isInitialized = useRef(false);

  // ✅ INICIALIZAR TOKEN DESDE LOCALSTORAGE
  useEffect(() => {
    const token = localStorage.getItem('cart_token');
    console.log('🔑 Token recuperado de localStorage:', token);
    if (token) {
      setCartToken(token);
    }
    isInitialized.current = true;
  }, []);

  // ✅ FUNCIÓN PARA OBTENER HEADERS
  const getAuthHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ✅ USAR EL TOKEN DEL ESTADO O DEL LOCALSTORAGE
    const cartTokenFromStorage = localStorage.getItem('cart_token');
    const tokenToUse = cartToken || cartTokenFromStorage;
    
    if (tokenToUse) {
      headers['X-Cart-Token'] = tokenToUse;
    }
    return headers;
  }, [cartToken]);

  // ✅ FUNCIÓN PARA OBTENER EL CARRITO
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      
      // ✅ SI NO HAY TOKEN, CREAR UNO NUEVO
      let token = localStorage.getItem('cart_token');
      if (!token) {
        token = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cart_token', token);
        setCartToken(token);
      }
      
      console.log('📦 Fetching cart with token:', token);
      
      const res = await fetch(`${API_URL}/api/carrito`, {
        headers: headers
      });
      const data = await res.json();
      
      if (res.ok) {
        setCart(data.carrito);
        setItemCount(data.carrito?.total_items || 0);
        
        // ✅ GUARDAR TOKEN SI VIENE EN HEADERS
        const newToken = res.headers.get('X-Cart-Token');
        if (newToken) {
          localStorage.setItem('cart_token', newToken);
          setCartToken(newToken);
        }
      } else {
        console.error('Error fetching cart:', data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // ✅ AGREGAR AL CARRITO
  const addToCart = useCallback(async (producto, repositorioId, cantidad = 1) => {
    try {
      setLoading(true);
      
      // ✅ OBTENER TOKEN DE LOCALSTORAGE
      let token = localStorage.getItem('cart_token');
      if (!token) {
        token = 'temp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('cart_token', token);
        setCartToken(token);
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'X-Cart-Token': token
      };
      
      const tokenAuth = localStorage.getItem('token');
      if (tokenAuth) {
        headers['Authorization'] = `Bearer ${tokenAuth}`;
      }
      
      console.log('🛒 Agregando al carrito:', { 
        producto: producto.nombre, 
        repositorioId, 
        cantidad,
        token 
      });
      
      const res = await fetch(`${API_URL}/api/carrito/items`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          id_producto: producto.id_producto,
          id_repositorio: repositorioId,
          cantidad
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setCart(data.carrito);
        setItemCount(data.carrito?.total_items || 0);
        setIsCartOpen(true);
        return { success: true, message: data.message, carrito: data.carrito };
      } else {
        console.error('Error adding to cart:', data);
        return { success: false, message: data.message || 'Error al agregar al carrito' };
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ACTUALIZAR CANTIDAD
  const updateQuantity = useCallback(async (itemId, cantidad) => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({ cantidad })
      });
      const data = await res.json();
      
      if (res.ok) {
        setCart(data.carrito);
        setItemCount(data.carrito?.total_items || 0);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // ✅ ELIMINAR DEL CARRITO
  const removeFromCart = useCallback(async (itemId) => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/carrito/items/${itemId}`, {
        method: 'DELETE',
        headers: headers
      });
      const data = await res.json();
      
      if (res.ok) {
        setCart(data.carrito);
        setItemCount(data.carrito?.total_items || 0);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // ✅ VACIAR CARRITO
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const res = await fetch(`${API_URL}/api/carrito/vaciar`, {
        method: 'DELETE',
        headers: headers
      });
      const data = await res.json();
      
      if (res.ok) {
        setCart(data.carrito);
        setItemCount(0);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  // ✅ TOGGLE CARRITO
  const toggleCart = useCallback(() => {
    setIsCartOpen(prev => !prev);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  // ✅ CARGAR CARRITO CUANDO EL TOKEN ESTÉ DISPONIBLE
  useEffect(() => {
    if (isInitialized.current) {
      console.log('🔄 Fetching cart...');
      fetchCart();
    }
  }, [fetchCart]);

  // ✅ GUARDAR TOKEN EN LOCALSTORAGE CUANDO CAMBIE
  useEffect(() => {
    if (cartToken) {
      localStorage.setItem('cart_token', cartToken);
    }
  }, [cartToken]);

  const value = {
    cart,
    itemCount,
    loading,
    isCartOpen,
    toggleCart,
    closeCart,
    openCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    cartToken
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};