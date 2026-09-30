const Transaction = require('../models/Transaction');

// @desc    Get logged in user's transactions
// @route   GET /api/transactions
// @access  Private
const getUserTransactions = async (req, res, next) => {
  try {
    const { symbol, type, page = 1, limit = 20 } = req.query;

    const filter = { user: req.user._id };

    if (symbol) {
      filter.symbol = symbol.toUpperCase();
    }

    if (type && ['BUY', 'SELL'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserTransactions,
};
