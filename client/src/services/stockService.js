import api from './api';

export const stockService = {
  getStocks: async (params = {}) => {
    const response = await api.get('/stocks', { params });
    return response.data;
  },

  getStockBySymbol: async (symbol) => {
    const response = await api.get(`/stocks/${symbol}`);
    return response.data;
  },

  getMarketOverview: async () => {
    const response = await api.get('/stocks/market/overview');
    return response.data;
  },
};
