import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

const ProfilePage = () => {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4 pb-2 border-bottom">My Profile</h2>

      <div className="row g-4">
        {/* User Card */}
        <div className="col-md-5 col-lg-4">
          <div className="card border-0 shadow-sm text-center p-4">
            <div
              className="rounded-circle bg-warning text-dark mx-auto d-flex align-items-center justify-content-center fw-bold fs-1 mb-3"
              style={{ width: '90px', height: '90px' }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </div>
            <h4 className="fw-bold mb-1">{user?.username}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>

            <span className={`badge mx-auto px-3 py-2 ${isAdmin ? 'bg-primary' : 'bg-secondary'}`}>
              Role: {user?.userType || 'USER'}
            </span>

            <hr className="my-4" />

            <button className="btn btn-outline-danger w-100 fw-semibold" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="col-md-7 col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-3">Account Overview</h5>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-muted small">Items in Cart</div>
                  <div className="fs-3 fw-bold text-dark">{cart?.count || 0}</div>
                  <Link to="/cart" className="small text-decoration-none text-warning fw-semibold">
                    View Cart &rarr;
                  </Link>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <div className="text-muted small">My Orders</div>
                  <div className="fs-3 fw-bold text-dark">📦</div>
                  <Link to="/orders" className="small text-decoration-none text-warning fw-semibold">
                    Track Orders &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {isAdmin && (
            <div className="card border-warning bg-warning bg-opacity-10 shadow-sm p-4">
              <h5 className="fw-bold text-dark mb-2">Admin Center</h5>
              <p className="text-muted small mb-3">
                You have administrative access to manage product catalogs, inspect customers, and change order delivery statuses.
              </p>
              <div className="d-flex gap-2 flex-wrap">
                <Link to="/admin" className="btn btn-dark btn-sm">
                  Dashboard
                </Link>
                <Link to="/admin/products" className="btn btn-dark btn-sm">
                  Manage Products
                </Link>
                <Link to="/admin/orders" className="btn btn-dark btn-sm">
                  Manage Orders
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
