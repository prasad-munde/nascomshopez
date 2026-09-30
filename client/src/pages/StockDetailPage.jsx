import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { stockService } from '../services/stockService';
import { tradeService } from '../services/tradeService';
import { portfolioService } from '../services/portfolioService';
import { useAuth } from '../hooks/useAuth';
import StockChart from '../components/StockChart';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

const StockDetailPage = () => {
  const { symbol } = useParams();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userHolding, setUserHolding] = useState(null);

  // Trading form state
  const [tradeType, setTradeType] = useState('BUY');
  const [quantity, setQuantity] = useState(1);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');

  const fetchStockData = async () => {
    try {
      const res = await stockService.getStockBySymbol(symbol);
      if (res.success && res.data) {
        setStock(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch stock:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHolding = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await portfolioService.getPortfolio();
      if (res.success && res.data?.holdings) {
        const found = res.data.holdings.find(
          (h) => h.symbol.toUpperCase() === symbol.toUpperCase()
        );
        setUserHolding(found || null);
      }
    } catch (err) {
      console.error('Failed to fetch user holding:', err);
    }
  };

  useEffect(() => {
    fetchStockData();
    fetchUserHolding();

    // Live update poll every 6s
    const pollInterval = setInterval(() => {
      fetchStockData();
    }, 6000);

    return () => clearInterval(pollInterval);
  }, [symbol, isAuthenticated]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError('');
    setOrderSuccess('');

    const parsedQty = parseInt(quantity, 10);
    if (!parsedQty || parsedQty <= 0) {
      setOrderError('Quantity must be at least 1 share');
      return;
    }

    const currentPrice = stock?.currentPrice || 0;
    const totalCost = Number((currentPrice * parsedQty).toFixed(2));
    const availableBalance = user?.balance || 0;
    const ownedShares = userHolding ? userHolding.quantity : 0;

    if (tradeType === 'BUY' && totalCost > availableBalance) {
      setOrderError(`Insufficient cash. Needed: $${totalCost.toLocaleString()}, Available: $${availableBalance.toLocaleString()}`);
      return;
    }

    if (tradeType === 'SELL' && parsedQty > ownedShares) {
      setOrderError(`Cannot sell ${parsedQty} shares. You currently own ${ownedShares} shares.`);
      return;
    }

    try {
      setTradeLoading(true);
      let res;
      if (tradeType === 'BUY') {
        res = await tradeService.buyStock(stock.symbol, parsedQty);
      } else {
        res = await tradeService.sellStock(stock.symbol, parsedQty);
      }

      await refreshUser();
      await fetchUserHolding();
      setOrderSuccess(res.message || 'Trade executed successfully!');
      setQuantity(1);
    } catch (err) {
      setOrderError(err.response?.data?.message || err.message || 'Order execution failed');
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading && !stock) {
    return <LoadingSpinner text={`Loading stock analysis for ${symbol?.toUpperCase()}...`} />;
  }

  if (!stock) {
    return (
      <div className="container py-5 text-center">
        <div className="card shopez-card p-5 max-w-md mx-auto">
          <i className="bi bi-exclamation-triangle fs-1 text-warning mb-3"></i>
          <h3>Stock Not Found</h3>
          <p className="text-muted">No stock with symbol "{symbol}" exists in the system.</p>
          <div>
            <Link to="/market" className="btn btn-primary">
              Return to Market
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = stock.dailyChange >= 0;
  const currentPrice = stock.currentPrice || 0;
  const parsedQuantity = parseInt(quantity, 10) || 0;
  const totalOrderValue = Number((currentPrice * parsedQuantity).toFixed(2));
  const availableBalance = user?.balance || 0;
  const ownedShares = userHolding ? userHolding.quantity : 0;
  const maxAffordable = Math.floor(availableBalance / currentPrice);

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item">
            <Link to="/market" className="text-decoration-none">
              Market
            </Link>
          </li>
          <li className="breadcrumb-item text-muted">{stock.sector}</li>
          <li className="breadcrumb-item active fw-bold" aria-current="page">
            {stock.symbol}
          </li>
        </ol>
      </nav>

      {/* Stock Header Banner */}
      <div className="card shopez-card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="fw-bold mb-0 display-6 font-mono text-dark">{stock.symbol}</h1>
              <span className="badge bg-light text-secondary border fs-6">{stock.sector}</span>
            </div>
            <h5 className="text-muted mb-0 mt-1">{stock.name}</h5>
          </div>

          <div className="text-end">
            <div className="display-6 fw-bold font-mono text-dark">
              ${stock.currentPrice?.toFixed(2)}
            </div>
            <div className="d-flex align-items-center justify-content-end gap-2 mt-1">
              <span className={isPositive ? 'badge-gain fs-6' : 'badge-loss fs-6'}>
                <i className={`bi ${isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} me-1`}></i>
                {isPositive ? '+' : ''}${stock.dailyChange?.toFixed(2)} ({isPositive ? '+' : ''}
                {stock.dailyChangePercent?.toFixed(2)}%)
              </span>
              <span className="text-muted small">Today</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Left Side: Chart and Fundamental Data */}
        <div className="col-lg-8">
          {/* Historical Chart Card */}
          <div className="card shopez-card p-4 mb-4">
            <StockChart
              historicalPrices={stock.historicalPrices}
              symbol={stock.symbol}
              isPositive={isPositive}
            />
          </div>

          {/* Key Statistics Grid */}
          <div className="card shopez-card p-4 mb-4">
            <h5 className="fw-bold mb-3">Key Statistics</h5>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">Previous Close</div>
                  <div className="fw-bold font-mono fs-6 mt-1">${stock.previousClose?.toFixed(2)}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">Day Range</div>
                  <div className="fw-bold font-mono fs-6 mt-1">
                    ${stock.dayLow?.toFixed(2) || stock.currentPrice?.toFixed(2)} - ${stock.dayHigh?.toFixed(2) || stock.currentPrice?.toFixed(2)}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">52-Week Range</div>
                  <div className="fw-bold font-mono fs-6 mt-1">
                    ${stock.low52Week?.toFixed(2) || 'N/A'} - ${stock.high52Week?.toFixed(2) || 'N/A'}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">Market Cap</div>
                  <div className="fw-bold font-mono fs-6 mt-1">
                    ${(stock.marketCap / 1e9).toFixed(2)} Billion
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">P/E Ratio</div>
                  <div className="fw-bold font-mono fs-6 mt-1">{stock.peRatio || 'N/A'}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 bg-light rounded-3">
                  <div className="text-muted small">Volume</div>
                  <div className="fw-bold font-mono fs-6 mt-1">{stock.volume?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Description */}
          <div className="card shopez-card p-4">
            <h5 className="fw-bold mb-2">About {stock.name}</h5>
            <p className="text-secondary leading-relaxed mb-0">
              {stock.description || `${stock.name} is a leading publicly traded company in the ${stock.sector} sector.`}
            </p>
          </div>
        </div>

        {/* Right Side: Order Execution Panel */}
        <div className="col-lg-4">
          <div className="card shopez-card p-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <h5 className="fw-bold mb-3 d-flex align-items-center justify-content-between">
              <span>Order Execution</span>
              <span className="badge bg-light text-secondary border font-mono small">Simulated</span>
            </h5>

            {orderError && <AlertMessage type="danger" message={orderError} onClose={() => setOrderError('')} />}
            {orderSuccess && <AlertMessage type="success" message={orderSuccess} onClose={() => setOrderSuccess('')} />}

            {isAuthenticated ? (
              <>
                {/* Buy / Sell Tabs */}
                <div className="btn-group w-100 mb-3" role="group">
                  <button
                    type="button"
                    className={`btn fw-bold ${tradeType === 'BUY' ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setTradeType('BUY');
                      setOrderError('');
                    }}
                  >
                    <i className="bi bi-cart-plus me-1"></i> Buy
                  </button>
                  <button
                    type="button"
                    className={`btn fw-bold ${tradeType === 'SELL' ? 'btn-danger text-white' : 'btn-outline-secondary'}`}
                    onClick={() => {
                      setTradeType('SELL');
                      setOrderError('');
                    }}
                  >
                    <i className="bi bi-cart-dash me-1"></i> Sell
                  </button>
                </div>

                {/* Account Balances Context */}
                <div className="p-3 bg-light rounded-3 mb-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Buying Power (Cash):</span>
                    <span className="fw-bold font-mono text-success">
                      ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Owned Shares:</span>
                    <span className="fw-bold font-mono">
                      {ownedShares} share{ownedShares !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted">Number of Shares</label>
                    <div className="input-group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(Math.max(1, parsedQuantity - 1))}
                        disabled={tradeLoading || parsedQuantity <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        className="form-control text-center font-mono fw-bold fs-5"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        disabled={tradeLoading}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setQuantity(parsedQuantity + 1)}
                        disabled={tradeLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Percentage Presets */}
                  <div className="d-flex gap-2 mb-3">
                    {[1, 5, 10].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className="btn btn-outline-secondary btn-sm flex-grow-1"
                        onClick={() => setQuantity(preset)}
                        disabled={tradeLoading}
                      >
                        +{preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold"
                      onClick={() => {
                        if (tradeType === 'BUY') {
                          setQuantity(Math.max(1, maxAffordable));
                        } else {
                          setQuantity(Math.max(1, ownedShares));
                        }
                      }}
                      disabled={tradeLoading || (tradeType === 'BUY' ? maxAffordable <= 0 : ownedShares <= 0)}
                    >
                      MAX
                    </button>
                  </div>

                  {/* Cost Summary Box */}
                  <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Execution Price:</span>
                      <span className="font-mono">${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-1">
                      <span>Brokerage Fee:</span>
                      <span className="text-success font-mono fw-bold">$0.00</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-bold">
                        {tradeType === 'BUY' ? 'Total Cost:' : 'Total Proceeds:'}
                      </span>
                      <span
                        className={`fs-4 fw-bold font-mono ${
                          tradeType === 'BUY' ? 'text-primary' : 'text-success'
                        }`}
                      >
                        ${totalOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`btn w-100 py-2 fw-bold text-white shadow-sm ${
                      tradeType === 'BUY' ? 'btn-success' : 'btn-danger'
                    }`}
                    disabled={
                      tradeLoading ||
                      parsedQuantity <= 0 ||
                      (tradeType === 'BUY' && totalOrderValue > availableBalance) ||
                      (tradeType === 'SELL' && parsedQuantity > ownedShares)
                    }
                  >
                    {tradeLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Executing Order...
                      </>
                    ) : (
                      <>
                        <i className={`bi ${tradeType === 'BUY' ? 'bi-cart-check' : 'bi-cash'} me-1`}></i>
                        Place {tradeType} Order
                      </>
                    )}
                  </button>
                </form>

                {/* Current Holding Snapshot */}
                {userHolding && (
                  <div className="mt-4 pt-3 border-top">
                    <div className="fw-bold small text-muted mb-2">Your Current Position</div>
                    <div className="p-3 bg-light rounded-3 small">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Quantity Owned:</span>
                        <strong className="font-mono">{userHolding.quantity}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Avg Cost Basis:</span>
                        <strong className="font-mono">${userHolding.averageBuyPrice?.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>Current Value:</span>
                        <strong className="font-mono">
                          ${userHolding.currentValue?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Unrealized P/L:</span>
                        <strong
                          className={`font-mono ${
                            userHolding.profitLoss >= 0 ? 'text-success' : 'text-danger'
                          }`}
                        >
                          {userHolding.profitLoss >= 0 ? '+' : ''}${userHolding.profitLoss?.toFixed(2)} (
                          {userHolding.profitLossPercent?.toFixed(2)}%)
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <i className="bi bi-lock-fill fs-2 text-muted mb-2"></i>
                <h6>Log In to Trade</h6>
                <p className="text-muted small mb-3">
                  Sign in or create a free simulated trading account to trade {stock.symbol}.
                </p>
                <div className="d-grid gap-2">
                  <Link to="/login" className="btn btn-primary btn-sm">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-outline-secondary btn-sm">
                    Register Free
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
