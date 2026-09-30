const logger = {
  info: (msg, meta = '') => {
    console.log(`[${new Date().toISOString()}] [INFO] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${msg}`, meta ? meta : '');
  },
  error: (msg, error = '') => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${msg}`, error ? error : '');
  },
  trade: (action, user, symbol, qty, price, total) => {
    console.log(
      `[${new Date().toISOString()}] [TRADE] ${action.toUpperCase()} | User: ${user} | Stock: ${symbol} | Qty: ${qty} | Price: $${price.toFixed(2)} | Total: $${total.toFixed(2)}`
    );
  }
};

module.exports = logger;
