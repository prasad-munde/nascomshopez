import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { stockService } from '../services/stockService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { AlertMessage } from '../components/AlertMessage';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'stocks' | 'transactions' | 'overview'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Users Management State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // Stocks Management State
  const [stocks, setStocks] = useState([]);
  const [stockSearch, setStockSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  // Stock Form State
  const [stockFormData, setStockFormData] = useState({
    symbol: '',
    name: '',
    sector: 'Technology',
    currentPrice: '',
    previousClose: '',
    marketCap: '',
    peRatio: '',
    description: '',
  });

  // Global Transactions State
  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);

  const fetchStats = async () => {
    try {
      const res = await adminService.getStats();
      if (res.success) setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers({
        search: userSearch.trim() || undefined,
        page: userPage,
        limit: 15,
      });
      if (res.success && res.data) {
        setUsers(res.data.users);
        setUserTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchStocks = async () => {
    try {
      const res = await stockService.getStocks({
        search: stockSearch.trim() || undefined,
        limit: 50,
      });
      if (res.success && res.data) {
        setStocks(res.data.stocks);
      }
    } catch (err) {
      console.error('Error fetching stocks:', err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await adminService.getTransactions({
        page: txPage,
        limit: 20,
      });
      if (res.success && res.data) {
        setTransactions(res.data.transactions);
        setTxTotalPages(res.data.pages || 1);
      }
    } catch (err) {
      console.error('Error fetching admin transactions:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchUsers(), fetchStocks(), fetchTransactions()]);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [userPage, userSearch]);

  useEffect(() => {
    if (activeTab === 'stocks') fetchStocks();
  }, [stockSearch]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
  }, [txPage]);

  // User Actions
  const handleToggleUserStatus = async (user) => {
    const newStatus = !user.isActive;
    const confirmMsg = `Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} user ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateUserStatus(user._id, newStatus);
      setAlert({
        type: 'success',
        message: `User ${user.name} is now ${newStatus ? 'active' : 'suspended'}.`,
      });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to update user status',
      });
    }
  };

  // Stock Actions
  const handleOpenAddStock = () => {
    setEditingStock(null);
    setStockFormData({
      symbol: '',
      name: '',
      sector: 'Technology',
      currentPrice: '',
      previousClose: '',
      marketCap: '',
      peRatio: '',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditStock = (stock) => {
    setEditingStock(stock);
    setStockFormData({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      marketCap: stock.marketCap,
      peRatio: stock.peRatio,
      description: stock.description || '',
    });
    setShowAddModal(true);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    try {
      if (editingStock) {
        await adminService.updateStock(editingStock._id, stockFormData);
        setAlert({ type: 'success', message: `Stock ${stockFormData.symbol} updated successfully.` });
      } else {
        await adminService.addStock(stockFormData);
        setAlert({ type: 'success', message: `Stock ${stockFormData.symbol} added successfully.` });
      }
      setShowAddModal(false);
      fetchStocks();
      fetchStats();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Error saving stock',
      });
    }
  };

  const handleDeleteStock = async (stock) => {
    if (!window.confirm(`Are you sure you want to delete stock ${stock.symbol}?`)) return;

    try {
      await adminService.deleteStock(stock._id);
      setAlert({ type: 'success', message: `Stock ${stock.symbol} deleted successfully.` });
      fetchStocks();
      fetchStats();
    } catch (err) {
      setAlert({
        type: 'danger',
        message: err.response?.data?.message || 'Cannot delete stock',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading Admin Management Console..." />;
  }

  const overview = stats?.overview || {};

  return (
    <div className="container-fluid px-3 px-lg-4 py-4">
      {/* Admin Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">
            <i className="bi bi-shield-lock-fill text-warning me-2"></i> Admin Command Center
          </h2>
          <div className="text-muted small">
            Platform governance, user management, and stock exchange administration
          </div>
        </div>
        <div className="mt-3 mt-md-0">
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold">
            <i className="bi bi-person-badge me-1"></i> Root Administrator
          </span>
        </div>
      </div>

      {alert.message && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ type: '', message: '' })}
        />
      )}

      {/* Admin KPI Ribbon */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="shopez-card p-3">
            <div className="metric-title">Total Users</div>
            <div className="metric-value text-dark font-mono">{overview.totalUsers || 0}</div>
            <div className="text-muted small">
              Active: <strong className="text-success">{overview.activeUsers || 0}</strong>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="shopez-card p-3">
            <div className="metric-title">Listed Stocks</div>
            <div className="metric-value text-primary font-mono">{overview.totalStocks || 0}</div>
            <div className="text-muted small">Tradable securities</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="shopez-card p-3">
            <div className="metric-title">Total Platform Volume</div>
            <div className="metric-value text-success font-mono">
              ${overview.totalTradingVolume?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-muted small">
              Across {overview.totalTransactions || 0} trades
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="shopez-card p-3">
            <div className="metric-title">Total User Capital</div>
            <div className="metric-value text-dark font-mono">
              ${overview.totalUserCashBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <div className="text-muted small">Liquid platform cash</div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <ul className="nav nav-pills mb-4 bg-white p-2 rounded-3 border">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="bi bi-people-fill me-1"></i> Users Management
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            <i className="bi bi-graph-up me-1"></i> Stock Securities Catalog
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link fw-semibold ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <i className="bi bi-activity me-1"></i> Global Trading Audit
          </button>
        </li>
      </ul>

      {/* Tab 1: User Management */}
      {activeTab === 'users' && (
        <div className="card shopez-card">
          <div className="card-header bg-white p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
            <h5 className="fw-bold mb-0">Registered Platform Users</h5>
            <div className="input-group" style={{ maxWidth: '320px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => {
                  setUserSearch(e.target.value);
                  setUserPage(1);
                }}
              />
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-shopez align-middle mb-0">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Role</th>
                  <th className="text-end">Virtual Balance</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th className="text-center">Manage</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="fw-bold">{u.name}</div>
                      <div className="text-muted small">{u.email}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          u.role === 'admin' ? 'bg-warning text-dark' : 'bg-primary-subtle text-primary'
                        } text-uppercase font-mono`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="text-end font-mono fw-bold">
                      ${u.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center">
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => handleToggleUserStatus(u)}
                        disabled={u.role === 'admin'}
                        title={u.role === 'admin' ? 'Cannot deactivate admin' : 'Toggle status'}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {userTotalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                Page {userPage} of {userTotalPages}
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                  disabled={userPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                  disabled={userPage >= userTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Stock Management */}
      {activeTab === 'stocks' && (
        <div className="card shopez-card">
          <div className="card-header bg-white p-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold mb-0">Tradable Stocks Catalog ({stocks.length})</h5>
              <button
                type="button"
                className="btn btn-primary btn-sm fw-semibold rounded-2"
                onClick={handleOpenAddStock}
              >
                <i className="bi bi-plus-lg me-1"></i> Add New Stock
              </button>
            </div>
            <div className="input-group" style={{ maxWidth: '300px' }}>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search symbol or name..."
                value={stockSearch}
                onChange={(e) => setStockSearch(e.target.value)}
              />
              <span className="input-group-text bg-light">
                <i className="bi bi-search"></i>
              </span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-shopez align-middle mb-0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th>Sector</th>
                  <th className="text-end">Current Price</th>
                  <th className="text-end">Prev Close</th>
                  <th className="text-end">Day Change</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stk) => {
                  const isPositive = stk.dailyChange >= 0;
                  return (
                    <tr key={stk._id}>
                      <td className="fw-bold font-mono text-primary">{stk.symbol}</td>
                      <td className="fw-semibold">{stk.name}</td>
                      <td>
                        <span className="badge bg-light text-secondary border small">
                          {stk.sector}
                        </span>
                      </td>
                      <td className="text-end font-mono fw-bold">${stk.currentPrice?.toFixed(2)}</td>
                      <td className="text-end font-mono text-muted">${stk.previousClose?.toFixed(2)}</td>
                      <td className={`text-end font-mono fw-semibold ${isPositive ? 'text-gain' : 'text-loss'}`}>
                        {isPositive ? '+' : ''}${stk.dailyChange?.toFixed(2)} ({isPositive ? '+' : ''}
                        {stk.dailyChangePercent?.toFixed(2)}%)
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleOpenEditStock(stk)}
                            title="Edit stock"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteStock(stk)}
                            title="Delete stock"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* Tab 3: Global Trading Activity Audit */}
      {activeTab === 'transactions' && (
        <div className="card shopez-card">
          <div className="card-header bg-white p-3 border-bottom">
            <h5 className="fw-bold mb-0">Global Platform Trading Feed</h5>
            <div className="text-muted small">Live stream of all participant order executions</div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover table-shopez align-middle mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Trader</th>
                  <th>Order</th>
                  <th>Symbol</th>
                  <th className="text-end">Quantity</th>
                  <th className="text-end">Executed Price</th>
                  <th className="text-end">Gross Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  return (
                    <tr key={tx._id}>
                      <td className="small text-muted">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <div className="fw-semibold">{tx.user?.name || 'User'}</div>
                        <div className="text-muted small">{tx.user?.email}</div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            isBuy ? 'bg-success' : 'bg-danger'
                          } font-mono px-2 py-1`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="font-mono fw-bold text-primary">{tx.symbol}</td>
                      <td className="text-end font-mono fw-semibold">{tx.quantity}</td>
                      <td className="text-end font-mono text-muted">${tx.price?.toFixed(2)}</td>
                      <td className={`text-end font-mono fw-bold ${isBuy ? 'text-dark' : 'text-success'}`}>
                        ${tx.totalAmount?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {txTotalPages > 1 && (
            <div className="p-3 border-top d-flex justify-content-between align-items-center">
              <span className="small text-muted">
                Page {txPage} of {txTotalPages}
              </span>
              <div className="btn-group btn-group-sm">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  disabled={txPage <= 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  disabled={txPage >= txTotalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Stock Modal */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(3px)' }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">
                  {editingStock ? `Edit Stock: ${editingStock.symbol}` : 'Add New Tradable Stock'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSaveStock}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Stock Symbol (Ticker)</label>
                      <input
                        type="text"
                        className="form-control text-uppercase font-mono fw-bold"
                        placeholder="e.g. NFLX"
                        value={stockFormData.symbol}
                        onChange={(e) => setStockFormData({ ...stockFormData, symbol: e.target.value })}
                        disabled={!!editingStock}
                        required
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">Company Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Netflix, Inc."
                        value={stockFormData.name}
                        onChange={(e) => setStockFormData({ ...stockFormData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Sector</label>
                      <select
                        className="form-select"
                        value={stockFormData.sector}
                        onChange={(e) => setStockFormData({ ...stockFormData, sector: e.target.value })}
                      >
                        <option value="Technology">Technology</option>
                        <option value="Semiconductors">Semiconductors</option>
                        <option value="Financial Services">Financial Services</option>
                        <option value="Consumer Cyclical">Consumer Cyclical</option>
                        <option value="Consumer Defensive">Consumer Defensive</option>
                        <option value="Automotive">Automotive</option>
                        <option value="Communication Services">Communication Services</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Energy">Energy</option>
                      </select>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Current Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control font-mono"
                        placeholder="150.00"
                        value={stockFormData.currentPrice}
                        onChange={(e) => setStockFormData({ ...stockFormData, currentPrice: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label fw-semibold small">Previous Close ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control font-mono"
                        placeholder="148.50"
                        value={stockFormData.previousClose}
                        onChange={(e) => setStockFormData({ ...stockFormData, previousClose: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Market Cap ($)</label>
                      <input
                        type="number"
                        className="form-control font-mono"
                        placeholder="e.g. 50000000000"
                        value={stockFormData.marketCap}
                        onChange={(e) => setStockFormData({ ...stockFormData, marketCap: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">P/E Ratio</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control font-mono"
                        placeholder="25.5"
                        value={stockFormData.peRatio}
                        onChange={(e) => setStockFormData({ ...stockFormData, peRatio: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold small">Company Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Overview of business operations, products, and services..."
                        value={stockFormData.description}
                        onChange={(e) => setStockFormData({ ...stockFormData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary fw-semibold px-4">
                    {editingStock ? 'Save Changes' : 'Create Stock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
