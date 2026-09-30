import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';

const STATUS_OPTIONS = ['Order Placed', 'Shipped', 'Delivered', 'Cancelled'];

const getStatusBadge = (status) => {
  switch (status) {
    case 'Order Placed':
      return 'bg-info text-dark';
    case 'Shipped':
      return 'bg-primary text-white';
    case 'Delivered':
      return 'bg-success text-white';
    case 'Cancelled':
      return 'bg-danger text-white';
    default:
      return 'bg-secondary text-white';
  }
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateMsg, setUpdateMsg] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminService.getOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      setUpdateMsg(null);
      await adminService.updateOrderStatus(orderId, newStatus);
      setUpdateMsg(`Order status updated to "${newStatus}"!`);
      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Manage Orders</h2>
          <p className="text-muted small mb-0">Inspect customer shipments and update delivery lifecycles</p>
        </div>
        <button className="btn btn-outline-dark btn-sm fw-semibold" onClick={fetchOrders}>
          🔄 Refresh Orders
        </button>
      </div>

      {updateMsg && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {updateMsg}
          <button type="button" className="btn-close" onClick={() => setUpdateMsg(null)}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <div className="card border-0 shadow-sm p-4">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-4 text-muted">No customer orders placed yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-center">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => {
                  const orderItems = o.items && o.items.length > 0 ? o.items : [o];
                  return (
                    <tr key={o._id}>
                      <td>
                        <span className="font-monospace small fw-bold">{o._id.substring(0, 8)}...</span>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="fw-bold">{o.name}</div>
                        <div className="small text-muted">{o.mobile}</div>
                        <div className="small text-muted">{o.address}, {o.pincode}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {orderItems.map((item, idx) => {
                            const prod = item.productId || {};
                            return (
                              <div key={idx} className="small">
                                &bull; {prod.title || 'Apparel Item'} (Size: {item.size || 'M'}, Qty: {item.quantity || 1})
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="fw-bold">₹{o.totalAmount}</td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span className={`badge px-2 py-1 ${getStatusBadge(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <select
                          className="form-select form-select-sm"
                          style={{ minWidth: '140px' }}
                          value={o.orderStatus}
                          disabled={updatingId === o._id}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
