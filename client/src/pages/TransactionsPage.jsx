import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { LoadingSpinner } from '../components/LoadingSpinner';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [symbolSearch, setSymbolSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await transactionService.getTransactions({
        type: filterType === 'ALL' ? undefined : filterType,
        symbol: symbolSearch.trim() || undefined,
        page,
        limit: 15,
      });

      if (res.success && res.data) {
        setTransactions(res.data.transactions);
        setTotalPages(res.data.pages || 1);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filterType, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Transaction History</h2>
          <div className="text-muted small">Complete audit trail of all buy and sell order executions</div>
        </div>
        <div className="text-muted small">
          Total Orders: <strong className="text-dark font-mono">{totalCount}</strong>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card shopez-card p-3 mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-12 col-md-6">
            <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by Stock Symbol (e.g. AAPL)..."
                value={symbolSearch}
                onChange={(e) => setSymbolSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-outline-secondary px-3">
                <i className="bi bi-search"></i>
              </button>
              {symbolSearch && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSymbolSearch('');
                    setPage(1);
                    fetchTransactions();
                  }}
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <div className="col-12 col-md-6 d-flex justify-content-md-end">
            <div className="btn-group" role="group">
              {['ALL', 'BUY', 'SELL'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`btn btn-sm px-3 fw-semibold ${
                    filterType === type ? 'btn-primary' : 'btn-outline-secondary'
                  }`}
                  onClick={() => {
                    setFilterType(type);
                    setPage(1);
                  }}
                >
                  {type === 'ALL' ? 'All Orders' : type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card shopez-card">
        {loading ? (
          <LoadingSpinner text="Fetching transaction logs..." />
        ) : transactions.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-receipt fs-1 text-muted"></i>
            <h5 className="mt-3 fw-bold">No transactions found</h5>
            <p className="text-muted small">No order records matched your current filter criteria.</p>
            <Link to="/market" className="btn btn-primary btn-sm">
              Place a Trade
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover table-shopez align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date &amp; Time</th>
                    <th>Type</th>
                    <th>Symbol</th>
                    <th>Stock Name</th>
                    <th className="text-end">Shares</th>
                    <th className="text-end">Execution Price</th>
                    <th className="text-end">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isBuy = tx.type === 'BUY';
                    const txDate = new Date(tx.timestamp);

                    return (
                      <tr key={tx._id}>
                        <td className="small text-muted">
                          <div>{txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.72rem' }}>{txDate.toLocaleTimeString()}</div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isBuy ? 'bg-success' : 'bg-danger'
                            } font-mono px-2 py-1`}
                          >
                            <i className={`bi ${isBuy ? 'bi-arrow-down-left' : 'bi-arrow-up-right'} me-1`}></i>
                            {tx.type}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/stocks/${tx.symbol}`}
                            className="fw-bold font-mono text-decoration-none text-primary"
                          >
                            {tx.symbol}
                          </Link>
                        </td>
                        <td className="text-truncate" style={{ maxWidth: '180px' }}>
                          {tx.stockName}
                        </td>
                        <td className="text-end font-mono fw-semibold">{tx.quantity}</td>
                        <td className="text-end font-mono text-muted">${tx.price?.toFixed(2)}</td>
                        <td className={`text-end font-mono fw-bold fs-6 ${isBuy ? 'text-dark' : 'text-success'}`}>
                          ${tx.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-3 border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  Page {page} of {totalPages}
                </span>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    Previous
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
