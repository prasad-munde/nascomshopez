import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { stockService } from '../services/stockService';
import { portfolioService } from '../services/portfolioService';
import { useAuth } from '../hooks/useAuth';
import StockCard from '../components/StockCard';
import TradeModal from '../components/TradeModal';
import { LoadingSpinner } from '../components/LoadingSpinner';

const MarketPage = () => {
  const { isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sortBy, setSortBy] = useState('volume');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [sectorsList, setSectorsList] = useState([]);
  const [userHoldings, setUserHoldings] = useState({});

  // Trade Modal
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [tradeType, setTradeType] = useState('BUY');

  const fetchStocks = async () => {
    try {
      const res = await stockService.getStocks({
        search,
        sector: sector === 'All' ? undefined : sector,
        sortBy,
        sortOrder,
        limit: 50,
      });

      if (res.success && res.data) {
        setStocks(res.data.stocks);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectorsAndHoldings = async () => {
    try {
      const overviewRes = await stockService.getMarketOverview();
      if (overviewRes.success && overviewRes.data?.sectors) {
        setSectorsList(['All', ...overviewRes.data.sectors]);
      }

      if (isAuthenticated) {
        const portRes = await portfolioService.getPortfolio();
        if (portRes.success && portRes.data?.holdings) {
          const map = {};
          portRes.data.holdings.forEach((h) => {
            map[h.symbol] = h.quantity;
          });
          setUserHoldings(map);
        }
      }
    } catch (err) {
      console.error('Error fetching sectors or holdings:', err);
    }
  };

  useEffect(() => {
    fetchSectorsAndHoldings();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchStocks();
    // Live update poll every 6s
    const pollTimer = setInterval(() => {
      fetchStocks();
    }, 6000);
    return () => clearInterval(pollTimer);
  }, [search, sector, sortBy, sortOrder]);

  const handleOpenTrade = (stock, type = 'BUY') => {
    setSelectedStock(stock);
    setTradeType(type);
    setTradeModalOpen(true);
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Stock Market Explorer</h2>
          <div className="text-muted small d-flex align-items-center gap-2">
            <span className="ticker-pulse"></span>
            Real-Time Simulated Market Data &bull; Auto-updating every 6s
          </div>
        </div>

        {/* View mode toggle */}
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="bi bi-table"></i> Table
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="bi bi-grid"></i> Cards
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card shopez-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          {/* Search box */}
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light text-muted border-end-0">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by Symbol (e.g. AAPL) or Company name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearch('')}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>

          {/* Sector Filter */}
          <div className="col-6 col-md-4">
            <select
              className="form-select"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
            >
              {sectorsList.length > 0 ? (
                sectorsList.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec === 'All' ? 'All Sectors' : sec}
                  </option>
                ))
              ) : (
                <option value="All">All Sectors</option>
              )}
            </select>
          </div>

          {/* Sort Selector */}
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
            >
              <option value="volume-desc">Highest Volume</option>
              <option value="dailyChangePercent-desc">Top Gainers (%)</option>
              <option value="dailyChangePercent-asc">Top Losers (%)</option>
              <option value="currentPrice-desc">Highest Price</option>
              <option value="currentPrice-asc">Lowest Price</option>
              <option value="symbol-asc">Symbol (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Stock Content */}
      {loading && stocks.length === 0 ? (
        <LoadingSpinner text="Loading market data..." />
      ) : stocks.length === 0 ? (
        <div className="card shopez-card text-center py-5">
          <i className="bi bi-search fs-1 text-muted"></i>
          <h5 className="mt-3 fw-bold">No stocks found</h5>
          <p className="text-muted small">Try searching for a different ticker or clearing the filter.</p>
          <div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                setSearch('');
                setSector('All');
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid Card View */
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-3">
          {stocks.map((stock) => (
            <div className="col" key={stock._id}>
              <StockCard
                stock={stock}
                onTradeClick={isAuthenticated ? (s) => handleOpenTrade(s, 'BUY') : null}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="card shopez-card">
          <div className="table-responsive">
            <table className="table table-hover table-shopez align-middle mb-0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company</th>
                  <th>Sector</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">24h Change</th>
                  <th className="text-end">24h %</th>
                  <th className="text-end d-none d-md-table-cell">Volume</th>
                  <th className="text-end d-none d-lg-table-cell">Market Cap</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => {
                  const isPositive = stock.dailyChange >= 0;
                  const ownedQty = userHoldings[stock.symbol] || 0;

                  return (
                    <tr key={stock._id}>
                      <td>
                        <Link
                          to={`/stocks/${stock.symbol}`}
                          className="fw-bold font-mono text-decoration-none text-primary fs-6"
                        >
                          {stock.symbol}
                        </Link>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{stock.name}</div>
                        {ownedQty > 0 && (
                          <span className="badge bg-primary-subtle text-primary border border-primary-subtle small font-mono" style={{ fontSize: '0.65rem' }}>
                            You own {ownedQty} shs
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-secondary border small">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="text-end font-mono fw-bold fs-6">
                        ${stock.currentPrice?.toFixed(2)}
                      </td>
                      <td className={`text-end font-mono fw-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}${stock.dailyChange?.toFixed(2)}
                      </td>
                      <td className="text-end">
                        <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
                          <i className={`bi ${isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} me-1`}></i>
                          {isPositive ? '+' : ''}{stock.dailyChangePercent?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-end font-mono text-muted d-none d-md-table-cell small">
                        {stock.volume?.toLocaleString()}
                      </td>
                      <td className="text-end font-mono text-muted d-none d-lg-table-cell small">
                        ${(stock.marketCap / 1e9).toFixed(1)}B
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <Link
                            to={`/stocks/${stock.symbol}`}
                            className="btn btn-outline-secondary"
                            title="View Chart &amp; Details"
                          >
                            Details
                          </Link>
                          {isAuthenticated && (
                            <button
                              className="btn btn-primary fw-semibold"
                              onClick={() => handleOpenTrade(stock, 'BUY')}
                              title="Trade this stock"
                            >
                              Trade
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {selectedStock && (
        <TradeModal
          stock={selectedStock}
          initialType={tradeType}
          userHoldingQuantity={userHoldings[selectedStock.symbol] || 0}
          isOpen={tradeModalOpen}
          onClose={() => setTradeModalOpen(false)}
          onTradeComplete={() => {
            fetchSectorsAndHoldings();
            fetchStocks();
          }}
        />
      )}
    </div>
  );
};

export default MarketPage;
