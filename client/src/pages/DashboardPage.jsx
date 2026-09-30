import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { stockService } from '../services/stockService';
import { transactionService } from '../services/transactionService';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/LoadingSpinner';
import TradeModal from '../components/TradeModal';

const DashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [marketOverview, setMarketOverview] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Trade Modal State
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');
  const [holdingQuantity, setHoldingQuantity] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [portRes, marketRes, txRes] = await Promise.all([
        portfolioService.getPortfolio(),
        stockService.getMarketOverview(),
        transactionService.getTransactions({ limit: 5 }),
      ]);

      if (portRes.success) setPortfolio(portRes.data);
      if (marketRes.success) setMarketOverview(marketRes.data);
      if (txRes.success) setRecentTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 8s for live pricing
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenTrade = (stock, type = 'BUY', qty = 0) => {
    setSelectedStock(stock);
    setTradeType(type);
    setHoldingQuantity(qty);
    setTradeModalOpen(true);
  };

  const handleTradeComplete = () => {
    fetchDashboardData();
    refreshUser();
  };

  if (loading && !portfolio) {
    return <LoadingSpinner text="Loading your financial dashboard..." />;
  }

  const summary = portfolio?.summary || {
    cashBalance: user?.balance || 0,
    totalStockValue: 0,
    totalPortfolioValue: user?.balance || 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    holdingsCount: 0,
  };

  const isProfit = summary.totalProfitLoss >= 0;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Welcome Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">
            Welcome back, {user?.name || 'Trader'}!
          </h2>
          <div className="text-muted small d-flex align-items-center gap-2">
            <span className="ticker-pulse"></span>
            Simulated Trading Environment &bull; Real-time Market Ticker
          </div>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/market" className="btn btn-primary btn-sm px-3 fw-semibold rounded-3">
            <i className="bi bi-search me-1"></i> Browse Stocks
          </Link>
          <Link to="/portfolio" className="btn btn-outline-secondary btn-sm px-3 fw-semibold rounded-3">
            <i className="bi bi-pie-chart me-1"></i> View Portfolio
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="row g-3 mb-4">
        {/* Total Net Worth */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="shopez-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <span className="metric-title">Total Portfolio Value</span>
              <span className="badge bg-primary-subtle text-primary p-2 rounded-circle">
                <i className="bi bi-wallet2 fs-5"></i>
              </span>
            </div>
            <div className="metric-value text-dark">
              ${summary.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted small">
              Equity: <strong className="text-dark font-mono">${summary.totalStockValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="shopez-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <span className="metric-title">Available Cash</span>
              <span className="badge bg-success-subtle text-success p-2 rounded-circle">
                <i className="bi bi-cash-stack fs-5"></i>
              </span>
            </div>
            <div className="metric-value text-success">
              ${summary.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted small">
              Buying Power Ready
            </div>
          </div>
        </div>

        {/* Total Unrealized Profit/Loss */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="shopez-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <span className="metric-title">Unrealized P / L</span>
              <span className={`badge ${isProfit ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} p-2 rounded-circle`}>
                <i className={`bi ${isProfit ? 'bi-graph-up-arrow' : 'bi-graph-down-arrow'} fs-5`}></i>
              </span>
            </div>
            <div className={`metric-value ${isProfit ? 'text-gain' : 'text-loss'}`}>
              {isProfit ? '+' : ''}${summary.totalProfitLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div>
              <span className={isProfit ? 'badge-gain' : 'badge-loss'}>
                {isProfit ? '+' : ''}{summary.totalProfitLossPercent?.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Open Positions */}
        <div className="col-12 col-sm-6 col-xl-3">
          <div className="shopez-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center">
              <span className="metric-title">Open Positions</span>
              <span className="badge bg-info-subtle text-info p-2 rounded-circle">
                <i className="bi bi-layers-fill fs-5"></i>
              </span>
            </div>
            <div className="metric-value text-dark font-mono">
              {summary.holdingsCount}
            </div>
            <div className="text-muted small">
              Active stock positions
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Holdings Table */}
        <div className="col-lg-8">
          <div className="shopez-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Your Holdings</h5>
              <Link to="/portfolio" className="text-primary small fw-semibold text-decoration-none">
                Full Details <i className="bi bi-chevron-right"></i>
              </Link>
            </div>

            {(!portfolio?.holdings || portfolio.holdings.length === 0) ? (
              <div className="text-center py-5 bg-light rounded-3">
                <i className="bi bi-folder-x fs-1 text-muted"></i>
                <div className="fw-semibold mt-2">No active stock positions</div>
                <p className="text-muted small mb-3">You currently have no open stock holdings.</p>
                <Link to="/market" className="btn btn-primary btn-sm fw-semibold">
                  Explore Market &amp; Buy First Stock
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-shopez align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Stock</th>
                      <th className="text-end">Shares</th>
                      <th className="text-end">Avg Price</th>
                      <th className="text-end">Market Price</th>
                      <th className="text-end">Total Value</th>
                      <th className="text-end">P / L</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.holdings.map((item) => {
                      const itemProfit = item.profitLoss >= 0;
                      return (
                        <tr key={item.id}>
                          <td>
                            <Link
                              to={`/stocks/${item.symbol}`}
                              className="fw-bold text-decoration-none text-dark hover-primary"
                            >
                              {item.symbol}
                            </Link>
                            <div className="small text-muted text-truncate" style={{ maxWidth: '120px' }}>
                              {item.name}
                            </div>
                          </td>
                          <td className="text-end font-mono fw-semibold">{item.quantity}</td>
                          <td className="text-end font-mono text-muted">${item.averageBuyPrice?.toFixed(2)}</td>
                          <td className="text-end font-mono fw-bold">${item.currentPrice?.toFixed(2)}</td>
                          <td className="text-end font-mono fw-bold">
                            ${item.currentValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="text-end">
                            <span className={itemProfit ? 'badge-gain' : 'badge-loss'}>
                              {itemProfit ? '+' : ''}${item.profitLoss?.toFixed(2)} ({itemProfit ? '+' : ''}{item.profitLossPercent?.toFixed(2)}%)
                            </span>
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-success"
                                title="Buy more"
                                onClick={() => handleOpenTrade({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, 'BUY', item.quantity)}
                              >
                                Buy
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Sell shares"
                                onClick={() => handleOpenTrade({ symbol: item.symbol, name: item.name, currentPrice: item.currentPrice }, 'SELL', item.quantity)}
                              >
                                Sell
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Market Highlights (Top Gainers & Losers) */}
        <div className="col-lg-4">
          <div className="shopez-card p-3 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Top Movers
              </h5>
              <Link to="/market" className="text-primary small fw-semibold text-decoration-none">
                All Stocks
              </Link>
            </div>

            <div className="d-flex flex-column gap-2">
              {marketOverview?.topGainers?.slice(0, 3).map((stk) => (
                <div
                  key={stk.symbol}
                  className="d-flex justify-content-between align-items-center p-2 rounded-3 border bg-light"
                >
                  <div>
                    <Link to={`/stocks/${stk.symbol}`} className="fw-bold text-decoration-none text-dark">
                      {stk.symbol}
                    </Link>
                    <div className="small text-muted text-truncate" style={{ maxWidth: '110px' }}>
                      {stk.name}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-mono fw-bold">${stk.currentPrice?.toFixed(2)}</div>
                    <span className="badge-gain small">
                      +{stk.dailyChangePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}

              {marketOverview?.topLosers?.slice(0, 2).map((stk) => (
                <div
                  key={stk.symbol}
                  className="d-flex justify-content-between align-items-center p-2 rounded-3 border bg-light"
                >
                  <div>
                    <Link to={`/stocks/${stk.symbol}`} className="fw-bold text-decoration-none text-dark">
                      {stk.symbol}
                    </Link>
                    <div className="small text-muted text-truncate" style={{ maxWidth: '110px' }}>
                      {stk.name}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-mono fw-bold">${stk.currentPrice?.toFixed(2)}</div>
                    <span className="badge-loss small">
                      {stk.dailyChangePercent?.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Transaction Feed */}
          <div className="shopez-card p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Recent Activity</h5>
              <Link to="/transactions" className="text-primary small fw-semibold text-decoration-none">
                All History
              </Link>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-4 text-muted small">No trades executed yet.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="d-flex justify-content-between align-items-center p-2 rounded-3 border bg-white small"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span
                        className={`badge ${
                          tx.type === 'BUY' ? 'bg-success' : 'bg-danger'
                        } font-mono`}
                      >
                        {tx.type}
                      </span>
                      <div>
                        <strong>{tx.symbol}</strong> ({tx.quantity} shs)
                        <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                          {new Date(tx.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-end font-mono fw-bold">
                      ${tx.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          initialType={tradeType}
          userHoldingQuantity={holdingQuantity}
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          onTradeComplete={handleTradeComplete}
        />
      )}
    </div>
  );
};

export default DashboardPage;
