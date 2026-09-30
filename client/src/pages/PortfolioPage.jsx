import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { portfolioService } from '../services/portfolioService';
import { useAuth } from '../hooks/useAuth';
import TradeModal from '../components/TradeModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PortfolioPage = () => {
  const { user, refreshUser } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Trade Modal
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('SELL');
  const [holdingQuantity, setHoldingQuantity] = useState(0);

  const fetchPortfolio = async () => {
    try {
      const res = await portfolioService.getPortfolio();
      if (res.success && res.data) {
        setPortfolio(res.data);
      }
    } catch (err) {
      console.error('Failed to load portfolio', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    // Live update poll every 6s
    const interval = setInterval(() => {
      fetchPortfolio();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenTrade = (holding, type = 'SELL') => {
    setSelectedStock({
      symbol: holding.symbol,
      name: holding.name,
      currentPrice: holding.currentPrice,
    });
    setTradeType(type);
    setHoldingQuantity(holding.quantity);
    setTradeModalOpen(true);
  };

  const handleTradeComplete = () => {
    fetchPortfolio();
    refreshUser();
  };

  if (loading && !portfolio) {
    return <LoadingSpinner text="Calculating portfolio valuations..." />;
  }

  const summary = portfolio?.summary || {
    cashBalance: user?.balance || 0,
    totalStockValue: 0,
    totalPortfolioValue: user?.balance || 0,
    totalInvested: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    holdingsCount: 0,
  };

  const isProfit = summary.totalProfitLoss >= 0;

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">My Portfolio</h2>
          <div className="text-muted small d-flex align-items-center gap-2">
            <span className="ticker-pulse"></span>
            Real-Time Valuation &bull; Live Cost Basis &amp; Returns
          </div>
        </div>
        <div className="d-flex gap-2 mt-3 mt-md-0">
          <Link to="/market" className="btn btn-primary btn-sm px-3 fw-semibold rounded-3">
            <i className="bi bi-cart-plus me-1"></i> Buy Stocks
          </Link>
          <Link to="/transactions" className="btn btn-outline-secondary btn-sm px-3 fw-semibold rounded-3">
            <i className="bi bi-clock-history me-1"></i> Order History
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        {/* Total Net Worth */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="shopez-card p-3 h-100">
            <div className="metric-title">Portfolio Net Worth</div>
            <div className="metric-value text-dark">
              ${summary.totalPortfolioValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted small">
              Cash + Active Stock Equities
            </div>
          </div>
        </div>

        {/* Total Stock Equities */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="shopez-card p-3 h-100">
            <div className="metric-title">Stock Equities Value</div>
            <div className="metric-value text-primary">
              ${summary.totalStockValue?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted small">
              Cost Basis: <span className="font-mono">${summary.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="shopez-card p-3 h-100">
            <div className="metric-title">Available Cash</div>
            <div className="metric-value text-success">
              ${summary.cashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-muted small">
              Ready to invest
            </div>
          </div>
        </div>

        {/* Total Unrealized P/L */}
        <div className="col-12 col-sm-6 col-lg-3">
          <div className="shopez-card p-3 h-100">
            <div className="metric-title">Total Unrealized P/L</div>
            <div className={`metric-value ${isProfit ? 'text-gain' : 'text-loss'}`}>
              {isProfit ? '+' : ''}${summary.totalProfitLoss?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div>
              <span className={isProfit ? 'badge-gain' : 'badge-loss'}>
                {isProfit ? '+' : ''}{summary.totalProfitLossPercent?.toFixed(2)}% Return
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      {portfolio?.holdings && portfolio.holdings.length > 0 && (
        <div className="card shopez-card p-4 mb-4">
          <h5 className="fw-bold mb-3">Portfolio Asset Allocation</h5>
          <div className="progress mb-3" style={{ height: '14px', borderRadius: '8px' }}>
            {portfolio.holdings.map((h, idx) => {
              const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary'];
              const color = colors[idx % colors.length];
              return (
                <div
                  key={h.id}
                  className={`progress-bar ${color}`}
                  role="progressbar"
                  style={{ width: `${Math.max(4, h.allocationPercent)}%` }}
                  title={`${h.symbol}: ${h.allocationPercent}%`}
                ></div>
              );
            })}
          </div>

          <div className="d-flex flex-wrap gap-3 small">
            {portfolio.holdings.map((h, idx) => {
              const colors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger', 'bg-secondary'];
              const color = colors[idx % colors.length];
              return (
                <div key={h.id} className="d-flex align-items-center gap-1">
                  <span className={`badge ${color} p-1 rounded-circle`} style={{ width: '10px', height: '10px' }}></span>
                  <strong>{h.symbol}</strong>
                  <span className="text-muted font-mono">({h.allocationPercent}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Holdings Detailed Table */}
      <div className="card shopez-card">
        <div className="card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center">
          <h5 className="fw-bold mb-0">Active Holdings ({summary.holdingsCount})</h5>
        </div>

        {(!portfolio?.holdings || portfolio.holdings.length === 0) ? (
          <div className="text-center py-5">
            <i className="bi bi-wallet-fill fs-1 text-muted"></i>
            <h5 className="mt-3 fw-bold">No active positions yet</h5>
            <p className="text-muted small">
              You haven't purchased any stocks yet. Explore the market and place your first trade!
            </p>
            <Link to="/market" className="btn btn-primary btn-sm fw-semibold">
              <i className="bi bi-graph-up me-1"></i> Go to Stock Market
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-shopez align-middle mb-0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th className="text-end">Shares</th>
                  <th className="text-end">Avg Buy Price</th>
                  <th className="text-end">Current Price</th>
                  <th className="text-end">Total Invested</th>
                  <th className="text-end">Current Value</th>
                  <th className="text-end">Unrealized P / L</th>
                  <th className="text-center">Trade Actions</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.holdings.map((holding) => {
                  const isItemGain = holding.profitLoss >= 0;
                  return (
                    <tr key={holding.id}>
                      <td>
                        <Link
                          to={`/stocks/${holding.symbol}`}
                          className="fw-bold font-mono text-decoration-none text-primary fs-6"
                        >
                          {holding.symbol}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold">{holding.name}</div>
                        <div className="small text-muted">{holding.sector}</div>
                      </td>
                      <td className="text-end font-mono fw-bold">{holding.quantity}</td>
                      <td className="text-end font-mono text-muted">${holding.averageBuyPrice?.toFixed(2)}</td>
                      <td className="text-end font-mono fw-bold">${holding.currentPrice?.toFixed(2)}</td>
                      <td className="text-end font-mono text-muted">
                        ${holding.totalInvested?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-end font-mono fw-bold">
                        ${holding.currentValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-end">
                        <span className={isItemGain ? 'badge-gain' : 'badge-loss'}>
                          {isItemGain ? '+' : ''}${holding.profitLoss?.toFixed(2)} ({isItemGain ? '+' : ''}
                          {holding.profitLossPercent?.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={() => handleOpenTrade(holding, 'BUY')}
                            title="Buy more shares"
                          >
                            Buy More
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleOpenTrade(holding, 'SELL')}
                            title="Sell shares"
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

export default PortfolioPage;
