const tradingService = require('../services/tradingService');

// @desc    Buy shares of a stock
// @route   POST /api/trades/buy
// @access  Private
const buyStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both stock symbol and quantity to purchase',
      });
    }

    const result = await tradingService.buyStock(req.user._id, { symbol, quantity });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sell shares of a stock
// @route   POST /api/trades/sell
// @access  Private
const sellStock = async (req, res, next) => {
  try {
    const { symbol, quantity } = req.body;

    if (!symbol || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both stock symbol and quantity to sell',
      });
    }

    const result = await tradingService.sellStock(req.user._id, { symbol, quantity });

    res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  buyStock,
  sellStock,
};
