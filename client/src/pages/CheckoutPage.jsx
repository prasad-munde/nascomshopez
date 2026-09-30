import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { orderService } from '../services/orderService';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.username || '',
    email: user?.email || '',
    mobile: '',
    address: '',
    pincode: '',
    paymentMethod: 'Cash on Delivery',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const items = cart?.items || [];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your cart is empty. Add products before placing an order.');
      return;
    }

    if (!formData.name || !formData.email || !formData.mobile || !formData.address || !formData.pincode) {
      setError('Please fill in all shipping details.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare order payload
      const orderPayload = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        address: formData.address,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        totalAmount: cart.total,
        items: items.map((it) => ({
          productId: it.productId,
          size: it.size,
          quantity: it.quantity,
          price: it.price,
          discount: it.discount,
        })),
        productId: items[0]?.productId,
        size: items[0]?.size,
        quantity: items[0]?.quantity,
        price: items[0]?.price,
        discount: items[0]?.discount,
      };

      const res = await orderService.createOrder(orderPayload);
      clearCart();
      setOrderSuccess(res.order);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  // If order was successfully placed, show Confirmation screen
  if (orderSuccess) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm p-4 p-md-5 mx-auto text-center" style={{ maxWidth: '600px' }}>
          <div className="fs-1 text-success mb-3">✅</div>
          <h2 className="fw-bold mb-2">Order Confirmed!</h2>
          <p className="text-muted">
            Thank you, <strong>{orderSuccess.name}</strong>. Your order has been placed successfully.
          </p>

          <div className="bg-light p-3 rounded-3 my-4 text-start small">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Order ID:</span>
              <span className="font-monospace fw-bold">{orderSuccess._id}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Payment Method:</span>
              <span className="fw-semibold">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Total Paid / Payable:</span>
              <span className="fw-bold fs-6">₹{orderSuccess.totalAmount}</span>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Estimated Delivery:</span>
              <span className="text-primary fw-semibold">
                {new Date(orderSuccess.deliveryDate).toLocaleDateString()}
              </span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-muted">Shipping Address:</span>
              <span>{orderSuccess.address}, PIN: {orderSuccess.pincode}</span>
            </div>
          </div>

          <div className="d-flex justify-content-center gap-3">
            <Link to="/orders" className="btn btn-warning fw-bold px-4">
              View My Orders
            </Link>
            <Link to="/products" className="btn btn-outline-dark px-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 pb-2 border-bottom">Checkout</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="card shadow-sm border-0 text-center p-5">
          <div className="fs-1 mb-2">🛒</div>
          <h4>Your cart is empty</h4>
          <p className="text-muted">Please add products to your cart before proceeding to checkout.</p>
          <div>
            <Link to="/products" className="btn btn-warning fw-bold">
              Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Shipping and Payment Form */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3">1. Shipping Address</h5>
              <form onSubmit={handlePlaceOrder}>
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. john@example.com"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Postal Pincode *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="e.g. 560001"
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Street Address *</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Apartment, house no., street name, landmark"
                      required
                    ></textarea>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">2. Payment Method</h5>
                <div className="mb-4">
                  <div className="form-check p-3 border rounded-3 mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="cod"
                      value="Cash on Delivery"
                      checked={formData.paymentMethod === 'Cash on Delivery'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold ms-2" htmlFor="cod">
                      💵 Cash on Delivery (COD)
                      <span className="d-block small text-muted fw-normal">
                        Pay cash when the package is delivered to your doorstep.
                      </span>
                    </label>
                  </div>

                  <div className="form-check p-3 border rounded-3">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="paymentMethod"
                      id="online"
                      value="Online Payment (simulated)"
                      checked={formData.paymentMethod === 'Online Payment (simulated)'}
                      onChange={handleChange}
                    />
                    <label className="form-check-label fw-semibold ms-2" htmlFor="online">
                      💳 Online Payment (simulated)
                      <span className="d-block small text-muted fw-normal">
                        Instant dummy payment confirmation for academic evaluation.
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-3 fw-bold text-dark fs-5 shadow-sm"
                  disabled={loading}
                >
                  {loading ? 'Placing Order...' : `Place Order (₹${cart.total})`}
                </button>
              </form>
            </div>
          </div>

          {/* Cart items review */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3 pb-2 border-bottom">Items in Order ({cart.count})</h5>

              <div className="d-flex flex-column gap-3 mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={item._id} className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src={item.mainImg}
                        alt={item.title}
                        className="rounded me-2 border"
                        style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="fw-semibold text-truncate small" style={{ maxWidth: '180px' }}>
                          {item.title}
                        </div>
                        <div className="small text-muted">
                          Size: {item.size} &times; {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="fw-bold small">₹{item.itemTotal}</div>
                  </div>
                ))}
              </div>

              <div className="bg-light p-3 rounded-3 small">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Subtotal</span>
                  <span>₹{cart.subtotal}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="d-flex justify-content-between mb-1 text-success">
                    <span>Discount</span>
                    <span>-₹{cart.discount}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Delivery</span>
                  <span className="text-success fw-bold">FREE</span>
                </div>
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold fs-6">
                  <span>Grand Total</span>
                  <span>₹{cart.total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
