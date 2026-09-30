import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';

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

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderService.getUserOrders();
        setOrders(data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">My Orders</h2>
          <p className="text-muted small mb-0">Track and view your past purchases</p>
        </div>
        <Link to="/products" className="btn btn-warning btn-sm fw-semibold">
          Shop More Products
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading orders...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : orders.length === 0 ? (
        <div className="card shadow-sm border-0 text-center p-5">
          <div className="fs-1 mb-2">📦</div>
          <h4>No orders yet</h4>
          <p className="text-muted mb-4">You haven't placed any orders yet. Discover our catalog!</p>
          <div>
            <Link to="/products" className="btn btn-warning fw-bold px-4 py-2">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          {orders.map((order) => {
            const orderItems = order.items && order.items.length > 0
              ? order.items
              : [
                  {
                    productId: order.productId,
                    size: order.size,
                    quantity: order.quantity,
                    price: order.price,
                    discount: order.discount,
                  },
                ];

            return (
              <div key={order._id} className="card border-0 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="card-header bg-light py-3 px-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div>
                    <span className="small text-muted d-block">ORDER PLACED</span>
                    <span className="fw-semibold">
                      {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="small text-muted d-block">TOTAL AMOUNT</span>
                    <span className="fw-bold text-dark">₹{order.totalAmount}</span>
                  </div>
                  <div>
                    <span className="small text-muted d-block">SHIP TO</span>
                    <span className="fw-semibold">{order.name}</span>
                  </div>
                  <div>
                    <span className="small text-muted d-block">ORDER ID</span>
                    <span className="font-monospace small">{order._id}</span>
                  </div>
                  <div>
                    <span className={`badge px-3 py-2 fw-semibold ${getStatusBadge(order.orderStatus)}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* Order Body */}
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-lg-8">
                      <div className="d-flex flex-column gap-3">
                        {orderItems.map((item, idx) => {
                          const prod = item.productId || {};
                          return (
                            <div key={idx} className="d-flex align-items-center gap-3">
                              <img
                                src={
                                  prod.mainImg ||
                                  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80'
                                }
                                alt={prod.title || 'Product'}
                                className="rounded border"
                                style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                              />
                              <div>
                                <h6 className="mb-1 fw-bold text-dark">
                                  {prod.title || 'Apparel Item'}
                                </h6>
                                <div className="text-muted small">
                                  Size: <strong>{item.size || 'M'}</strong> &bull; Quantity: <strong>{item.quantity || 1}</strong> &bull; Price: <strong>₹{item.price}</strong>
                                </div>
                                {item.discount > 0 && (
                                  <span className="badge bg-danger-subtle text-danger border border-danger-subtle small mt-1">
                                    {item.discount}% discount applied
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="col-lg-4 border-start-lg">
                      <div className="bg-light p-3 rounded-3 small">
                        <div className="fw-bold text-uppercase text-muted mb-2">Delivery Details</div>
                        <div className="mb-1">
                          <strong>Address:</strong> {order.address}, PIN: {order.pincode}
                        </div>
                        <div className="mb-1">
                          <strong>Contact:</strong> {order.mobile} ({order.email})
                        </div>
                        <div className="mb-1">
                          <strong>Payment Method:</strong> {order.paymentMethod}
                        </div>
                        {order.deliveryDate && (
                          <div className="text-primary mt-2">
                            <strong>Estimated Delivery:</strong>{' '}
                            {new Date(order.deliveryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
