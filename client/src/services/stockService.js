import { productService } from './productService';
export const stockService = {
  getStocks: async () => ({ success: true, data: { stocks: [] } }),
};
export default stockService;
