const Stock = require('../models/Stock');
const { calculateNextPrice } = require('../utils/stockSimulator');
const logger = require('../utils/logger');

const getAllStocks = async (query = {}) => {
  const { search, sector, sortBy = 'volume', sortOrder = 'desc', page = 1, limit = 50 } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { symbol: { $regex: search.trim(), $options: 'i' } },
      { name: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (sector && sector !== 'All') {
    filter.sector = sector;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (Number(page) - 1) * Number(limit);

  const [stocks, total] = await Promise.all([
    Stock.find(filter)
      .select('-historicalPrices')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit)),
    Stock.countDocuments(filter),
  ]);

  return {
    stocks,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

const getStockBySymbol = async (symbol) => {
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (!stock) {
    const error = new Error(`Stock with symbol '${symbol}' not found`);
    error.statusCode = 404;
    throw error;
  }
  return stock;
};

const getMarketOverview = async () => {
  // Top 5 Gainers
  const topGainers = await Stock.find()
    .select('symbol name currentPrice dailyChange dailyChangePercent volume')
    .sort({ dailyChangePercent: -1 })
    .limit(5);

  // Top 5 Losers
  const topLosers = await Stock.find()
    .select('symbol name currentPrice dailyChange dailyChangePercent volume')
    .sort({ dailyChangePercent: 1 })
    .limit(5);

  // Most Active by Volume
  const mostActive = await Stock.find()
    .select('symbol name currentPrice dailyChange dailyChangePercent volume')
    .sort({ volume: -1 })
    .limit(5);

  // Sectors list
  const sectors = await Stock.distinct('sector');

  return {
    topGainers,
    topLosers,
    mostActive,
    sectors,
  };
};

// Simulate dynamic real-time price updates for stocks
const tickMarketPrices = async () => {
  try {
    const stocks = await Stock.find({});
    if (!stocks || stocks.length === 0) return;

    for (const stock of stocks) {
      const { newPrice, dailyChange, dailyChangePercent } = calculateNextPrice(
        stock.currentPrice,
        stock.previousClose
      );

      stock.currentPrice = newPrice;
      stock.dailyChange = dailyChange;
      stock.dailyChangePercent = dailyChangePercent;

      if (!stock.dayHigh || newPrice > stock.dayHigh) {
        stock.dayHigh = newPrice;
      }
      if (!stock.dayLow || newPrice < stock.dayLow) {
        stock.dayLow = newPrice;
      }

      // Add a live data point periodically (e.g., if last point is > 5 mins old or add intraday point)
      const now = new Date();
      const lastPoint = stock.historicalPrices[stock.historicalPrices.length - 1];

      if (!lastPoint || now.getTime() - new Date(lastPoint.date).getTime() > 60 * 1000) {
        stock.historicalPrices.push({
          date: now,
          price: newPrice,
          open: stock.currentPrice,
          high: stock.dayHigh,
          low: stock.dayLow,
          volume: Math.floor(1000 + Math.random() * 5000),
        });

        // Keep last 120 points max
        if (stock.historicalPrices.length > 120) {
          stock.historicalPrices.shift();
        }
      }

      await stock.save();
    }
  } catch (err) {
    logger.error('Error ticking market prices', err.message);
  }
};

let simulationTimer = null;

const startMarketSimulation = (intervalMs = 5000) => {
  if (simulationTimer) return;
  logger.info(`Starting live stock price simulation ticker (interval: ${intervalMs}ms)`);
  simulationTimer = setInterval(() => {
    tickMarketPrices();
  }, intervalMs);
};

const stopMarketSimulation = () => {
  if (simulationTimer) {
    clearInterval(simulationTimer);
    simulationTimer = null;
  }
};

module.exports = {
  getAllStocks,
  getStockBySymbol,
  getMarketOverview,
  tickMarketPrices,
  startMarketSimulation,
  stopMarketSimulation,
};

