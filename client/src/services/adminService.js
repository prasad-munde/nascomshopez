import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await api.put(`/admin/users/${userId}/status`, { isActive });
    return response.data;
  },

  getTransactions: async (params = {}) => {
    const response = await api.get('/admin/transactions', { params });
    return response.data;
  },

  addStock: async (stockData) => {
    const response = await api.post('/admin/stocks', stockData);
    return response.data;
  },

  updateStock: async (stockId, stockData) => {
    const response = await api.put(`/admin/stocks/${stockId}`, stockData);
    return response.data;
  },

  deleteStock: async (stockId) => {
    const response = await api.delete(`/admin/stocks/${stockId}`);
    return response.data;
  },
};
