import React from 'react';
import { Link } from 'react-router-dom';

const StockCard = ({ stock, onTradeClick }) => {
  const isPositive = stock.dailyChange >= 0;

  return (
    <div className="shopez-card shopez-card-hover p-3 h-100 d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <Link
              to={`/stocks/${stock.symbol}`}
              className="fw-bold fs-5 text-decoration-none text-dark hover-primary"
            >
              {stock.symbol}
            </Link>
            <div className="text-muted small text-truncate" style={{ maxWidth: '160px' }}>
              {stock.name}
            </div>
          </div>
          <span
            className="badge bg-light text-secondary border small text-uppercase"
            style={{ fontSize: '0.68rem' }}
          >
            {stock.sector}
          </span>
        </div>

        <div className="my-3">
          <div className="fs-4 fw-bold font-mono text-dark">
            ${stock.currentPrice?.toFixed(2)}
          </div>
          <div className="d-flex align-items-center gap-2 mt-1">
            <span className={isPositive ? 'badge-gain' : 'badge-loss'}>
              <i className={`bi ${isPositive ? 'bi-caret-up-fill' : 'bi-caret-down-fill'} me-1`}></i>
              {isPositive ? '+' : ''}
              {stock.dailyChange?.toFixed(2)} ({isPositive ? '+' : ''}
              {stock.dailyChangePercent?.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-top d-flex gap-2">
        <Link
          to={`/stocks/${stock.symbol}`}
          className="btn btn-outline-secondary btn-sm flex-grow-1"
        >
          Analysis
        </Link>
        {onTradeClick && (
          <button
            type="button"
            className="btn btn-primary btn-sm px-3 fw-semibold"
            onClick={() => onTradeClick(stock)}
          >
            Trade
          </button>
        )}
      </div>
    </div>
  );
};

export default StockCard;
