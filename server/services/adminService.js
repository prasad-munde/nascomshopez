const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { generateHistoricalData } = require('../utils/stockSimulator');

const getAllUsers = async (query = {}) => {
  const { search, role, status, page = 1, limit = 20 } = query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status !== undefined && status !== '') {
    filter.isActive = status === 'active';
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return {
    users,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

const toggleUserStatus = async (adminId, targetUserId, isActive) => {
  if (adminId.toString() === targetUserId.toString()) {
    const error = new Error('You cannot deactivate your own administrative account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(targetUserId);
  if (!user) {
    const error = new Error('Target user not found');
    error.statusCode = 404;
    throw error;
  }

  user.isActive = Boolean(isActive);
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

const getAllTransactions = async (query = {}) => {
  const { symbol, type, page = 1, limit = 25 } = query;
  const filter = {};

  if (symbol) {
    filter.symbol = symbol.toUpperCase();
  }

  if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
    filter.type = type.toUpperCase();
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate('user', 'name email')
      .populate('stock', 'symbol name')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  };
};

const createStock = async (stockData) => {
  const { symbol, name, sector, currentPrice, previousClose, description, marketCap, peRatio } = stockData;

  const existing = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (existing) {
    const error = new Error(`Stock with symbol '${symbol}' already exists`);
    error.statusCode = 400;
    throw error;
  }

  const initialPrice = Number(currentPrice);
  const prevClose = previousClose ? Number(previousClose) : initialPrice;
  const historicalPrices = generateHistoricalData(initialPrice, 60);

  const stock = await Stock.create({
    symbol: symbol.toUpperCase(),
    name,
    sector: sector || 'Technology',
    currentPrice: initialPrice,
    previousClose: prevClose,
    dayHigh: initialPrice,
    dayLow: initialPrice,
    description: description || `${name} (${symbol.toUpperCase()}) Common Stock.`,
    marketCap: marketCap ? Number(marketCap) : 1000000000,
    peRatio: peRatio ? Number(peRatio) : 25,
    volume: 1000000,
    historicalPrices,
  });

  return stock;
};

const updateStock = async (stockId, updateData) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  const allowedFields = [
    'name',
    'sector',
    'currentPrice',
    'previousClose',
    'description',
    'marketCap',
    'peRatio',
    'volume',
  ];

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      stock[field] = updateData[field];
    }
  });

  if (updateData.currentPrice) {
    const prev = stock.previousClose || stock.currentPrice;
    stock.dailyChange = Number((stock.currentPrice - prev).toFixed(2));
    stock.dailyChangePercent = Number((((stock.currentPrice - prev) / prev) * 100).toFixed(2));
  }

  await stock.save();
  return stock;
};

const deleteStock = async (stockId) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    const error = new Error('Stock not found');
    error.statusCode = 404;
    throw error;
  }

  // Check if any portfolio active holdings exist
  const activeHoldingsCount = await Portfolio.countDocuments({ stock: stock._id, quantity: { $gt: 0 } });
  if (activeHoldingsCount > 0) {
    const error = new Error(
      `Cannot delete stock '${stock.symbol}'. ${activeHoldingsCount} user portfolio(s) currently hold shares of this stock.`
    );
    error.statusCode = 400;
    throw error;
  }

  await Stock.findByIdAndDelete(stockId);
  return { message: `Stock ${stock.symbol} successfully deleted` };
};

const getAdminStats = async () => {
  const [totalUsers, activeUsers, totalStocks, transactions] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
    Stock.countDocuments({}),
    Transaction.find({}).select('type totalAmount quantity symbol timestamp'),
  ]);

  let totalTradingVolume = 0;
  let totalBuyVolume = 0;
  let totalSellVolume = 0;
  const symbolCounts = {};

  transactions.forEach((tx) => {
    totalTradingVolume += tx.totalAmount;
    if (tx.type === 'BUY') totalBuyVolume += tx.totalAmount;
    if (tx.type === 'SELL') totalSellVolume += tx.totalAmount;

    symbolCounts[tx.symbol] = (symbolCounts[tx.symbol] || 0) + 1;
  });

  // Sort top traded stocks
  const topTraded = Object.entries(symbolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([symbol, count]) => ({ symbol, tradeCount: count }));

  // Aggregate user balances
  const users = await User.find({}).select('balance');
  const totalUserCashBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

  return {
    overview: {
      totalUsers,
      activeUsers,
      totalStocks,
      totalTransactions: transactions.length,
      totalTradingVolume: Number(totalTradingVolume.toFixed(2)),
      totalBuyVolume: Number(totalBuyVolume.toFixed(2)),
      totalSellVolume: Number(totalSellVolume.toFixed(2)),
      totalUserCashBalance: Number(totalUserCashBalance.toFixed(2)),
    },
    topTraded,
  };
};

module.exports = {
  getAllUsers,
  toggleUserStatus,
  getAllTransactions,
  createStock,
  updateStock,
  deleteStock,
  getAdminStats,
};
