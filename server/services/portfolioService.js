const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

const getUserPortfolio = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Find all active holdings for user
  const rawHoldings = await Portfolio.find({ user: userId, quantity: { $gt: 0 } })
    .populate('stock', 'symbol name sector currentPrice previousClose dailyChange dailyChangePercent')
    .lean();

  let totalStockValue = 0;
  let totalInvested = 0;

  const holdings = rawHoldings.map((h) => {
    const stock = h.stock || {};
    const currentPrice = stock.currentPrice || h.averageBuyPrice;
    const currentValue = Number((h.quantity * currentPrice).toFixed(2));
    const invested = Number((h.quantity * h.averageBuyPrice).toFixed(2));
    const profitLoss = Number((currentValue - invested).toFixed(2));
    const profitLossPercent = invested > 0 ? Number(((profitLoss / invested) * 100).toFixed(2)) : 0;

    totalStockValue += currentValue;
    totalInvested += invested;

    return {
      id: h._id,
      stockId: stock._id || h.stock,
      symbol: h.symbol,
      name: stock.name || h.symbol,
      sector: stock.sector || 'Other',
      quantity: h.quantity,
      averageBuyPrice: Number(h.averageBuyPrice.toFixed(2)),
      currentPrice: Number(currentPrice.toFixed(2)),
      currentValue,
      totalInvested: invested,
      profitLoss,
      profitLossPercent,
      dailyChange: stock.dailyChange || 0,
      dailyChangePercent: stock.dailyChangePercent || 0,
      updatedAt: h.updatedAt,
    };
  });

  const cashBalance = Number(user.balance.toFixed(2));
  const totalPortfolioValue = Number((cashBalance + totalStockValue).toFixed(2));
  const totalProfitLoss = Number((totalStockValue - totalInvested).toFixed(2));
  const totalProfitLossPercent =
    totalInvested > 0 ? Number(((totalProfitLoss / totalInvested) * 100).toFixed(2)) : 0;

  // Add portfolio weight allocation to each holding
  const holdingsWithWeights = holdings.map((h) => ({
    ...h,
    allocationPercent:
      totalPortfolioValue > 0 ? Number(((h.currentValue / totalPortfolioValue) * 100).toFixed(2)) : 0,
  }));

  return {
    summary: {
      cashBalance,
      totalStockValue: Number(totalStockValue.toFixed(2)),
      totalPortfolioValue,
      totalInvested: Number(totalInvested.toFixed(2)),
      totalProfitLoss,
      totalProfitLossPercent,
      holdingsCount: holdings.length,
    },
    holdings: holdingsWithWeights,
  };
};

module.exports = {
  getUserPortfolio,
};

