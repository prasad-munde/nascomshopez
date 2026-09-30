const marketService = require('../services/marketService');

// @desc    Get all stocks with search, filter, and pagination
// @route   GET /api/stocks
// @access  Public
const getStocks = async (req, res, next) => {
  try {
    const result = await marketService.getAllStocks(req.query);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single stock by symbol
// @route   GET /api/stocks/:symbol
// @access  Public
const getStockBySymbol = async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const stock = await marketService.getStockBySymbol(symbol);
    res.status(200).json({
      success: true,
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get market overview (gainers, losers, sectors)
// @route   GET /api/stocks/market/overview
// @access  Public
const getMarketOverview = async (req, res, next) => {
  try {
    const overview = await marketService.getMarketOverview();
    res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStocks,
  getStockBySymbol,
  getMarketOverview,
};

