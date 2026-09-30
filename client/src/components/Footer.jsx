import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-shopez">
      <div className="container py-3">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <span className="fs-5">📈</span>
              <span className="fw-bold text-white">ShopEZ Stock Trading Simulation</span>
              <span className="badge bg-secondary text-light px-2" style={{ fontSize: '0.65rem' }}>
                v1.0.0
              </span>
            </div>
            <div className="text-secondary small">
              Real-time simulated stock market platform. Practice investing with zero financial risk.
            </div>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3 small mb-1">
              <Link to="/market" className="text-decoration-none text-light opacity-75 hover-opacity-100">
                Market
              </Link>
              <Link to="/portfolio" className="text-decoration-none text-light opacity-75 hover-opacity-100">
                Portfolio
              </Link>
              <Link to="/transactions" className="text-decoration-none text-light opacity-75 hover-opacity-100">
                Orders
              </Link>
            </div>
            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} ShopEZ. All rights reserved. Simulated trading platform.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
