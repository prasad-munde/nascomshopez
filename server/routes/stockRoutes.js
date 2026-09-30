const express = require('express');
const router = express.Router();
const { getStocks, getStockBySymbol, getMarketOverview } = require('../controllers/stockController');

// Market overview route must come before :symbol route
router.get('/market/overview', getMarketOverview);
router.get('/', getStocks);
router.get('/:symbol', getStockBySymbol);

module.exports = router;
