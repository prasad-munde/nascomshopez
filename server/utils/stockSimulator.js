/**
 * Stock Market Simulator Utility
 * Generates realistic price fluctuations and historical data.
 */

// Generate historical price series backwards from current date
const generateHistoricalData = (currentPrice, days = 60, volatility = 0.02) => {
  const history = [];
  let price = currentPrice;
  const now = new Date();

  // Create points starting from (days) ago up to today
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    // Set to 4:00 PM market close
    date.setHours(16, 0, 0, 0);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Random daily return between -volatility and +volatility with slight upward drift
    const drift = 0.0003;
    const shock = (Math.random() - 0.49) * volatility;
    const changeFactor = 1 + drift + shock;

    const open = Number((price * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));
    const close = Number((price * changeFactor).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * 0.008)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * 0.008)).toFixed(2));
    const volume = Math.floor(500000 + Math.random() * 2500000);

    history.push({
      date,
      open,
      high,
      low,
      price: close,
      volume,
    });

    price = close;
  }

  // Adjust final history element close to match currentPrice
  if (history.length > 0) {
    history[history.length - 1].price = currentPrice;
  }

  return history;
};

// Calculate realistic price tick
const calculateNextPrice = (currentPrice, previousClose) => {
  // Max 0.8% fluctuation per tick
  const maxPercentChange = 0.008;
  const change = (Math.random() - 0.495) * maxPercentChange;
  let newPrice = Number((currentPrice * (1 + change)).toFixed(2));

  // Safeguard against negative or zero price
  if (newPrice <= 0.5) newPrice = 0.5;

  const dailyChange = Number((newPrice - previousClose).toFixed(2));
  const dailyChangePercent = Number(((dailyChange / previousClose) * 100).toFixed(2));

  return {
    newPrice,
    dailyChange,
    dailyChangePercent,
  };
};

module.exports = {
  generateHistoricalData,
  calculateNextPrice,
};
