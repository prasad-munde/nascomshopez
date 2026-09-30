import api from './api';

export const tradeService = {
  buyStock: async (symbol, quantity) => {
    const response = await api.post('/trades/buy', { symbol, quantity });
    return response.data;
  },

  sellStock: async (symbol, quantity) => {
    const response = await api.post('/trades/sell', { symbol, quantity });
    return response.data;
  },
};
