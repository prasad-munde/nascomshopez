import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';

const CartPage = () => {
  const { cart, loading, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
          <div className="fs-1 mb-3">🛒</div>
          <h4 className="fw-bold">Your Cart is waiting!</h4>
          <p className="text-muted">Please log in to view and manage your shopping cart.</p>
          <Link to="/login" className="btn btn-warning fw-bold px-4 py-2 mt-2">
            Sign In to Account
          </Link>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 pb-2 border-bottom">Shopping Cart</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading cart...</span>
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="card shadow-sm border-0 text-center p-5">
          <div className="fs-1 mb-3">🛍️</div>
          <h4 className="fw-bold">Your cart is empty</h4>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
          <div>
            <Link to="/products" className="btn btn-warning fw-bold px-4 py-2">
              Explore Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart Items List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-3">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" style={{ width: '40%' }}>Product</th>
                      <th scope="col">Size</th>
                      <th scope="col" className="text-center">Quantity</th>
                      <th scope="col" className="text-end">Total</th>
                      <th scope="col" className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={item.mainImg}
                              alt={item.title}
                              className="rounded me-3 border"
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                            />
                            <div>
                              <Link
                                to={`/products/${item.productId}`}
                                className="text-decoration-none text-dark fw-semibold d-block text-truncate"
                                style={{ maxWidth: '200px' }}
                              >
                                {item.title}
                              </Link>
                              <div className="small text-muted">
                                ₹{Math.round(item.price * (1 - (item.discount || 0) / 100))}
                                {item.discount > 0 && (
                                  <span className="ms-1 text-decoration-line-through">
                                    ₹{item.price}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{item.size}</span>
                        </td>
                        <td>
                          <div className="d-flex justify-content-center align-items-center gap-1">
                            <button
                              className="btn btn-sm btn-outline-secondary px-2 py-0"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="fw-bold px-2">{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary px-2 py-0"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          ₹{item.itemTotal}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Remove item"
                            onClick={() => removeFromCart(item._id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3">
              <Link to="/products" className="text-decoration-none text-muted fw-semibold">
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4">
              <h5 className="fw-bold mb-3 pb-2 border-bottom">Order Summary</h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Total Items</span>
                <span className="fw-semibold">{cart.count}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span>₹{cart.subtotal}</span>
              </div>

              {cart.discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>Product Discount</span>
                  <span>-₹{cart.discount}</span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Delivery Charges</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between align-items-baseline mb-4">
                <span className="fs-5 fw-bold">Total Amount</span>
                <span className="fs-4 fw-bold text-dark">₹{cart.total}</span>
              </div>

              <button
                className="btn btn-warning w-100 py-2 fw-bold text-dark"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
