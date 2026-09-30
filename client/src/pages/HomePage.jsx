import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { stockService } from '../services/stockService';
import { useAuth } from '../hooks/useAuth';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [marketStats, setMarketStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await stockService.getMarketOverview();
        if (res.success) {
          setMarketStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load market overview', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="bg-dark text-white py-5 position-relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)' }}>
        <div className="container py-lg-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-50 px-3 py-2 rounded-pill fw-semibold mb-3">
                <span className="ticker-pulse"></span> Virtual Stock Trading Platform
              </span>
              <h1 className="display-4 fw-extrabold tracking-tight mb-3">
                Master the Markets with <span className="text-primary">ShopEZ</span>
              </h1>
              <p className="lead text-secondary mb-4" style={{ fontSize: '1.2rem', lineHeight: '1.7' }}>
                Practice trading top stocks like Apple, NVIDIA, and Microsoft in a realistic, zero-risk simulation environment. Get started immediately with <strong>$100,000</strong> in virtual capital.
              </p>
              <div className="d-flex flex-wrap gap-3">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn btn-primary btn-lg px-4 fw-bold rounded-3 shadow">
                    <i className="bi bi-speedometer2 me-2"></i> Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn btn-primary btn-lg px-4 fw-bold rounded-3 shadow">
                      Start Trading Free <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                    <Link to="/login" className="btn btn-outline-light btn-lg px-4 fw-semibold rounded-3">
                      Sign In
                    </Link>
                  </>
                )}
                <Link to="/market" className="btn btn-link text-light text-decoration-none px-3 py-2 fw-semibold">
                  <i className="bi bi-graph-up me-1"></i> View Live Market
                </Link>
              </div>

              {/* Demo Accounts Callout */}
              <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
                <div className="small text-muted mb-2">Instant Demo Logins Available:</div>
                <div className="d-flex flex-wrap gap-3 small">
                  <span className="badge bg-secondary bg-opacity-50 text-light p-2">
                    <strong className="text-info">Trader:</strong> trader@shopez.com / TraderPassword123!
                  </span>
                  <span className="badge bg-secondary bg-opacity-50 text-light p-2">
                    <strong className="text-warning">Admin:</strong> admin@shopez.com / AdminPassword123!
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Preview Widget */}
            <div className="col-lg-5">
              <div className="card bg-slate-900 border border-secondary border-opacity-25 rounded-4 shadow-lg text-white p-4" style={{ background: '#1e293b' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="fw-bold fs-5">
                    <i className="bi bi-lightning-charge-fill text-warning me-1"></i> Market Movers
                  </div>
                  <span className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-25">
                    Live Simulator
                  </span>
                </div>

                {loading ? (
                  <div className="py-4 text-center text-muted">Loading market movers...</div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {marketStats?.topGainers?.slice(0, 4).map((stock) => (
                      <Link
                        key={stock.symbol}
                        to={`/stocks/${stock.symbol}`}
                        className="d-flex justify-content-between align-items-center p-2 rounded-3 text-decoration-none text-white hover-bg-dark"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary px-2 py-1 font-mono fw-bold">
                            {stock.symbol}
                          </span>
                          <span className="small text-truncate" style={{ maxWidth: '140px' }}>
                            {stock.name}
                          </span>
                        </div>
                        <div className="text-end font-mono">
                          <div className="fw-bold">${stock.currentPrice?.toFixed(2)}</div>
                          <div className="text-success small fw-semibold">
                            +{stock.dailyChangePercent?.toFixed(2)}%
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
                  <Link to="/market" className="text-decoration-none text-primary fw-semibold small">
                    Explore All Available Stocks <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-5 bg-white border-bottom">
        <div className="container py-4">
          <div className="text-center max-w-xl mx-auto mb-5">
            <h2 className="fw-bold">Everything You Need to Simulate the Stock Market</h2>
            <p className="text-muted">Built for learning, testing strategies, and experiencing stock trading dynamics.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-light h-100">
                <div className="rounded-3 bg-primary text-white d-inline-flex p-3 mb-3">
                  <i className="bi bi-wallet2 fs-3"></i>
                </div>
                <h4 className="fw-bold mb-2">$100k Virtual Balance</h4>
                <p className="text-muted mb-0">
                  Every trader starts with $100,000 in virtual funds. Test buy/sell orders without worrying about real financial losses.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-light h-100">
                <div className="rounded-3 bg-success text-white d-inline-flex p-3 mb-3">
                  <i className="bi bi-graph-up-arrow fs-3"></i>
                </div>
                <h4 className="fw-bold mb-2">Dynamic Real-Time Pricing</h4>
                <p className="text-muted mb-0">
                  Simulated price ticks based on sector volatility, market drift, and historical trends for realistic order execution.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 rounded-4 border bg-light h-100">
                <div className="rounded-3 bg-warning text-dark d-inline-flex p-3 mb-3">
                  <i className="bi bi-pie-chart-fill fs-3"></i>
                </div>
                <h4 className="fw-bold mb-2">Automated Portfolio Analytics</h4>
                <p className="text-muted mb-0">
                  Track unrealized profit/loss, average cost basis, portfolio asset allocation weights, and full execution history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
