import React, { createContext, useState, useEffect, useContext } from 'react';
import { cartService } from '../services/cartService';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cart, setCart] = useState({
    items: [],
    count: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart({ items: [], count: 0, subtotal: 0, discount: 0, total: 0 });
      return;
    }

    try {
      setLoading(true);
      const data = await cartService.getCart();
      setCart({
        items: data.items || [],
        count: data.count || 0,
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        total: data.total || 0,
      });
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, size = 'M', quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to your cart.');
    }
    const res = await cartService.addToCart(productId, size, quantity);
    await fetchCart();
    return res;
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    const res = await cartService.updateCartItem(cartItemId, newQuantity);
    await fetchCart();
    return res;
  };

  const removeFromCart = async (cartItemId) => {
    const res = await cartService.removeCartItem(cartItemId);
    await fetchCart();
    return res;
  };

  const clearCart = () => {
    setCart({ items: [], count: 0, subtotal: 0, discount: 0, total: 0 });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
