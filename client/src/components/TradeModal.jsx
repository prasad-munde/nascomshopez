import React, { useState, useEffect } from 'react';
import { tradeService } from '../services/tradeService';
import { useAuth } from '../hooks/useAuth';

const TradeModal = ({
  stock,
  initialType = 'BUY',
  userHoldingQuantity = 0,
  isOpen,
  onClose,
  onTradeComplete,
}) => {
  const { user, refreshUser } = useAuth();
  const [tradeType, setTradeType] = useState(initialType);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTradeType(initialType);
      setQuantity(1);
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, initialType, stock]);

  if (!isOpen || !stock) return null;

  const currentPrice = stock.currentPrice || 0;
  const totalCost = Number((currentPrice * (parseInt(quantity, 10) || 0)).toFixed(2));
  const availableBalance = user?.balance || 0;

  // Max shares user can buy
  const maxAffordableShares = Math.floor(availableBalance / currentPrice);
  // Max shares user can sell
  const maxSellableShares = userHoldingQuantity;

  const handleQuickQuantity = (qty) => {
    setQuantity(qty > 0 ? qty : 1);
    setError('');
  };

  const handleSetMax = () => {
    if (tradeType === 'BUY') {
      setQuantity(Math.max(1, maxAffordableShares));
    } else {
      setQuantity(Math.max(1, maxSellableShares));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const parsedQty = parseInt(quantity, 10);
    if (!parsedQty || parsedQty <= 0) {
      setError('Please enter a valid whole number greater than 0');
      return;
    }

    if (tradeType === 'BUY' && totalCost > availableBalance) {
      setError(`Insufficient funds. You need $${totalCost.toLocaleString()} but have $${availableBalance.toLocaleString()}`);
      return;
    }

    if (tradeType === 'SELL' && parsedQty > userHoldingQuantity) {
      setError(`Insufficient shares. You only own ${userHoldingQuantity} share(s) of ${stock.symbol}`);
      return;
    }

    try {
      setLoading(true);
      let res;
      if (tradeType === 'BUY') {
        res = await tradeService.buyStock(stock.symbol, parsedQty);
      } else {
        res = await tradeService.sellStock(stock.symbol, parsedQty);
      }

      await refreshUser();
      setSuccessMsg(res.message || 'Order executed successfully!');
      setTimeout(() => {
        if (onTradeComplete) onTradeComplete(res);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Trade execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content shadow-lg border-0 rounded-4">
          <div className="modal-header border-0 pb-0">
            <div>
              <h5 className="modal-title fw-bold">
                Trade {stock.symbol}
                <span className="ms-2 fs-6 fw-normal text-muted">({stock.name})</span>
              </h5>
              <div className="small text-muted">
                Market Price:{' '}
                <span className="fw-bold font-mono text-dark">
                  ${currentPrice.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <div className="modal-body pt-3">
            {/* Buy / Sell Tabs */}
            <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-3">
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-2 fw-bold ${tradeType === 'BUY' ? 'active bg-success text-white' : 'text-muted'}`}
                  onClick={() => {
                    setTradeType('BUY');
                    setError('');
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-cart-plus me-1"></i> Buy
                </button>
              </li>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link py-2 fw-bold ${tradeType === 'SELL' ? 'active bg-danger text-white' : 'text-muted'}`}
                  onClick={() => {
                    setTradeType('SELL');
                    setError('');
                  }}
                  disabled={loading}
                >
                  <i className="bi bi-cart-dash me-1"></i> Sell
                </button>
              </li>
            </ul>

            {/* Account Context Details */}
            <div className="bg-light p-3 rounded-3 mb-3 small">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">Available Cash:</span>
                <span className="fw-bold font-mono text-success">
                  ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Your Holdings:</span>
                <span className="fw-bold font-mono">
                  {userHoldingQuantity} share{userHoldingQuantity !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-exclamation-circle-fill"></i>
                <div>{error}</div>
              </div>
            )}

            {successMsg && (
              <div className="alert alert-success py-2 small d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill"></i>
                <div>{successMsg}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small text-muted">Number of Shares</label>
                <div className="input-group">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuickQuantity(Math.max(1, (parseInt(quantity, 10) || 1) - 1))}
                    disabled={loading || quantity <= 1}
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
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => handleQuickQuantity((parseInt(quantity, 10) || 0) + 1)}
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="d-flex gap-2 mb-3">
                {[1, 5, 10, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className="btn btn-outline-secondary btn-sm flex-grow-1"
                    onClick={() => handleQuickQuantity(preset)}
                    disabled={loading}
                  >
                    +{preset}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm flex-grow-1 fw-bold"
                  onClick={handleSetMax}
                  disabled={loading || (tradeType === 'BUY' ? maxAffordableShares <= 0 : maxSellableShares <= 0)}
                >
                  MAX
                </button>
              </div>

              {/* Order Summary Box */}
              <div className="border border-secondary border-opacity-25 rounded-3 p-3 mb-3">
                <div className="d-flex justify-content-between text-muted small mb-1">
                  <span>Price per Share:</span>
                  <span className="font-mono">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Estimated Fee:</span>
                  <span className="text-success fw-bold">$0.00 (Commission Free)</span>
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
                    ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="d-grid gap-2">
                <button
                  type="submit"
                  className={`btn py-2 fw-bold text-white shadow-sm ${
                    tradeType === 'BUY' ? 'btn-success' : 'btn-danger'
                  }`}
                  disabled={
                    loading ||
                    !quantity ||
                    parseInt(quantity, 10) <= 0 ||
                    (tradeType === 'BUY' && totalCost > availableBalance) ||
                    (tradeType === 'SELL' && parseInt(quantity, 10) > userHoldingQuantity)
                  }
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Executing Order...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${tradeType === 'BUY' ? 'bi-bag-check-fill' : 'bi-cash-coin'} me-1`}></i>
                      Confirm {tradeType} Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
