import api from './api';

export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId, size = 'M', quantity = 1) => {
    const response = await api.post('/cart', { productId, size, quantity });
    return response.data;
  },

  updateCartItem: async (id, quantity) => {
    const response = await api.put(`/cart/${id}`, { quantity });
    return response.data;
  },

  removeCartItem: async (id) => {
    const response = await api.delete(`/cart/${id}`);
    return response.data;
  },
};
