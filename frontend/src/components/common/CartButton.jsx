// src/components/common/CartButton.jsx
import React from 'react';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const CartButton = ({ className = '' }) => {
  const { itemCount, toggleCart } = useCart();

  return (
    <button
      onClick={toggleCart}
      className={`relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label="Abrir carrito"
    >
      <ShoppingBagIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartButton;