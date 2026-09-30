const mongoose = require('mongoose');

const HistoricalPriceSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    open: {
      type: Number,
    },
    high: {
      type: Number,
    },
    low: {
      type: Number,
    },
    volume: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const StockSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Stock company name is required'],
      trim: true,
      index: true,
    },
    sector: {
      type: String,
      default: 'Technology',
      trim: true,
      index: true,
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0.01, 'Price must be positive'],
    },
    previousClose: {
      type: Number,
      required: [true, 'Previous close price is required'],
      min: [0.01, 'Previous close must be positive'],
    },
    dailyChange: {
      type: Number,
      default: 0,
    },
    dailyChangePercent: {
      type: Number,
      default: 0,
    },
    dayHigh: {
      type: Number,
    },
    dayLow: {
      type: Number,
    },
    volume: {
      type: Number,
      default: 1000000,
    },
    marketCap: {
      type: Number,
      default: 1000000000,
    },
    peRatio: {
      type: Number,
      default: 25.0,
    },
    high52Week: {
      type: Number,
    },
    low52Week: {
      type: Number,
    },
    description: {
      type: String,
      trim: true,
    },
    historicalPrices: [HistoricalPriceSchema],
  },
  {
    timestamps: true,
  }
);

// Pre-save calculation of daily change
StockSchema.pre('save', function (next) {
  if (this.currentPrice && this.previousClose) {
    this.dailyChange = Number((this.currentPrice - this.previousClose).toFixed(2));
    this.dailyChangePercent = Number(
      (((this.currentPrice - this.previousClose) / this.previousClose) * 100).toFixed(2)
    );
  }
  next();
});

module.exports = mongoose.model('Stock', StockSchema);

