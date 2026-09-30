import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/adminService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, usersData] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
        ]);
        setStats(statsData);
        setUsers(usersData || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load admin stats');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted small mb-0">Overview of ShopEZ operations, inventory, and registered users</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/admin/products" className="btn btn-warning fw-semibold btn-sm">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="btn btn-outline-dark fw-semibold btn-sm">
            Manage Orders
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading admin dashboard...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="row g-3 mb-4">
            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100 bg-light">
                <div className="text-muted small text-uppercase fw-bold">Total Revenue</div>
                <div className="fs-3 fw-bold text-success my-1">
                  ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
                </div>
                <div className="small text-muted">From completed orders</div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100 bg-light">
                <div className="text-muted small text-uppercase fw-bold">Total Orders</div>
                <div className="fs-3 fw-bold text-dark my-1">{stats?.totalOrders || 0}</div>
                <Link to="/admin/orders" className="small text-warning text-decoration-none fw-semibold">
                  View all orders &rarr;
                </Link>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100 bg-light">
                <div className="text-muted small text-uppercase fw-bold">Active Products</div>
                <div className="fs-3 fw-bold text-dark my-1">{stats?.totalProducts || 0}</div>
                <Link to="/admin/products" className="small text-warning text-decoration-none fw-semibold">
                  Manage catalog &rarr;
                </Link>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="card border-0 shadow-sm p-3 h-100 bg-light">
                <div className="text-muted small text-uppercase fw-bold">Registered Customers</div>
                <div className="fs-3 fw-bold text-dark my-1">{stats?.totalUsers || 0}</div>
                <div className="small text-muted">Excluding admin accounts</div>
              </div>
            </div>
          </div>

          {/* Orders by Status */}
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3">Order Status Distribution</h5>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="p-3 border rounded-3 text-center border-info">
                  <div className="small text-muted">Order Placed</div>
                  <div className="fs-4 fw-bold text-info">
                    {stats?.statusCounts?.['Order Placed'] || 0}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 border rounded-3 text-center border-primary">
                  <div className="small text-muted">Shipped</div>
                  <div className="fs-4 fw-bold text-primary">
                    {stats?.statusCounts?.['Shipped'] || 0}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 border rounded-3 text-center border-success">
                  <div className="small text-muted">Delivered</div>
                  <div className="fs-4 fw-bold text-success">
                    {stats?.statusCounts?.['Delivered'] || 0}
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="p-3 border rounded-3 text-center border-danger">
                  <div className="small text-muted">Cancelled</div>
                  <div className="fs-4 fw-bold text-danger">
                    {stats?.statusCounts?.['Cancelled'] || 0}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Users Table */}
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-bold mb-3">Registered Users</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Username</th>
                    <th>Email Address</th>
                    <th>User Role</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="fw-semibold">{u.username}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={`badge ${
                            u.userType === 'ADMIN' ? 'bg-primary' : 'bg-secondary'
                          }`}
                        >
                          {u.userType}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
