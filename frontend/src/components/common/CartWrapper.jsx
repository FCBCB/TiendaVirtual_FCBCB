// src/components/common/CartWrapper.jsx
import React from 'react';
import { CartProvider } from '../context/CartContext';
import MiniCart from './MiniCart';

const CartWrapper = ({ children }) => {
  return (
    <CartProvider>
      {children}
      <MiniCart />
    </CartProvider>
  );
};

export default CartWrapper;