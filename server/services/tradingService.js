const mongoose = require('mongoose');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const logger = require('../utils/logger');

/**
 * Execute Buy Order
 */
const buyStock = async (userId, { symbol, quantity }) => {
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error('Quantity must be a positive whole number');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch stock and current market price
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (!stock) {
    const error = new Error(`Stock '${symbol}' not found`);
    error.statusCode = 404;
    throw error;
  }

  const executionPrice = stock.currentPrice;
  const totalCost = Number((executionPrice * parsedQuantity).toFixed(2));

  // 2. Atomically check and deduct user balance
  const user = await User.findOneAndUpdate(
    { _id: userId, balance: { $gte: totalCost }, isActive: true },
    { $inc: { balance: -totalCost } },
    { new: true }
  );

  if (!user) {
    // Check if user exists or simply lacks funds
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    if (!currentUser.isActive) {
      const error = new Error('User account is deactivated');
      error.statusCode = 403;
      throw error;
    }
    const error = new Error(
      `Insufficient funds. Order total is $${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}, but your available balance is $${currentUser.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`
    );
    error.statusCode = 400;
    throw error;
  }

  try {
    // 3. Update or create Portfolio Holding
    let holding = await Portfolio.findOne({ user: userId, stock: stock._id });

    if (holding) {
      const prevQty = holding.quantity;
      const prevTotal = holding.totalInvested;
      const newQty = prevQty + parsedQuantity;
      const newTotal = Number((prevTotal + totalCost).toFixed(2));
      const newAvg = Number((newTotal / newQty).toFixed(2));

      holding.quantity = newQty;
      holding.totalInvested = newTotal;
      holding.averageBuyPrice = newAvg;
      await holding.save();
    } else {
      holding = await Portfolio.create({
        user: userId,
        stock: stock._id,
        symbol: stock.symbol,
        quantity: parsedQuantity,
        averageBuyPrice: executionPrice,
        totalInvested: totalCost,
      });
    }

    // 4. Create Transaction Record
    const transaction = await Transaction.create({
      user: userId,
      stock: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'BUY',
      quantity: parsedQuantity,
      price: executionPrice,
      totalAmount: totalCost,
      timestamp: new Date(),
    });

    logger.trade('BUY', user.email, stock.symbol, parsedQuantity, executionPrice, totalCost);

    return {
      success: true,
      message: `Successfully purchased ${parsedQuantity} shares of ${stock.symbol} at $${executionPrice.toFixed(2)}`,
      transaction,
      balance: user.balance,
      holding,
    };
  } catch (err) {
    // Compensation rollback in case of unexpected failure
    await User.findByIdAndUpdate(userId, { $inc: { balance: totalCost } });
    logger.error(`Rollback applied for buy order: ${err.message}`);
    throw err;
  }
};

/**
 * Execute Sell Order
 */
const sellStock = async (userId, { symbol, quantity }) => {
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    const error = new Error('Quantity must be a positive whole number');
    error.statusCode = 400;
    throw error;
  }

  // 1. Fetch stock and current market price
  const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
  if (!stock) {
    const error = new Error(`Stock '${symbol}' not found`);
    error.statusCode = 404;
    throw error;
  }

  // 2. Check user's holding
  const holding = await Portfolio.findOne({ user: userId, stock: stock._id });
  if (!holding || holding.quantity < parsedQuantity) {
    const available = holding ? holding.quantity : 0;
    const error = new Error(
      `Insufficient shares. You requested to sell ${parsedQuantity} shares of ${stock.symbol}, but you only own ${available}.`
    );
    error.statusCode = 400;
    throw error;
  }

  const executionPrice = stock.currentPrice;
  const totalSaleAmount = Number((executionPrice * parsedQuantity).toFixed(2));
  const costBasisDeduction = Number((parsedQuantity * holding.averageBuyPrice).toFixed(2));

  // 3. Atomically update holding
  const remainingQuantity = holding.quantity - parsedQuantity;
  let updatedHolding = null;

  try {
    if (remainingQuantity === 0) {
      await Portfolio.findByIdAndDelete(holding._id);
    } else {
      holding.quantity = remainingQuantity;
      holding.totalInvested = Math.max(0, Number((holding.totalInvested - costBasisDeduction).toFixed(2)));
      updatedHolding = await holding.save();
    }

    // 4. Credit user balance
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: totalSaleAmount } },
      { new: true }
    );

    // 5. Create Transaction Record
    const transaction = await Transaction.create({
      user: userId,
      stock: stock._id,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'SELL',
      quantity: parsedQuantity,
      price: executionPrice,
      totalAmount: totalSaleAmount,
      timestamp: new Date(),
    });

    logger.trade('SELL', user.email, stock.symbol, parsedQuantity, executionPrice, totalSaleAmount);

    return {
      success: true,
      message: `Successfully sold ${parsedQuantity} shares of ${stock.symbol} at $${executionPrice.toFixed(2)}`,
      transaction,
      balance: user.balance,
      holding: updatedHolding,
    };
  } catch (err) {
    logger.error(`Error during sell order: ${err.message}`);
    throw err;
  }
};

module.exports = {
  buyStock,
  sellStock,
};
