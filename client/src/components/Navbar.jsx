import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cart?.count || 0;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4 text-warning" to="/">
          <span className="me-2">🛍️</span>
          <span>ShopEZ</span>
        </Link>

        {/* Mobile toggle button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#shopEzNavbar"
          aria-controls="shopEzNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links */}
        <div className="collapse navbar-collapse" id="shopEzNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link px-3" to="/products">
                Products
              </NavLink>
            </li>

            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className="nav-link px-3" to="/orders">
                  My Orders
                </NavLink>
              </li>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle text-warning fw-semibold px-3"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  ⚡ Admin
                </a>
                <ul className="dropdown-menu shadow border-0">
                  <li>
                    <Link className="dropdown-item" to="/admin">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/products">
                      Manage Products
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item" to="/admin/orders">
                      Manage Orders
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-center gap-3">
            {/* Cart Link with Badge */}
            <Link to="/cart" className="btn btn-outline-light position-relative px-3 py-1">
              <span>🛒 Cart</span>
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark fw-bold">
                  {cartCount}
                  <span className="visually-hidden">items in cart</span>
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-warning dropdown-toggle d-flex align-items-center gap-2 fw-semibold px-3 py-1 text-dark"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span
                    className="rounded-circle bg-dark text-warning d-inline-flex justify-content-center align-items-center"
                    style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}
                  >
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                  <span className="text-truncate" style={{ maxWidth: '120px' }}>
                    {user?.username || 'Account'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                  <li className="px-3 py-2 border-bottom">
                    <div className="fw-bold">{user?.username}</div>
                    <div className="text-muted small">{user?.email}</div>
                    <span className="badge bg-secondary mt-1">{user?.userType || 'USER'}</span>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/profile">
                      👤 My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2" to="/orders">
                      📦 My Orders
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link className="dropdown-item py-2 text-warning fw-semibold" to="/admin">
                        ⚡ Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item py-2 text-danger fw-semibold" onClick={handleLogout}>
                      🚪 Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-warning btn-sm px-3 fw-semibold">
                  Login
                </Link>
                <Link to="/register" className="btn btn-warning btn-sm px-3 fw-semibold text-dark">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
