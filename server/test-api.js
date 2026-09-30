// Quick backend API verification script
const http = require('http');

async function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing API Endpoints ---');

  // 1. Health check
  const health = await request('/api/health');
  console.log('1. Health Check:', health.status, health.data.status);

  // 2. Login Trader
  const loginRes = await request('/api/auth/login', { method: 'POST' }, {
    email: 'trader@shopez.com',
    password: 'TraderPassword123!',
  });
  console.log('2. Trader Login:', loginRes.status, loginRes.data.success ? 'SUCCESS' : 'FAILED');
  const traderToken = loginRes.data?.data?.token;

  // 3. Get Stocks
  const stocksRes = await request('/api/stocks');
  console.log('3. Get Stocks:', stocksRes.status, `Loaded ${stocksRes.data?.data?.stocks?.length} stocks`);

  // 4. Get AAPL Stock Detail
  const aaplRes = await request('/api/stocks/AAPL');
  console.log('4. AAPL Detail:', aaplRes.status, aaplRes.data?.data?.symbol, `$${aaplRes.data?.data?.currentPrice}`);

  // 5. Get Portfolio
  const portfolioRes = await request('/api/portfolio', {
    headers: { Authorization: `Bearer ${traderToken}` },
  });
  console.log(
    '5. Trader Portfolio:',
    portfolioRes.status,
    `Total Value: $${portfolioRes.data?.data?.summary?.totalPortfolioValue}, Holdings: ${portfolioRes.data?.data?.holdings?.length}`
  );

  // 6. Test Buy TSLA
  const buyRes = await request('/api/trades/buy', {
    method: 'POST',
    headers: { Authorization: `Bearer ${traderToken}` },
  }, {
    symbol: 'TSLA',
    quantity: 5,
  });
  console.log('6. Buy TSLA (5 shares):', buyRes.status, buyRes.data?.message);

  // 7. Test Sell AAPL (5 shares)
  const sellRes = await request('/api/trades/sell', {
    method: 'POST',
    headers: { Authorization: `Bearer ${traderToken}` },
  }, {
    symbol: 'AAPL',
    quantity: 5,
  });
  console.log('7. Sell AAPL (5 shares):', sellRes.status, sellRes.data?.message);

  // 8. Test Admin Login and Admin Stats
  const adminLogin = await request('/api/auth/login', { method: 'POST' }, {
    email: 'admin@shopez.com',
    password: 'AdminPassword123!',
  });
  console.log('8. Admin Login:', adminLogin.status, adminLogin.data?.data?.user?.role);
  const adminToken = adminLogin.data?.data?.token;

  const adminStats = await request('/api/admin/stats', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('9. Admin Stats:', adminStats.status, adminStats.data?.data?.overview);

  console.log('--- All Backend Tests Completed! ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
