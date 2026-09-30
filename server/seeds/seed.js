require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const { generateHistoricalData } = require('../utils/stockSimulator');

const stocksData = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 195.5,
    previousClose: 193.8,
    dayHigh: 196.8,
    dayLow: 193.5,
    marketCap: 2998000000000,
    peRatio: 31.4,
    volume: 58240000,
    high52Week: 237.23,
    low52Week: 164.08,
    description:
      'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories, and sells a variety of related services including iCloud, Apple Music, and the App Store.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    currentPrice: 448.2,
    previousClose: 445.1,
    dayHigh: 450.3,
    dayLow: 444.0,
    marketCap: 3330000000000,
    peRatio: 36.2,
    volume: 24150000,
    high52Week: 468.35,
    low52Week: 309.45,
    description:
      'Microsoft Corporation develops and supports software, services, devices and solutions worldwide, including Microsoft 365, Azure Cloud Infrastructure, Windows, LinkedIn, and Xbox gaming platforms.',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    sector: 'Semiconductors',
    currentPrice: 128.4,
    previousClose: 125.1,
    dayHigh: 130.2,
    dayLow: 124.8,
    marketCap: 3158000000000,
    peRatio: 68.5,
    volume: 98450000,
    high52Week: 140.76,
    low52Week: 39.23,
    description:
      'NVIDIA Corporation pioneers accelerated computing to tackle challenges ordinary computers cannot. Creator of GPUs for gaming, professional visualization, data centers, and advanced artificial intelligence models.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    currentPrice: 179.8,
    previousClose: 181.5,
    dayHigh: 182.4,
    dayLow: 178.6,
    marketCap: 2240000000000,
    peRatio: 26.8,
    volume: 29800000,
    high52Week: 191.75,
    low52Week: 120.21,
    description:
      'Alphabet Inc. offers products and platforms globally through Google Services, Google Cloud, Android, Chrome, YouTube, Google Play, Search, and Google Gemini AI.',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    sector: 'Consumer Cyclical',
    currentPrice: 185.3,
    previousClose: 183.2,
    dayHigh: 186.7,
    dayLow: 182.9,
    marketCap: 1928000000000,
    peRatio: 51.3,
    volume: 41200000,
    high52Week: 201.2,
    low52Week: 118.35,
    description:
      'Amazon.com, Inc. focuses on retail sale of consumer products and subscriptions through online and physical stores, Amazon Web Services (AWS) cloud computing, and digital entertainment streaming.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'Automotive',
    currentPrice: 254.6,
    previousClose: 260.4,
    dayHigh: 262.1,
    dayLow: 251.8,
    marketCap: 811000000000,
    peRatio: 72.1,
    volume: 87100000,
    high52Week: 271.0,
    low52Week: 138.8,
    description:
      'Tesla, Inc. designs, develops, manufactures, sells, and leases high-performance fully electric vehicles, solar roof installations, energy storage systems, and autonomous driving technology.',
  },
  {
    symbol: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Communication Services',
    currentPrice: 502.1,
    previousClose: 498.6,
    dayHigh: 506.4,
    dayLow: 497.0,
    marketCap: 1275000000000,
    peRatio: 28.7,
    volume: 16800000,
    high52Week: 542.81,
    low52Week: 279.4,
    description:
      'Meta Platforms, Inc. engages in the development of products that enable people to connect and share through mobile devices, personal computers, virtual reality headsets, and social apps (Facebook, Instagram, WhatsApp, Messenger).',
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Financial Services',
    currentPrice: 208.75,
    previousClose: 207.1,
    dayHigh: 209.8,
    dayLow: 206.5,
    marketCap: 597000000000,
    peRatio: 12.3,
    volume: 11400000,
    high52Week: 217.5,
    low52Week: 140.35,
    description:
      'JPMorgan Chase & Co. operates as a financial services firm providing investment banking, asset management, treasury, and commercial and retail banking services to millions of customers globally.',
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    sector: 'Financial Services',
    currentPrice: 272.9,
    previousClose: 274.0,
    dayHigh: 275.2,
    dayLow: 271.8,
    marketCap: 554000000000,
    peRatio: 30.1,
    volume: 7800000,
    high52Week: 290.96,
    low52Week: 227.78,
    description:
      'Visa Inc. operates the world’s largest retail electronic payments network connecting consumers, merchants, financial institutions, and government entities across more than 200 countries.',
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    sector: 'Consumer Defensive',
    currentPrice: 68.4,
    previousClose: 67.9,
    dayHigh: 68.9,
    dayLow: 67.8,
    marketCap: 550000000000,
    peRatio: 33.2,
    volume: 19500000,
    high52Week: 71.33,
    low52Week: 49.85,
    description:
      'Walmart Inc. engages in the operation of retail, wholesale, and other units worldwide, offering groceries, merchandise, apparel, pharmacy, and financial services at everyday low prices.',
  },
  {
    symbol: 'DIS',
    name: 'The Walt Disney Company',
    sector: 'Entertainment',
    currentPrice: 96.15,
    previousClose: 97.4,
    dayHigh: 98.0,
    dayLow: 95.8,
    marketCap: 175000000000,
    peRatio: 38.6,
    volume: 12200000,
    high52Week: 123.74,
    low52Week: 78.73,
    description:
      'The Walt Disney Company operates as an entertainment company worldwide through Disney Entertainment, ESPN, Parks, Experiences, and Consumer Products including Disney+, Hulu, and Pixar studios.',
  },
  {
    symbol: 'NFLX',
    name: 'Netflix, Inc.',
    sector: 'Communication Services',
    currentPrice: 675.2,
    previousClose: 668.0,
    dayHigh: 679.5,
    dayLow: 665.0,
    marketCap: 289000000000,
    peRatio: 43.8,
    volume: 4500000,
    high52Week: 697.49,
    low52Week: 344.73,
    description:
      'Netflix, Inc. provides entertainment services including TV series, documentaries, feature films, and mobile games across various genres and languages to over 270 million paid memberships globally.',
  },
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopez_trading';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('Cleaning existing records...');
    await Promise.all([
      User.deleteMany({}),
      Stock.deleteMany({}),
      Portfolio.deleteMany({}),
      Transaction.deleteMany({}),
    ]);

    console.log('Creating Admin & Demo Trader users...');
    const adminUser = await User.create({
      name: 'ShopEZ Admin',
      email: 'admin@shopez.com',
      password: 'AdminPassword123!',
      role: 'admin',
      balance: 250000.0,
      isActive: true,
    });

    const demoTrader = await User.create({
      name: 'Alex Trader',
      email: 'trader@shopez.com',
      password: 'TraderPassword123!',
      role: 'user',
      balance: 85500.0,
      isActive: true,
    });

    console.log('Admin credentials: admin@shopez.com / AdminPassword123!');
    console.log('Trader credentials: trader@shopez.com / TraderPassword123!');

    console.log('Seeding stock catalog with realistic historical data...');
    const createdStocks = [];
    for (const stockInfo of stocksData) {
      const historicalPrices = generateHistoricalData(stockInfo.currentPrice, 60);
      const stockDoc = await Stock.create({
        ...stockInfo,
        historicalPrices,
      });
      createdStocks.push(stockDoc);
    }
    console.log(`Created ${createdStocks.length} stocks.`);

    // Find AAPL, NVDA, MSFT to seed initial portfolio for demoTrader
    const aapl = createdStocks.find((s) => s.symbol === 'AAPL');
    const nvda = createdStocks.find((s) => s.symbol === 'NVDA');
    const msft = createdStocks.find((s) => s.symbol === 'MSFT');

    console.log('Seeding demo holdings and transactions for trader...');
    if (aapl && nvda && msft) {
      // AAPL Holding
      await Portfolio.create({
        user: demoTrader._id,
        stock: aapl._id,
        symbol: 'AAPL',
        quantity: 25,
        averageBuyPrice: 185.0,
        totalInvested: 4625.0,
      });

      // NVDA Holding
      await Portfolio.create({
        user: demoTrader._id,
        stock: nvda._id,
        symbol: 'NVDA',
        quantity: 40,
        averageBuyPrice: 115.5,
        totalInvested: 4620.0,
      });

      // MSFT Holding
      await Portfolio.create({
        user: demoTrader._id,
        stock: msft._id,
        symbol: 'MSFT',
        quantity: 12,
        averageBuyPrice: 438.0,
        totalInvested: 5256.0,
      });

      // Sample transactions
      const txs = [
        {
          user: demoTrader._id,
          stock: aapl._id,
          symbol: 'AAPL',
          stockName: aapl.name,
          type: 'BUY',
          quantity: 25,
          price: 185.0,
          totalAmount: 4625.0,
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          user: demoTrader._id,
          stock: nvda._id,
          symbol: 'NVDA',
          stockName: nvda.name,
          type: 'BUY',
          quantity: 40,
          price: 115.5,
          totalAmount: 4620.0,
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
          user: demoTrader._id,
          stock: msft._id,
          symbol: 'MSFT',
          stockName: msft.name,
          type: 'BUY',
          quantity: 12,
          price: 438.0,
          totalAmount: 5256.0,
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      await Transaction.insertMany(txs);
    }

    console.log('Database seeding successfully finished!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
